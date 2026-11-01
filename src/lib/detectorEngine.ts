/**
 * Main-thread wrapper around the detector inference worker.
 *
 * Keeps a single worker instance alive for the session, serializes runs
 * (a warm-up never blocks or fails a real analysis), and forwards granular
 * progress (model download, digest verification, inference).
 */
import type { LocalDetectorSignals } from "./detectorModels";

export type DetectorProgress = {
  stage: "download" | "verify" | "load" | "infer";
  label: string;
  percent: number | null;
};

export type DetectorRunResult =
  | { status: "measured"; signals: LocalDetectorSignals }
  | { status: "failed"; reason: string };

let worker: Worker | null = null;
let workerFailed = false;

type Pending = {
  resolve: (result: DetectorRunResult | "warm-done") => void;
  onProgress?: (progress: DetectorProgress) => void;
};

let pending: Pending | null = null;
let queue: Promise<unknown> = Promise.resolve();

function stageLabel(stage: DetectorProgress["stage"], modelShortName: string): string {
  switch (stage) {
    case "download": return `Downloading ${modelShortName} weights`;
    case "verify": return `Verifying ${modelShortName} SHA-256`;
    case "load": return `Loading ${modelShortName} into runtime`;
    case "infer": return `Running ${modelShortName} inference`;
  }
}

function getWorker(): Worker {
  if (workerFailed) throw new Error("Local detector engine is unavailable in this browser.");
  if (worker) return worker;
  worker = new Worker(new URL("../workers/detector.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent) => {
    const data = event.data as
      | { type: "stage"; stage: DetectorProgress["stage"]; modelShortName: string; percent: number | null }
      | { type: "done"; signals: LocalDetectorSignals }
      | { type: "warm-done" }
      | { type: "error"; message: string };
    const current = pending;
    pending = null;
    if (!current) return;
    if (data.type === "stage" && current.onProgress) {
      current.onProgress({ stage: data.stage, label: stageLabel(data.stage, data.modelShortName), percent: data.percent });
      pending = current;
    } else if (data.type === "done") {
      current.onProgress?.({ stage: "infer", label: "Detector inference complete", percent: 1 });
      current.resolve({ status: "measured", signals: data.signals });
    } else if (data.type === "warm-done") {
      current.resolve("warm-done");
    } else if (data.type === "error") {
      current.resolve({ status: "failed", reason: data.message });
    }
  };
  worker.onerror = (event) => {
    workerFailed = true;
    worker = null;
    if (pending) {
      const current = pending;
      pending = null;
      current.resolve({ status: "failed", reason: event.message || "Local detector engine failed to start." });
    }
  };
  return worker;
}

/** Serializes worker jobs so a background warm-up and a live analysis queue instead of racing. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function postJob(message: { type: "detect"; file: File } | { type: "warm" }, onProgress?: (progress: DetectorProgress) => void): Promise<DetectorRunResult | "warm-done"> {
  const localWorker = getWorker();
  return new Promise<DetectorRunResult | "warm-done">((resolve) => {
    pending = { resolve, onProgress };
    localWorker.postMessage(message);
  });
}

/**
 * Runs every pinned detector against one image file on-device.
 * Never throws: a failure resolves as { status: "failed" } so the rest of
 * the assessment pipeline can continue and disclose the gap honestly.
 */
export function runLocalDetectors(file: File, onProgress: (progress: DetectorProgress) => void): Promise<DetectorRunResult> {
  if (!(file.type || "").startsWith("image/")) {
    return Promise.resolve({ status: "failed", reason: "Local detectors apply to still images only." });
  }
  return enqueue(async () => {
    try {
      return (await postJob({ type: "detect", file }, onProgress)) as DetectorRunResult;
    } catch (error) {
      return { status: "failed", reason: error instanceof Error ? error.message : "Local detector engine failed." };
    }
  });
}

let warmed = false;

/**
 * Downloads and verifies the pinned model weights during idle time so the
 * first real analysis does not wait on a network transfer.
 */
export function warmDetectorCache(): void {
  if (warmed || typeof window === "undefined") return;
  warmed = true;
  window.setTimeout(() => {
    enqueue(async () => {
      try {
        await postJob({ type: "warm" });
      } catch {
        // A failed warm-up is surfaced on the next real analysis.
      }
    });
  }, 2500);
}
