import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Scan, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { detectUnknownForgery, type ForgeryDiscoveryResult } from "@/lib/unknownForgeryDetector";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

interface ForgeryPatternDiscoveryProps {
  result: AnalysisResult;
  className?: string;
}

const statusConfig = {
  normal: { label: "Normal", color: "text-trust-high", Icon: CheckCircle, bg: "bg-trust-high/10 border-trust-high/20" },
  suspicious: { label: "Suspicious Pattern", color: "text-trust-medium", Icon: HelpCircle, bg: "bg-trust-medium/10 border-trust-medium/20" },
  unknown_synthetic: { label: "Unknown Synthetic", color: "text-trust-low", Icon: AlertTriangle, bg: "bg-trust-low/10 border-trust-low/20" },
};

const ForgeryPatternDiscovery = ({ result, className }: ForgeryPatternDiscoveryProps) => {
  const discovery: ForgeryDiscoveryResult = useMemo(() => detectUnknownForgery(result), [result]);
  const cfg = statusConfig[discovery.status];

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-secondary/30", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Scan className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Forgery Pattern Discovery
        </h4>
      </div>

      {/* Status */}
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border mb-4", cfg.bg)}>
        <cfg.Icon className={cn("w-5 h-5", cfg.color)} />
        <div>
          <span className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{discovery.explanation}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <div className="text-xs text-muted-foreground mb-1">Anomaly Distance</div>
          <div className={cn("text-xl font-bold font-mono", cfg.color)}>
            {discovery.anomalyDistance}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <div className="text-xs text-muted-foreground mb-1">Pattern Score</div>
          <div className="text-xl font-bold font-mono text-primary">
            {discovery.unknownPatternScore}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between py-1 border-b border-border">
          <span className="text-muted-foreground">Known Pattern Match</span>
          <span className={cn("font-mono", discovery.knownPatternMatched ? "text-trust-medium" : "text-muted-foreground")}>
            {discovery.knownPatternMatched ? "Yes" : "None"}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-border">
          <span className="text-muted-foreground">Best Known Similarity</span>
          <span className="font-mono">{Math.round(discovery.bestKnownSimilarity * 100)}%</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-muted-foreground">Embedding Dimensions</span>
          <span className="font-mono">{discovery.embeddingVector.length}D</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        This module compares media embeddings against known authentic baselines to detect manipulation patterns not present in the generator fingerprint library.
      </p>
    </div>
  );
};

export default ForgeryPatternDiscovery;
