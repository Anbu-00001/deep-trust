/**
 * Pinned registry of browser-local AI-image detectors.
 *
 * Every model here is an open-weight ONNX file with a published SHA-256.
 * The engine downloads each file once, verifies its digest before use, and
 * runs inference entirely on-device via onnxruntime-web. No image bytes or
 * model outputs leave the browser.
 *
 * Outputs are SINGLE UNCALIBRATED SIGNALS from one model family
 * (Community Forensics ViT-S, Park & Owens, CVPR 2025). They are measured,
 * but they are not calibrated authenticity probabilities and never override
 * the "Origin not established" assessment policy.
 */

export type ResizeFilter = "bicubic" | "bilinear";

export interface DetectorModelSpec {
  id: string;
  /** Human-readable model name shown in the UI. */
  name: string;
  shortName: string;
  version: string;
  /** Public download URL of the ONNX weights. */
  url: string;
  /** Exact byte size; used for download progress and cache validation. */
  byteSize: number;
  /** Published SHA-256 of the ONNX file; verified before every session. */
  sha256: string;
  /** Reference preprocessing: resample filter for the 440px fit. */
  filter: ResizeFilter;
  /** Per-channel mean/std for [0,1] RGB normalization. */
  mean: [number, number, number];
  std: [number, number, number];
  /** Decision threshold from the model card (P(AI) >= threshold => AI). */
  threshold: number;
  /** Reported evaluation context from the model card. */
  provenance: string;
  license: string;
}

export interface LocalDetectorSignal {
  modelId: string;
  modelName: string;
  version: string;
  /** Raw, uncalibrated model output P(AI) in [0,1]. */
  probabilityAi: number;
  threshold: number;
  latencyMs: number;
  sha256Verified: boolean;
}

export interface LocalDetectorSignals {
  ranAt: string;
  runtime: string;
  models: LocalDetectorSignal[];
  consensus: {
    meanProbabilityAi: number;
    agreement: "agree_high" | "agree_low" | "disagree" | "single";
  };
}

export type DetectorSignalBand = "ai_indicated" | "camera_consistent" | "inconclusive";

/**
 * Interprets measured detector signals. Even when every detector agrees, the
 * result is a signal band, never a verdict: origin stays "not established".
 */
export function interpretDetectorSignals(signals: LocalDetectorSignals): { band: DetectorSignalBand; label: string; explanation: string } {
  const { agreement } = signals.consensus;
  if (agreement === "agree_high") {
    return {
      band: "ai_indicated",
      label: "AI-generation signal detected",
      explanation: "All local detectors scored above their published decision threshold. This is a strong indicator, not proof — treat the file as likely synthetic pending source verification.",
    };
  }
  if (agreement === "agree_low") {
    return {
      band: "camera_consistent",
      label: "No AI-generation signal",
      explanation: "All local detectors scored low. Detectors miss some new generators and edited images, so this does not establish camera origin.",
    };
  }
  return {
    band: "inconclusive",
    label: "Detectors disagree or are uncertain",
    explanation: "Scores fall between thresholds or the detectors disagree. Treat as inconclusive and verify the original source.",
  };
}

export const DETECTOR_RUNTIME = "onnxruntime-web (WebAssembly, single thread)";

export const DETECTOR_MODELS: DetectorModelSpec[] = [
  {
    id: "detectra-v1",
    name: "Detectra v1 — Community Forensics ViT-S/16@384",
    shortName: "Detectra v1",
    version: "detectra-v1",
    url: "https://huggingface.co/TensorFold/detectra-v1/resolve/main/model.onnx",
    byteSize: 43684258,
    sha256: "1414b9aafaa01a644ed706224973f09b53a1388282104409862df9893b1b962b",
    filter: "bilinear",
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    threshold: 0.65,
    provenance:
      "Fine-tune of Community Forensics ViT-S/16@384 (Park & Owens, CVPR 2025) on modern generators (DALL·E 3, Midjourney, Flux, SD3.5) plus non-photographic real classes (paintings, anime, memes, screenshots). MIT license.",
    license: "MIT",
  },
  {
    id: "commfor-web-v13",
    name: "CommFor Web v13 — Community Forensics ViT-S/16@384",
    shortName: "CommFor v13",
    version: "commfor-web-v13",
    url: "https://huggingface.co/angelhd25/ull-ai-image-detector/resolve/main/commfor384_web_v13_fp32.onnx",
    byteSize: 88369565,
    sha256: "6ca91ded511f0cfbf3ded2a7b76e37f62273c42cb42c303b1faf4933c53beeef",
    filter: "bicubic",
    mean: [0.48145466, 0.4578275, 0.40821073],
    std: [0.26862954, 0.26130258, 0.27577711],
    threshold: 0.65,
    provenance:
      "Fine-tune of Community Forensics ViT-S/16@384 (Park & Owens, CVPR 2025) packaged for browser deployment. MIT license.",
    license: "MIT",
  },
];

export const DETECTOR_MODELS_FINGERPRINT = DETECTOR_MODELS.map((m) => `${m.id}:${m.sha256}`).join("|");
