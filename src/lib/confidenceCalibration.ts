/**
 * Forensic Confidence Calibration Engine
 * Converts raw detector probabilities into calibrated scores reflecting uncertainty.
 */

import type { ModalityScore } from "@/hooks/useMediaAnalysis";

export interface CalibrationResult {
  rawProbability: number;
  calibratedScore: number;
  confidenceInterval: number;
  detectorVariance: number;
  calibrationStatus: "high_confidence" | "moderate_confidence" | "low_confidence";
}

/**
 * Compute variance of an array of numbers.
 */
function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

/**
 * Calibrate the ensemble score using detector dispersion.
 * Inputs come directly from existing modality scores — no new inference.
 */
export function calibrateConfidence(
  trustScore: number,
  modalityScores: ModalityScore[]
): CalibrationResult {
  // Extract raw scores from existing modality outputs
  const scores = modalityScores.map((m) => m.score / 100);
  const rawProbability = (100 - trustScore) / 100; // manipulation probability

  const detectorVariance = variance(scores);
  const confidenceBand = Math.sqrt(detectorVariance);
  const calibratedScore = Math.max(0, Math.min(1, rawProbability * (1 - detectorVariance)));
  const confidenceInterval = Math.round(confidenceBand * 100) / 100;

  let calibrationStatus: CalibrationResult["calibrationStatus"];
  if (confidenceInterval < 0.08) {
    calibrationStatus = "high_confidence";
  } else if (confidenceInterval < 0.15) {
    calibrationStatus = "moderate_confidence";
  } else {
    calibrationStatus = "low_confidence";
  }

  return {
    rawProbability: Math.round(rawProbability * 100) / 100,
    calibratedScore: Math.round(calibratedScore * 100) / 100,
    confidenceInterval,
    detectorVariance: Math.round(detectorVariance * 10000) / 10000,
    calibrationStatus,
  };
}
