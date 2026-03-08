/**
 * Unknown Forgery Detector
 * Detects manipulation patterns that don't match known generator fingerprints.
 */

import type { AnalysisResult } from "@/hooks/useMediaAnalysis";
import { extractArtifactSignature, matchFingerprint } from "@/lib/fingerprintLibrary";

export interface ForgeryDiscoveryResult {
  embeddingVector: number[];
  anomalyDistance: number;
  knownPatternMatched: boolean;
  bestKnownSimilarity: number;
  status: "normal" | "suspicious" | "unknown_synthetic";
  unknownPatternScore: number;
  explanation: string;
}

/**
 * Compute cosine distance between two vectors.
 */
function cosineDistance(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  if (mag === 0) return 1;
  return 1 - dot / mag;
}

// Statistical baseline representing authentic media characteristics
const REAL_MEDIA_CENTROID = [0.15, 0.25, 0.12, 0.08, 0.18];

export function detectUnknownForgery(result: AnalysisResult): ForgeryDiscoveryResult {
  const sig = extractArtifactSignature(result);
  const fp = matchFingerprint(sig);

  // Build embedding from existing artifact signature
  const embeddingVector = [
    sig.frequencyPatternScore,
    sig.textureUniformityScore,
    sig.colorNoiseVariance,
    sig.landmarkSymmetryError,
    sig.heatmapActivationIntensity,
  ];

  const anomalyDistance = Math.round(cosineDistance(embeddingVector, REAL_MEDIA_CENTROID) * 100) / 100;
  const bestKnownSimilarity = fp.generatorMatch.similarity;
  const knownPatternMatched = bestKnownSimilarity >= 0.65;

  let status: ForgeryDiscoveryResult["status"];
  let explanation: string;

  if (anomalyDistance < 0.2) {
    status = "normal";
    explanation = "Media embedding falls within the expected range for authentic content.";
  } else if (anomalyDistance < 0.5) {
    if (knownPatternMatched) {
      status = "suspicious";
      explanation = `Manipulation characteristics detected matching ${fp.generatorMatch.label} signature.`;
    } else {
      status = "suspicious";
      explanation = "Media shows anomalous patterns not strongly matching any known generator.";
    }
  } else {
    if (knownPatternMatched) {
      status = "unknown_synthetic";
      explanation = `High anomaly score with partial match to ${fp.generatorMatch.label}. Possible variant or hybrid synthesis method.`;
    } else {
      status = "unknown_synthetic";
      explanation = "Media likely generated using an unknown or emerging synthesis method not present in the fingerprint library.";
    }
  }

  // Score: 0 = normal, 1 = highly anomalous
  const unknownPatternScore = Math.round(Math.min(1, anomalyDistance * 1.5) * 100) / 100;

  return {
    embeddingVector,
    anomalyDistance,
    knownPatternMatched,
    bestKnownSimilarity,
    status,
    unknownPatternScore,
    explanation,
  };
}
