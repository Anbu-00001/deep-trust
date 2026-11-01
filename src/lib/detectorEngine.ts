/**
 * Main-thread wrapper around the detector inference worker.
 *
 * Keeps a single worker instance alive for the session, forwards granular
 * progress (model download, digest verification, inference), and starts
 * warming the model cache during idle time so later analyses run without a
 * download.
 */
import type { LocalDetectorSignals } from "./detectorModels";

export type DetectorProgress = {
  stage: "download" | "verify" | "load" | "infer" | "warming";
  label: string;
  percent: number | null;
};

export type DetectorRunResult =
  | { status: "measured"; signals: LocalDetectorSignals }
  | { status: "failed"; reason: string };

let worker: Worker | null = null;
let workerFailed = false;

type Pending = {
  resolve: (result: DetectorRunResult) => void;
  onProgress: (progress: DetectorProgress) => void;
};

let pending: Pending | null = null;

function stageLabel(stage: DetectorProgress["stage"], modelShortName: string): string {
  switch (stage) {
    case "download": return `Downloading ${modelShortName} weights`;
    case "verify": return `Verifying ${modelShortName} SHA-256`;
    case "load": return `Loading ${modelShortName} into runtime`;
    case "infer": return `Running ${modelShortName} inference`;
    case "warming": return `Preparing ${modelShortName} engine`;
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
      | { type: "error"; message: string };
    if (!pending) return;
    if (data.type === "stage") {
      pending.onProgress({ stage: data.type === "stage" ? data.stage : "infer", label: stageLabel(data.stage, data.modelShortName), percent: data.percent });
    } else if (data.type === "done") {
      const { resolve, onProgress } = pending;
      pending = null;
      onProgress({ stage: "infer", label: "Detector inference complete", percent: 1 });
      resolve({ status: "measured", signals: data.signals });
    } else if (data.type === "error") {
      const { resolve } = pending;
      pending = null;
      resolve({ status: "failed", reason: data.message });
    }
  };
  worker.onerror = (event) => {
    workerFailed = true;
    worker = null;
    if (pending) {
      const { resolve } = pending;
      pending = null;
      resolve({ status: "failed", reason: event.message || "Local detector engine failed to start." });
    }
  };
  return worker;
}

/**
 * Runs every pinned detector against one image file on-device.
 * Never throws: a failure is reported as { status: "failed" } so the rest of
 * the assessment pipeline can continue and disclose the gap honestly.
 */
export function runLocalDetectors(file: File, onProgress: (progress: DetectorProgress) => void): Promise<DetectorRunResult> {
  if (!(file.type || "").startsWith("image/")) {
    return Promise.resolve({ status: "failed", reason: "Local detectors apply to still images only." });
  }
  let localWorker: Worker;
  try {
    localWorker = getWorker();
  } catch (error) {
    return Promise.resolve({ status: "failed", reason: error instanceof Error ? error.message : "Local detector engine is unavailable." });
  }
  if (pending) {
    return Promise.resolve({ status: "failed", reason: "A detector run is already in progress." });
  }
  return new Promise<DetectorRunResult>((resolve) => {
    pending = { resolve, onProgress };
    localWorker.postMessage({ type: "detect", file });
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
  const sample = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "warmup.png", { type: "image/png" });
  window.setTimeout(() => {
    runLocalDetectors(sample, () => {}).catch(() => undefined);
  }, 2500);
}
