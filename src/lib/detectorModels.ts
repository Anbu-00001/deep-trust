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
