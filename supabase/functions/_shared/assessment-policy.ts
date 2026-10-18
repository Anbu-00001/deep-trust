export const ASSESSMENT_VERSION = "visual-review-v2";

export interface ReviewObservation {
  type: "positive" | "neutral" | "concern";
  title: string;
  description: string;
}

export function applyAssessmentPolicy(input: Record<string, unknown>) {
  const observations: ReviewObservation[] = Array.isArray(input.observations)
    ? input.observations.slice(0, 8).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const value = item as Record<string, unknown>;
        if (typeof value.title !== "string" || typeof value.description !== "string") return [];
        return [{
          type: value.type === "concern" ? "concern" as const : "neutral" as const,
          title: value.title.slice(0, 160),
          description: value.description.slice(0, 1600),
        }];
      })
    : [];

  return {
    assessmentVersion: ASSESSMENT_VERSION,
    originStatus: "indeterminate" as const,
    authenticityProbability: null,
    calibrationStatus: "not_validated" as const,
    trustScore: 50, // Compatibility placeholder only; never rendered as a probability.
    riskLevel: "medium" as const,
    verdict: "Origin not established",
    visualSummary: observations.some((item) => item.type === "concern")
      ? "Visual review cues identified"
      : "No obvious visual anomalies reported",
    uncertaintyFlag: true,
    uncertaintyReason: "Visual plausibility cannot establish camera origin. Modern generators can produce convincing photographs; this review has no validated authenticity probability.",
    observations,
    ganFingerprints: { detected: false, patterns: [], confidence: 0 },
    textureAnalysis: { laplacianVariance: "normal" as const, smoothnessAnomalies: false, noiseConsistency: "consistent" as const },
    metadataAnalysis: { hasMetadata: false, suspicious: false, findings: ["EXIF and encoding checks were not performed."] },
    robustnessTests: [],
    graphStats: { keypointsDetected: 0, edgeConnections: 0, suspiciousNodes: 0, graphCoherence: 0 },
    heatmapRegions: [],
    audioAnomalies: [],
    frameAnalysis: [],
    modalityScores: [],
    manipulationRegions: [],
  };
}