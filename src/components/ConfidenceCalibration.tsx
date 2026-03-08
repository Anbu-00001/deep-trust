import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { calibrateConfidence, type CalibrationResult } from "@/lib/confidenceCalibration";
import type { ModalityScore } from "@/hooks/useMediaAnalysis";

interface ConfidenceCalibrationProps {
  trustScore: number;
  modalityScores: ModalityScore[];
  className?: string;
}

const ConfidenceCalibration = ({ trustScore, modalityScores, className }: ConfidenceCalibrationProps) => {
  const calibration: CalibrationResult = useMemo(
    () => calibrateConfidence(trustScore, modalityScores),
    [trustScore, modalityScores]
  );

  const statusConfig = {
    high_confidence: { label: "High Confidence", color: "text-trust-high", bg: "bg-trust-high/10 border-trust-high/20" },
    moderate_confidence: { label: "Moderate Confidence", color: "text-trust-medium", bg: "bg-trust-medium/10 border-trust-medium/20" },
    low_confidence: { label: "Low Confidence", color: "text-trust-low", bg: "bg-trust-low/10 border-trust-low/20" },
  };

  const config = statusConfig[calibration.calibrationStatus];

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-secondary/30", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Confidence Calibration
        </h4>
      </div>

      {/* Calibration scores */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">Raw Probability</div>
          <div className="text-xl font-bold font-mono">{calibration.rawProbability}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">Calibrated</div>
          <div className="text-xl font-bold font-mono text-primary">{calibration.calibratedScore}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">Interval</div>
          <div className="text-xl font-bold font-mono">±{calibration.confidenceInterval}</div>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-3">
        {calibration.calibratedScore > calibration.rawProbability ? (
          <TrendingUp className="w-4 h-4 text-trust-low" />
        ) : (
          <TrendingDown className="w-4 h-4 text-trust-high" />
        )}
        <span className={cn("text-sm font-medium px-2 py-0.5 rounded-full border", config.bg, config.color)}>
          {config.label}
        </span>
        <span className="text-xs text-muted-foreground ml-auto font-mono">
          σ² = {calibration.detectorVariance}
        </span>
      </div>

      {/* Visual bar showing calibrated range */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary/60 rounded-full transition-all duration-500"
          style={{ width: `${calibration.calibratedScore * 100}%` }}
        />
        {/* Confidence interval markers */}
        <div
          className="absolute top-0 h-full border-l-2 border-dashed border-muted-foreground/40"
          style={{ left: `${Math.max(0, (calibration.calibratedScore - calibration.confidenceInterval) * 100)}%` }}
        />
        <div
          className="absolute top-0 h-full border-r-2 border-dashed border-muted-foreground/40"
          style={{ left: `${Math.min(100, (calibration.calibratedScore + calibration.confidenceInterval) * 100)}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Confidence interval reflects agreement between independent detection modules. Lower variance indicates higher reliability of the final score.
      </p>
    </div>
  );
};

export default ConfidenceCalibration;
