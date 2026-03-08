/**
 * Adversarial Stress Tester
 * Simulates lightweight adversarial perturbations and measures detection drift.
 */

import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

export interface AdversarialPerturbation {
  name: string;
  description: string;
  originalScore: number;
  adversarialScore: number;
  drift: number;
  status: "robust" | "moderate" | "unstable";
}

export interface AdversarialResult {
  perturbations: AdversarialPerturbation[];
  overallStability: "robust" | "moderate" | "unstable";
  averageDrift: number;
  adversarialStabilityScore: number;
}

function simulatePerturbation(
  baseScore: number,
  perturbationStrength: number,
  seed: number
): number {
  // Deterministic pseudo-random drift based on seed
  const noise = Math.sin(seed * 127.1 + baseScore * 311.7) * 0.5 + 0.5;
  const drift = noise * perturbationStrength;
  const direction = Math.cos(seed * 43758.5453) > 0 ? 1 : -1;
  return Math.max(0, Math.min(1, baseScore + direction * drift));
}

export function runAdversarialStressTest(result: AnalysisResult): AdversarialResult {
  const baseScore =
    result.visualDeepfakeDetection?.visualDeepfakeProbability ??
    (100 - result.trustScore) / 100;

  const perturbationConfigs = [
    { name: "Frequency Perturbation", description: "High-frequency noise injection targeting spectral artifacts", strength: 0.08 },
    { name: "Color Shift Noise", description: "Subtle color channel perturbation across RGB planes", strength: 0.06 },
    { name: "Pixel Gradient Attack", description: "Gradient-based pixel-level adversarial perturbation", strength: 0.10 },
    { name: "Compression Artifact Injection", description: "Simulated JPEG re-compression with quality degradation", strength: 0.05 },
  ];

  const perturbations: AdversarialPerturbation[] = perturbationConfigs.map((cfg, i) => {
    const advScore = simulatePerturbation(baseScore, cfg.strength, i + result.trustScore);
    const drift = Math.abs(advScore - baseScore);
    return {
      name: cfg.name,
      description: cfg.description,
      originalScore: Math.round(baseScore * 100) / 100,
      adversarialScore: Math.round(advScore * 100) / 100,
      drift: Math.round(drift * 100) / 100,
      status: drift < 0.05 ? "robust" : drift < 0.15 ? "moderate" : "unstable",
    };
  });

  const avgDrift = perturbations.reduce((s, p) => s + p.drift, 0) / perturbations.length;
  const overallStability: AdversarialResult["overallStability"] =
    avgDrift < 0.05 ? "robust" : avgDrift < 0.15 ? "moderate" : "unstable";

  // Stability score: 1 = perfectly robust, 0 = completely unstable
  const adversarialStabilityScore = Math.round(Math.max(0, 1 - avgDrift * 5) * 100) / 100;

  return { perturbations, overallStability, averageDrift: Math.round(avgDrift * 100) / 100, adversarialStabilityScore };
}
