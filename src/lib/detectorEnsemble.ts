import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

export interface DetectorOutput {
  detector: string;
  label: string;
  fakeProbability: number;
  weight: number;
}

export interface EnsembleResult {
  detectors: DetectorOutput[];
  consensusScore: number;
  consensusLabel: string;
}

/**
 * Derives ensemble detector outputs from existing AnalysisResult signals.
 * No new models — purely aggregates existing module outputs.
 */
export function computeDetectorEnsemble(result: AnalysisResult): EnsembleResult {
  const detectors: DetectorOutput[] = [];

  // Detector 1: Gemini Visual Analysis
  const geminiProb = result.visualDeepfakeDetection?.visualDeepfakeProbability
    ?? (100 - result.trustScore) / 100;
  detectors.push({
    detector: "GeminiVision",
    label: "Gemini Visual Analysis",
    fakeProbability: clamp(geminiProb),
    weight: 0.4,
  });

  // Detector 2: Frequency Artifact Detector (derived from GAN fingerprints)
  const ganConf = result.ganFingerprints.confidence / 100;
  const ganDetected = result.ganFingerprints.detected;
  const freqProb = ganDetected ? clamp(ganConf * 0.9 + 0.1) : clamp(ganConf * 0.3);
  detectors.push({
    detector: "FrequencyArtifact",
    label: "Frequency Artifact Detector",
    fakeProbability: freqProb,
    weight: 0.2,
  });

  // Detector 3: Structural Analyzer (from graph stats)
  const coherence = result.graphStats.graphCoherence / 100;
  const suspRatio = result.graphStats.suspiciousNodes / Math.max(1, result.graphStats.keypointsDetected);
  const structProb = clamp(1 - coherence + suspRatio * 0.5);
  detectors.push({
    detector: "StructureAnalyzer",
    label: "Facial Landmark Distortion",
    fakeProbability: structProb,
    weight: 0.2,
  });

  // Detector 4: Texture Consistency (from texture analysis)
  const texMap: Record<string, number> = { low: 0.7, normal: 0.2, high: 0.1 };
  const lapScore = texMap[result.textureAnalysis.laplacianVariance] ?? 0.2;
  const smoothScore = result.textureAnalysis.smoothnessAnomalies ? 0.6 : 0.1;
  const noiseMap: Record<string, number> = { consistent: 0.1, inconsistent: 0.45, suspicious: 0.7 };
  const noiseScore = noiseMap[result.textureAnalysis.noiseConsistency] ?? 0.2;
  const textureProb = clamp(lapScore * 0.4 + smoothScore * 0.3 + noiseScore * 0.3);
  detectors.push({
    detector: "TextureAnalyzer",
    label: "Texture Consistency Detector",
    fakeProbability: textureProb,
    weight: 0.2,
  });

  // Weighted consensus
  const totalWeight = detectors.reduce((s, d) => s + d.weight, 0);
  const consensusScore = Math.round(
    detectors.reduce((s, d) => s + d.fakeProbability * d.weight, 0) / totalWeight * 100
  ) / 100;

  const consensusLabel =
    consensusScore >= 0.6 ? "Likely Fake" :
    consensusScore >= 0.4 ? "Uncertain" :
    "Likely Real";

  return { detectors, consensusScore, consensusLabel };
}

function clamp(v: number): number {
  return Math.min(1, Math.max(0, v));
}
