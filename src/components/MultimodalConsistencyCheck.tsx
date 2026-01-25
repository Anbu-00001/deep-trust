import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, HelpCircle, Info } from "lucide-react";

export interface MultimodalConsistencyResult {
  consistencyStatus: "consistent" | "partially_consistent" | "inconsistent" | "single_modality" | "not_applicable";
  visualScore: number;
  audioScore: number | null;
  disagreement: number;
  confidenceModifier: number;
  adjustedConfidence: number;
  explanation: string;
}

interface MultimodalConsistencyCheckProps {
  className?: string;
  consistencyData?: MultimodalConsistencyResult;
  mediaType: "image" | "video" | "audio";
  trustScore: number;
  modalityScores?: {
    modality: string;
    score: number;
    weight: number;
    confidence: number;
    findings: string[];
  }[];
}

const LOW_DISAGREEMENT = 0.15;
const HIGH_DISAGREEMENT = 0.30;

/**
 * Computes multimodal consistency check from existing modality scores.
 * This module READS existing outputs and adjusts interpretation ONLY.
 * It does NOT modify original scores or prediction logic.
 */
export const computeConsistencyCheck = (
  trustScore: number,
  mediaType: "image" | "video" | "audio",
  modalityScores?: { modality: string; score: number }[]
): MultimodalConsistencyResult => {
  // Extract visual and audio scores from existing modality scores
  const visualModality = modalityScores?.find(m => m.modality === "visual");
  const audioModality = modalityScores?.find(m => m.modality === "audio");
  
  const visualScore = visualModality?.score ?? trustScore;
  const audioScore = audioModality?.score ?? null;
  
  // If only one modality exists or no audio available
  if (audioScore === null || mediaType === "image") {
    return {
      consistencyStatus: "single_modality",
      visualScore,
      audioScore: null,
      disagreement: 0,
      confidenceModifier: 0,
      adjustedConfidence: Math.min(100, Math.max(0, trustScore)),
      explanation: "Single modality analysis — consistency check not applicable."
    };
  }
  
  // Convert to 0-1 range internally
  const visualNormalized = visualScore / 100;
  const audioNormalized = audioScore / 100;
  
  // Compute disagreement
  const disagreement = Math.abs(visualNormalized - audioNormalized);
  
  let consistencyStatus: MultimodalConsistencyResult["consistencyStatus"];
  let confidenceModifier: number;
  let explanation: string;
  
  if (disagreement >= HIGH_DISAGREEMENT) {
    // High disagreement
    consistencyStatus = "inconsistent";
    confidenceModifier = -15;
    explanation = "Audio and visual signals show conflicting authenticity patterns. The system detected significant disagreement between what it sees and hears, requiring cautious interpretation.";
  } else if (disagreement >= LOW_DISAGREEMENT) {
    // Partial disagreement
    consistencyStatus = "partially_consistent";
    confidenceModifier = -7;
    explanation = "Audio and visual signals show some variation. Minor disagreement detected — the result remains valid but with reduced confidence.";
  } else {
    // Low disagreement - consistent
    consistencyStatus = "consistent";
    confidenceModifier = 0;
    explanation = "Audio and visual signals agree. Both modalities support the same authenticity conclusion.";
  }
  
  // Apply confidence modifier (clamp between 0-100)
  const adjustedConfidence = Math.min(100, Math.max(0, trustScore + confidenceModifier));
  
  return {
    consistencyStatus,
    visualScore,
    audioScore,
    disagreement,
    confidenceModifier,
    adjustedConfidence,
    explanation
  };
};

