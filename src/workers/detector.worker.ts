/// <reference lib="webworker" />
/**
 * Detector inference worker.
 *
 * Runs the pinned open-weight ONNX detectors entirely on-device. The image
 * never leaves the browser: decoding, resampling, and inference all happen
 * here, and only the resulting probabilities are posted back.
 */
import * as ort from "onnxruntime-web";
import {
  DETECTOR_MODELS,
  DETECTOR_RUNTIME,
  type DetectorModelSpec,
  type LocalDetectorSignal,
  type LocalDetectorSignals,
} from "../lib/detectorModels";
import { resizeRgba, findShortestEdgeResize } from "../lib/imageResample";

// The dev/published origins are not cross-origin isolated, so threaded WASM
// is unavailable; single-threaded SIMD keeps behavior identical everywhere.
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/";

const CACHE_NAME = "deeptrust-detector-models-v1";
const CROP = 384;
const FIT_EDGE = 440;

const sessions = new Map<string, ort.InferenceSession>();

type Stage =
  | { type: "stage"; stage: "download" | "verify" | "load" | "infer"; modelId: string; modelShortName: string; percent: number | null }
  | { type: "done"; signals: LocalDetectorSignals }
  | { type: "error"; message: string };

const post = (msg: Stage) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function loadModelBytes(spec: DetectorModelSpec): Promise<ArrayBuffer> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(spec.url);
  if (cached) {
    post({ type: "stage", stage: "verify", modelId: spec.id, modelShortName: spec.shortName, percent: null });
    const buf = await cached.arrayBuffer();
    const digest = await sha256Hex(buf);
    if (digest !== spec.sha256) throw new Error(`Integrity check failed for ${spec.shortName}: cached bytes do not match the published SHA-256.`);
    return buf;
  }

  const response = await fetch(spec.url);
  if (!response.ok || !response.body) throw new Error(`Model download failed for ${spec.shortName} (HTTP ${response.status}).`);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    post({ type: "stage", stage: "download", modelId: spec.id, modelShortName: spec.shortName, percent: Math.min(1, received / spec.byteSize) });
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  const buffer = merged.buffer;

  post({ type: "stage", stage: "verify", modelId: spec.id, modelShortName: spec.shortName, percent: null });
  const digest = await sha256Hex(buffer);
  if (digest !== spec.sha256) {
    throw new Error(`Integrity check failed for ${spec.shortName}: downloaded bytes do not match the published SHA-256. Inference was blocked.`);
  }
  await cache.put(spec.url, new Response(buffer.slice(0), { headers: { "Content-Type": "application/octet-stream" } }));
  return buffer;
}

async function getSession(spec: DetectorModelSpec): Promise<ort.InferenceSession> {
  const existing = sessions.get(spec.id);
  if (existing) return existing;
  post({ type: "stage", stage: "load", modelId: spec.id, modelShortName: spec.shortName, percent: null });
  const bytes = await loadModelBytes(spec);
  const session = await ort.InferenceSession.create(new Uint8Array(bytes), {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
  sessions.set(spec.id, session);
  return session;
}

/** Decode, fit to 440 on the shortest edge, center-crop 384, normalize. */
async function preprocess(file: File, spec: DetectorModelSpec): Promise<Float32Array> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const width = bitmap.width;
  const height = bitmap.height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Image decoding is unavailable in this browser.");
  ctx.drawImage(bitmap, 0, 0);
  const rgba = ctx.getImageData(0, 0, width, height).data;
  bitmap.close();

  const fit = findShortestEdgeResize(width, height, FIT_EDGE);
  const resized = resizeRgba(rgba, width, height, fit.width, fit.height, spec.filter);

  const x0 = Math.floor((fit.width - CROP) / 2);
  const y0 = Math.floor((fit.height - CROP) / 2);
  const data = new Float32Array(3 * CROP * CROP);
  const planeSize = CROP * CROP;
  for (let y = 0; y < CROP; y++) {
    for (let x = 0; x < CROP; x++) {
      const si = ((y + y0) * fit.width + (x + x0)) * 4;
      const di = y * CROP + x;
      for (let c = 0; c < 3; c++) {
        data[c * planeSize + di] = (resized[si + c] / 255 - spec.mean[c]) / spec.std[c];
      }
    }
  }
  return data;
}

function probabilityFromOutput(output: ort.Tensor): number {
  const values = output.data as Float32Array;
  if (values.length >= 2 && output.dims[output.dims.length - 1] === 2) {
    const maxLogit = Math.max(values[0], values[1]);
    const exp0 = Math.exp(values[0] - maxLogit);
    const exp1 = Math.exp(values[1] - maxLogit);
    return exp1 / (exp0 + exp1);
  }
  // Single logit: P(AI) = sigmoid(logit).
  return 1 / (1 + Math.exp(-values[0]));
}

async function detect(file: File): Promise<LocalDetectorSignals> {
  const signals: LocalDetectorSignal[] = [];
  for (const spec of DETECTOR_MODELS) {
    const started = performance.now();
    const session = await getSession(spec);
    post({ type: "stage", stage: "infer", modelId: spec.id, modelShortName: spec.shortName, percent: null });
    const input = new ort.Tensor("float32", await preprocess(file, spec), [1, 3, CROP, CROP]);
    const outputs = await session.run({ [session.inputNames[0]]: input });
    const output = outputs[session.outputNames[0]];
    signals.push({
      modelId: spec.id,
      modelName: spec.shortName,
      version: spec.version,
      probabilityAi: probabilityFromOutput(output),
      threshold: spec.threshold,
      latencyMs: Math.round(performance.now() - started),
      sha256Verified: true,
    });
  }

  const mean = signals.reduce((sum, s) => sum + s.probabilityAi, 0) / signals.length;
  const high = signals.filter((s) => s.probabilityAi >= s.threshold).length;
  const low = signals.filter((s) => s.probabilityAi < 1 - s.threshold).length;
  return {
    ranAt: new Date().toISOString(),
    runtime: DETECTOR_RUNTIME,
    models: signals,
    consensus: {
      meanProbabilityAi: mean,
      agreement: signals.length === 1 ? "single" : high === signals.length ? "agree_high" : low === signals.length ? "agree_low" : "disagree",
    },
  };
}

self.onmessage = async (event: MessageEvent<{ type: string; file?: File }>) => {
  if (event.data?.type !== "detect" || !(event.data.file instanceof File)) return;
  try {
    post({ type: "done", signals: await detect(event.data.file) });
  } catch (error) {
    post({ type: "error", message: error instanceof Error ? error.message : "Local detector inference failed." });
  }
};
