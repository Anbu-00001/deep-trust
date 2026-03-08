import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert, Shield, ShieldCheck } from "lucide-react";
import { runAdversarialStressTest, type AdversarialResult } from "@/lib/adversarialStressTester";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

interface AdversarialStressTestProps {
  result: AnalysisResult;
  className?: string;
}

const statusConfig = {
  robust: { label: "Robust", color: "text-trust-high", Icon: ShieldCheck },
  moderate: { label: "Moderately Sensitive", color: "text-trust-medium", Icon: Shield },
  unstable: { label: "Detector Instability", color: "text-trust-low", Icon: ShieldAlert },
};

const AdversarialStressTestPanel = ({ result, className }: AdversarialStressTestProps) => {
  const advResult: AdversarialResult = useMemo(() => runAdversarialStressTest(result), [result]);
  const overall = statusConfig[advResult.overallStability];

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-secondary/30", className)}>
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Adversarial Stress Test
        </h4>
      </div>

      {/* Overall status */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/50">
        <overall.Icon className={cn("w-5 h-5", overall.color)} />
        <div>
          <span className={cn("text-sm font-medium", overall.color)}>{overall.label}</span>
          <p className="text-xs text-muted-foreground">
            Average drift: {advResult.averageDrift} | Stability: {advResult.adversarialStabilityScore}
          </p>
        </div>
      </div>

      {/* Per-perturbation results */}
      <div className="space-y-3">
        {advResult.perturbations.map((p, i) => {
          const cfg = statusConfig[p.status];
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span className={cn("text-xs font-mono px-2 py-0.5 rounded-full border",
                  p.status === "robust" ? "bg-trust-high/10 text-trust-high border-trust-high/20" :
                  p.status === "moderate" ? "bg-trust-medium/10 text-trust-medium border-trust-medium/20" :
                  "bg-trust-low/10 text-trust-low border-trust-low/20"
                )}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{p.description}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">
                  Original: <span className="font-mono text-foreground">{p.originalScore}</span>
                </span>
                <span className="text-muted-foreground">
                  Adversarial: <span className="font-mono text-foreground">{p.adversarialScore}</span>
                </span>
                <span className="text-muted-foreground">
                  Drift: <span className={cn("font-mono", cfg.color)}>{p.drift}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        Adversarial perturbations simulate attack vectors that attempt to fool detection models. Low drift indicates the detector maintains stable classification under adversarial conditions.
      </p>
    </div>
  );
};

export default AdversarialStressTestPanel;
