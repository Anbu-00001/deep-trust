import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

export type EvidenceCategory =
  | "visual_artifact"
  | "audio_anomaly"
  | "temporal_drift"
  | "robustness_instability"
  | "structural_inconsistency"
  | "metadata_irregularity";

export interface ForensicEvidenceObject {
  id: string;
  category: EvidenceCategory;
  module: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  timestamp: number | null;
  description: string;
  supportingData: Record<string, unknown>;
}

export interface ChainOfCustodyMetadata {
  fileHash: string;
  uploadTimestamp: string;
  analysisVersion: string;
  modulesUsed: string[];
  analysisTime: number;
}

/**
 * Generates ForensicEvidenceObjects from existing AnalysisResult signals.
 * Does NOT invent new evidence — only structures what already exists.
 */
export function generateEvidenceObjects(result: AnalysisResult): ForensicEvidenceObject[] {
  const evidence: ForensicEvidenceObject[] = [];
  let counter = 0;
  const nextId = (prefix: string) => `${prefix}_${String(++counter).padStart(3, "0")}`;

  // 1. Manipulation regions → visual_artifact
  (result.manipulationRegions ?? []).forEach((mr) => {
    evidence.push({
      id: nextId("visual_artifact"),
      category: "visual_artifact",
      module: "ManipulationLocalizer",
      severity: mr.severity,
      confidence: mr.score,
      timestamp: null,
      description: mr.description,
      supportingData: { region: mr.region, score: mr.score },
    });
  });

  // 2. GAN fingerprints → visual_artifact
  if (result.ganFingerprints.detected) {
    evidence.push({
      id: nextId("visual_artifact"),
      category: "visual_artifact",
      module: "GANFingerprinter",
      severity: result.ganFingerprints.confidence > 80 ? "high" : "medium",
      confidence: result.ganFingerprints.confidence / 100,
      timestamp: null,
      description: `GAN fingerprint patterns detected: ${result.ganFingerprints.patterns.join(", ")}`,
      supportingData: { patterns: result.ganFingerprints.patterns },
    });
  }

  // 3. Texture anomalies → visual_artifact
  if (result.textureAnalysis.smoothnessAnomalies || result.textureAnalysis.noiseConsistency !== "consistent") {
    evidence.push({
      id: nextId("visual_artifact"),
      category: "visual_artifact",
      module: "TextureAnalyzer",
      severity: result.textureAnalysis.noiseConsistency === "suspicious" ? "high" : "medium",
      confidence: 0.7,
      timestamp: null,
      description: `Texture anomaly: Laplacian variance ${result.textureAnalysis.laplacianVariance}, noise ${result.textureAnalysis.noiseConsistency}`,
      supportingData: { ...result.textureAnalysis },
    });
  }

  // 4. Metadata irregularities → metadata_irregularity
  if (result.metadataAnalysis.suspicious || !result.metadataAnalysis.hasMetadata) {
    evidence.push({
      id: nextId("metadata"),
      category: "metadata_irregularity",
      module: "MetadataAnalyzer",
      severity: result.metadataAnalysis.suspicious ? "medium" : "low",
      confidence: 0.65,
      timestamp: null,
      description: result.metadataAnalysis.suspicious
        ? `Suspicious metadata signatures: ${result.metadataAnalysis.findings.join("; ")}`
        : "EXIF metadata missing — possible indicator of re-encoding or AI generation.",
      supportingData: { findings: result.metadataAnalysis.findings },
    });
  }

  // 5. Frame anomalies → temporal_drift
  result.frameAnalysis
    .filter((f) => f.anomalyType && f.confidence < 70)
    .forEach((f) => {
      evidence.push({
        id: nextId("temporal"),
        category: "temporal_drift",
        module: "TemporalAnalyzer",
        severity: f.confidence < 50 ? "high" : "medium",
        confidence: (100 - f.confidence) / 100,
        timestamp: f.timestamp,
        description: `Temporal anomaly (${f.anomalyType?.replace(/_/g, " ")}) at frame ${f.frameNumber + 1}`,
        supportingData: { frameNumber: f.frameNumber, anomalyType: f.anomalyType },
      });
    });

  // 6. Audio anomalies → audio_anomaly
  result.audioAnomalies.forEach((a) => {
    evidence.push({
      id: nextId("audio"),
      category: "audio_anomaly",
      module: "AudioAnalyzer",
      severity: a.severity,
      confidence: a.severity === "high" ? 0.85 : a.severity === "medium" ? 0.65 : 0.45,
      timestamp: a.start,
      description: `Audio anomaly detected between ${a.start.toFixed(1)}s–${a.end.toFixed(1)}s`,
      supportingData: { start: a.start, end: a.end },
    });
  });

  // 7. Robustness instability → robustness_instability
  result.robustnessTests
    .filter((r) => r.status !== "pass")
    .forEach((r) => {
      evidence.push({
        id: nextId("robustness"),
        category: "robustness_instability",
        module: "RobustnessTester",
        severity: r.status === "fail" ? "high" : "medium",
        confidence: Math.abs(r.drift) / 100,
        timestamp: null,
        description: `Confidence drift of ${r.drift}% under ${r.mode} conditions (${r.description})`,
        supportingData: { mode: r.mode, drift: r.drift },
      });
    });

  // 8. Structural inconsistencies → structural_inconsistency
  if (result.graphStats.suspiciousNodes > 0) {
    evidence.push({
      id: nextId("structural"),
      category: "structural_inconsistency",
      module: "StructuralAnalyzer",
      severity: result.graphStats.suspiciousNodes > 5 ? "high" : result.graphStats.suspiciousNodes > 2 ? "medium" : "low",
      confidence: (100 - result.graphStats.graphCoherence) / 100,
      timestamp: null,
      description: `${result.graphStats.suspiciousNodes} suspicious keypoint nodes detected with ${result.graphStats.graphCoherence}% graph coherence`,
      supportingData: { ...result.graphStats },
    });
  }

  return evidence;
}

/**
 * Builds chain-of-custody metadata from analysis result.
 */
export function buildChainOfCustody(
  fileHash: string,
  result: AnalysisResult
): ChainOfCustodyMetadata {
  const modulesUsed: string[] = [
    "VisualAnalyzer",
    "StructuralAnalyzer",
    "GANFingerprinter",
    "TextureAnalyzer",
    "MetadataAnalyzer",
    "RobustnessTester",
    "DeepfakeDetector",
  ];
  if (result.mediaType !== "image") modulesUsed.push("AudioAnalyzer");
  if (result.mediaType === "video") modulesUsed.push("TemporalAnalyzer");

  return {
    fileHash,
    uploadTimestamp: new Date().toISOString(),
    analysisVersion: "DeepTrust_v1.3",
    modulesUsed,
    analysisTime: result.analysisTime,
  };
}
