import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Users, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { computeDetectorEnsemble } from "@/lib/detectorEnsemble";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

interface DetectorConsensusProps {
  result: AnalysisResult;
  className?: string;
}

const DetectorConsensus = ({ result, className }: DetectorConsensusProps) => {
  const ensemble = useMemo(() => computeDetectorEnsemble(result), [result]);

  const ConsensusIcon =
    ensemble.consensusScore >= 0.6 ? AlertTriangle :
    ensemble.consensusScore >= 0.4 ? HelpCircle :
    CheckCircle;

  const consensusColor =
    ensemble.consensusScore >= 0.6 ? "text-trust-low" :
    ensemble.consensusScore >= 0.4 ? "text-trust-medium" :
    "text-trust-high";

  return (
    <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Detector Consensus Panel</h4>
      </div>

      {/* Detector bars */}
      <div className="space-y-3 mb-4">
        {ensemble.detectors.map((d) => {
          const pct = Math.round(d.fakeProbability * 100);
          const barColor =
            d.fakeProbability >= 0.6 ? "bg-trust-low" :
            d.fakeProbability >= 0.4 ? "bg-trust-medium" :
            "bg-trust-high";
          return (
            <div key={d.detector}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className={cn(
                  "text-xs font-mono",
                  d.fakeProbability >= 0.6 ? "text-trust-low" :
                  d.fakeProbability >= 0.4 ? "text-trust-medium" :
                  "text-trust-high"
                )}>
                  {pct}% Fake
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Consensus */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConsensusIcon className={cn("w-4 h-4", consensusColor)} />
            <span className="text-sm font-medium">Final Consensus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-mono font-semibold", consensusColor)}>
              {Math.round(ensemble.consensusScore * 100)}% Fake
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border",
              ensemble.consensusScore >= 0.6 ? "bg-trust-low/10 text-trust-low border-trust-low/20" :
              ensemble.consensusScore >= 0.4 ? "bg-trust-medium/10 text-trust-medium border-trust-medium/20" :
              "bg-trust-high/10 text-trust-high border-trust-high/20"
            )}>
              {ensemble.consensusLabel}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
        Consensus score computed from weighted ensemble of {ensemble.detectors.length} independent detection strategies. Weights reflect each detector's reliability for this media type.
      </p>
    </div>
  );
};

export default DetectorConsensus;
