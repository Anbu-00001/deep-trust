import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

/**
 * Generator fingerprint signatures — statistical ranges for known deepfake generators.
 * Each field represents a normalized 0–1 characteristic score.
 */
interface GeneratorSignature {
  name: string;
  label: string;
  frequencyPatternScore: [number, number]; // [min, max] typical range
  textureUniformityScore: [number, number];
  colorNoiseVariance: [number, number];
  landmarkSymmetryError: [number, number];
  heatmapActivationIntensity: [number, number];
}

const FINGERPRINT_LIBRARY: GeneratorSignature[] = [
  {
    name: "DeepFaceLab",
    label: "DeepFaceLab",
    frequencyPatternScore: [0.55, 0.85],
    textureUniformityScore: [0.6, 0.9],
    colorNoiseVariance: [0.3, 0.6],
    landmarkSymmetryError: [0.2, 0.5],
    heatmapActivationIntensity: [0.5, 0.8],
  },
  {
    name: "StyleGAN",
    label: "StyleGAN / StyleGAN2",
    frequencyPatternScore: [0.7, 0.95],
    textureUniformityScore: [0.75, 0.95],
    colorNoiseVariance: [0.1, 0.35],
    landmarkSymmetryError: [0.05, 0.25],
    heatmapActivationIntensity: [0.3, 0.6],
  },
  {
    name: "StableDiffusion",
    label: "Stable Diffusion (Face)",
    frequencyPatternScore: [0.3, 0.6],
    textureUniformityScore: [0.4, 0.7],
    colorNoiseVariance: [0.2, 0.5],
    landmarkSymmetryError: [0.1, 0.4],
    heatmapActivationIntensity: [0.2, 0.5],
  },
  {
    name: "FaceSwap",
    label: "FaceSwap",
    frequencyPatternScore: [0.4, 0.7],
    textureUniformityScore: [0.3, 0.6],
    colorNoiseVariance: [0.4, 0.7],
    landmarkSymmetryError: [0.35, 0.65],
    heatmapActivationIntensity: [0.6, 0.9],
  },
  {
    name: "Midjourney",
    label: "Midjourney (Face)",
    frequencyPatternScore: [0.2, 0.45],
    textureUniformityScore: [0.5, 0.8],
    colorNoiseVariance: [0.15, 0.4],
    landmarkSymmetryError: [0.08, 0.3],
    heatmapActivationIntensity: [0.15, 0.4],
  },
];

export interface ArtifactSignature {
  frequencyPatternScore: number;
  textureUniformityScore: number;
  colorNoiseVariance: number;
  landmarkSymmetryError: number;
  heatmapActivationIntensity: number;
}

export interface GeneratorMatch {
  name: string;
  label: string;
  similarity: number;
}

export interface FingerprintResult {
  generatorMatch: GeneratorMatch;
  alternativeMatches: GeneratorMatch[];
  artifactSignature: ArtifactSignature;
}

/**
 * Extract an artifact signature from existing analysis outputs.
 */
export function extractArtifactSignature(result: AnalysisResult): ArtifactSignature {
  // Frequency pattern: derive from GAN fingerprint confidence + visual deepfake probability
  const ganConf = result.ganFingerprints.confidence / 100;
  const deepfakeProb = result.visualDeepfakeDetection?.visualDeepfakeProbability ?? (100 - result.trustScore) / 100;
  const frequencyPatternScore = clamp((ganConf * 0.6 + deepfakeProb * 0.4));

  // Texture uniformity: derive from texture analysis
  const texMap: Record<string, number> = { low: 0.8, normal: 0.3, high: 0.15 };
  const lapVar = texMap[result.textureAnalysis.laplacianVariance] ?? 0.3;
  const smoothness = result.textureAnalysis.smoothnessAnomalies ? 0.7 : 0.2;
  const textureUniformityScore = clamp((lapVar * 0.5 + smoothness * 0.5));

  // Color noise variance: derive from noise consistency
  const noiseMap: Record<string, number> = { consistent: 0.15, inconsistent: 0.5, suspicious: 0.75 };
  const colorNoiseVariance = clamp(noiseMap[result.textureAnalysis.noiseConsistency] ?? 0.3);

  // Landmark symmetry error: derive from structural graph
  const coherence = result.graphStats.graphCoherence / 100;
  const suspRatio = result.graphStats.suspiciousNodes / Math.max(1, result.graphStats.keypointsDetected);
  const landmarkSymmetryError = clamp(1 - coherence + suspRatio * 0.5);

  // Heatmap activation: average intensity of heatmap regions
  const avgIntensity = result.heatmapRegions.length > 0
    ? result.heatmapRegions.reduce((s, r) => s + r.intensity, 0) / result.heatmapRegions.length
    : 0.2;
  const heatmapActivationIntensity = clamp(avgIntensity);

  return {
    frequencyPatternScore,
    textureUniformityScore,
    colorNoiseVariance,
    landmarkSymmetryError,
    heatmapActivationIntensity,
  };
}

/**
 * Compare artifact signature against fingerprint library using
 * range-based similarity scoring.
 */
export function matchFingerprint(signature: ArtifactSignature): FingerprintResult {
  const matches: GeneratorMatch[] = FINGERPRINT_LIBRARY.map((gen) => {
    const dims = [
      rangeSimilarity(signature.frequencyPatternScore, gen.frequencyPatternScore),
      rangeSimilarity(signature.textureUniformityScore, gen.textureUniformityScore),
      rangeSimilarity(signature.colorNoiseVariance, gen.colorNoiseVariance),
      rangeSimilarity(signature.landmarkSymmetryError, gen.landmarkSymmetryError),
      rangeSimilarity(signature.heatmapActivationIntensity, gen.heatmapActivationIntensity),
    ];
    const similarity = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length * 100) / 100;
    return { name: gen.name, label: gen.label, similarity };
  });

  matches.sort((a, b) => b.similarity - a.similarity);

  return {
    generatorMatch: matches[0],
    alternativeMatches: matches.slice(1),
    artifactSignature: signature,
  };
}

/** How well a value fits within a [min, max] range. 1 = perfect center, decays outside. */
function rangeSimilarity(value: number, [min, max]: [number, number]): number {
  if (value >= min && value <= max) {
    const center = (min + max) / 2;
    const halfWidth = (max - min) / 2;
    return halfWidth === 0 ? 1 : 1 - Math.abs(value - center) / halfWidth * 0.3;
  }
  const dist = value < min ? min - value : value - max;
  return Math.max(0, 1 - dist * 2.5);
}

function clamp(v: number, lo = 0, hi = 1): number {
  return Math.min(hi, Math.max(lo, v));
}