const MultimodalConsistencyCheck = ({
  className,
  consistencyData,
  mediaType,
  trustScore,
  modalityScores
}: MultimodalConsistencyCheckProps) => {
  // Compute consistency from existing scores if not provided
  const data = useMemo(() => {
    if (consistencyData) return consistencyData;
    return computeConsistencyCheck(trustScore, mediaType, modalityScores);
  }, [consistencyData, trustScore, mediaType, modalityScores]);

  const getStatusIcon = () => {
    switch (data.consistencyStatus) {
      case "consistent":
        return <CheckCircle className="w-5 h-5 text-trust-high" />;
      case "partially_consistent":
        return <HelpCircle className="w-5 h-5 text-trust-medium" />;
      case "inconsistent":
        return <AlertTriangle className="w-5 h-5 text-trust-low" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (data.consistencyStatus) {
      case "consistent":
        return "Consistent";
      case "partially_consistent":
        return "Partially Consistent";
      case "inconsistent":
        return "Inconsistent";
      case "single_modality":
        return "Single Modality";
      case "not_applicable":
        return "Not Applicable";
    }
  };

  const getStatusColor = () => {
    switch (data.consistencyStatus) {
      case "consistent":
        return "text-trust-high bg-trust-high/10 border-trust-high/20";
      case "partially_consistent":
        return "text-trust-medium bg-trust-medium/10 border-trust-medium/20";
      case "inconsistent":
        return "text-trust-low bg-trust-low/10 border-trust-low/20";
      default:
        return "text-muted-foreground bg-secondary border-border";
    }
  };

  return (
    <div className={cn("space-y-4 p-4 rounded-lg border border-border bg-secondary/30", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Multimodal Consistency Analysis
        </h4>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border",
          getStatusColor()
        )}>
          {getStatusIcon()}
          <span>{getStatusLabel()}</span>
        </div>
      </div>

      {/* Score Comparison (only for multi-modal) */}
      {data.audioScore !== null && (
        <div className="grid grid-cols-2 gap-4">
          {/* Visual Score */}
          <div className="p-3 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👁️</span>
              <span className="text-sm font-medium">Visual Score</span>
            </div>
            <div className="flex items-end gap-2">
              <span className={cn(
                "text-2xl font-bold font-mono",
                data.visualScore >= 70 ? "text-trust-high" :
                data.visualScore >= 40 ? "text-trust-medium" : "text-trust-low"
              )}>
                {data.visualScore.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground mb-0.5">/ 100</span>
            </div>
          </div>

          {/* Audio Score */}
          <div className="p-3 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔊</span>
              <span className="text-sm font-medium">Audio Score</span>
            </div>
            <div className="flex items-end gap-2">
              <span className={cn(
                "text-2xl font-bold font-mono",
                data.audioScore >= 70 ? "text-trust-high" :
                data.audioScore >= 40 ? "text-trust-medium" : "text-trust-low"
              )}>
                {data.audioScore.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground mb-0.5">/ 100</span>
            </div>
          </div>
        </div>
      )}

      {/* Disagreement Meter (only for multi-modal) */}
      {data.audioScore !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Modal Disagreement</span>
            <span className={cn(
              "font-mono",
              data.disagreement >= HIGH_DISAGREEMENT ? "text-trust-low" :
              data.disagreement >= LOW_DISAGREEMENT ? "text-trust-medium" : "text-trust-high"
            )}>
              {(data.disagreement * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                data.disagreement >= HIGH_DISAGREEMENT ? "bg-trust-low" :
                data.disagreement >= LOW_DISAGREEMENT ? "bg-trust-medium" : "bg-trust-high"
              )}
              style={{ width: `${Math.min(100, data.disagreement * 100 / 0.5)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% (Perfect Agreement)</span>
            <span>50%+ (High Conflict)</span>
          </div>
        </div>
      )}

      {/* Confidence Adjustment */}
      {data.confidenceModifier !== 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-trust-low/5 border border-trust-low/20">
          <span className="text-sm text-muted-foreground">Confidence Adjustment</span>
          <span className={cn(
            "font-mono font-medium",
            data.confidenceModifier < 0 ? "text-trust-low" : "text-trust-high"
          )}>
            {data.confidenceModifier > 0 ? "+" : ""}{data.confidenceModifier}%
          </span>
        </div>
      )}

      {/* Explanation */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {data.explanation}
      </p>

      {/* User-Friendly Explanation */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">What this means:</strong> This check compares what the system 
            sees (visual cues) and hears (audio cues). When these disagree strongly, the result is marked 
            uncertain even if one model is confident. This makes the system more cautious and transparent.
          </p>
        </div>
      </div>

      {/* Single Modality Notice */}
      {data.consistencyStatus === "single_modality" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">
            Not Applicable (Single Modality) — Audio analysis unavailable for consistency comparison.
          </span>
        </div>
      )}
    </div>
  );
};

export default MultimodalConsistencyCheck;
