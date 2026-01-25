import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HeatmapRegion {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  label?: string;
}

export interface AnomalyRegion {
  start: number;
  end: number;
  severity: "low" | "medium" | "high";
}

export interface FrameData {
  frameNumber: number;
  timestamp: number;
  confidence: number;
  anomalyType?: "face_warp" | "temporal_inconsistency" | "lighting_mismatch" | "edge_artifact" | null;
}

export interface ModalityScore {
  modality: "visual" | "audio" | "temporal" | "structural" | "ganFingerprint" | "texture";
  score: number;
  weight: number;
  confidence: number;
  findings: string[];
}

export interface GanFingerprints {
  detected: boolean;
  patterns: string[];
  confidence: number;
}

export interface TextureAnalysis {
  laplacianVariance: "low" | "normal" | "high";
  smoothnessAnomalies: boolean;
  noiseConsistency: "consistent" | "inconsistent" | "suspicious";
}

export interface MetadataAnalysis {
  hasMetadata: boolean;
  suspicious: boolean;
  findings: string[];
}

export interface MultimodalConsistencyResult {
  consistencyStatus: "consistent" | "partially_consistent" | "inconsistent" | "single_modality" | "not_applicable";
  visualScore: number;
  audioScore: number | null;
  disagreement: number;
  confidenceModifier: number;
  adjustedConfidence: number;
  explanation: string;
}

export interface AnalysisResult {
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  verdict: string;
  analysisTime: number;
  mediaType: "image" | "video" | "audio";
  uncertaintyFlag: boolean;
  uncertaintyReason: string;
  ganFingerprints: GanFingerprints;
  textureAnalysis: TextureAnalysis;
  metadataAnalysis: MetadataAnalysis;
  observations: {
    type: "positive" | "neutral" | "concern";
    title: string;
    description: string;
  }[];
  robustnessTests: {
    mode: string;
    description: string;
    confidence: number;
    drift: number;
    status: "pass" | "warning" | "fail";
  }[];
  graphStats: {
    keypointsDetected: number;
    edgeConnections: number;
    suspiciousNodes: number;
    graphCoherence: number;
  };
  heatmapRegions: HeatmapRegion[];
  audioAnomalies: AnomalyRegion[];
  frameAnalysis: FrameData[];
  modalityScores: ModalityScore[];
  multimodalConsistency?: MultimodalConsistencyResult;
}

export const useMediaAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMedia = async (file: File): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error: fnError } = await supabase.functions.invoke("analyze-media", {
        body: {
          imageBase64: base64,
          mediaType: file.type.split("/")[0]
        }
      });

      if (fnError) {
        throw new Error(fnError.message || "Analysis failed");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      return data;

    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    analyzeMedia,
    isAnalyzing,
    result,
    error,
    reset
  };
};
