import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalysisResult {
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  verdict: string;
  analysisTime: number;
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
