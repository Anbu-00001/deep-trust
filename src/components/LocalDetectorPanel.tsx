import { Cpu, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DETECTOR_MODELS, interpretDetectorSignals, type LocalDetectorSignals } from "@/lib/detectorModels";

interface Props {
  signals?: LocalDetectorSignals | null;
  failureReason?: string | null;
  compact?: boolean;
}

const bandStyle = {
  ai_indicated: "border-destructive/50 bg-destructive/10 text-destructive",
  camera_consistent: "border-success/40 bg-success/10 text-success",
  inconclusive: "border-accent/50 bg-accent/10 text-accent",
} as const;

const LocalDetectorPanel = ({ signals, failureReason, compact }: Props) => {
  if (!signals) {
    return (
      <div className="rounded border border-border bg-background p-3 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase"><AlertTriangle className="h-3.5 w-3.5 text-accent" /> Local detectors not run</div>
        {failureReason || "Detector inference applies to still images."}
      </div>
    );
  }
  const verdict = interpretDetectorSignals(signals);
  return (
    <div className="rounded border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground"><Cpu className="h-3.5 w-3.5 text-primary" /> Measured · on-device detectors</p>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">{signals.models.length} models</span>
      </div>
      <div className={cn("mb-3 rounded border p-3", bandStyle[verdict.band])}>
        <p className="text-sm font-semibold">{verdict.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{verdict.explanation}</p>
      </div>
      <div className="space-y-3">
        {signals.models.map((m) => {
          const pct = Math.round(m.probabilityAi * 100);
          const over = m.probabilityAi >= m.threshold;
          return (
            <div key={m.modelId}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{m.modelName}</span>
                <span className={cn("font-mono", over ? "text-destructive" : "text-foreground")}>{pct}% AI score</span>
              </div>
              <div className="relative h-1.5 bg-secondary">
                <div className={cn("h-full", over ? "bg-destructive" : "bg-primary")} style={{ width: `${pct}%` }} />
                <div className="absolute top-[-3px] h-[12px] w-px bg-foreground" style={{ left: `${m.threshold * 100}%` }} title="Published decision threshold" />
              </div>
              {!compact && (
                <p className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-success" /> SHA-256 verified · threshold {m.threshold} · {m.latencyMs}ms
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          <p>Raw model scores, not calibrated probabilities. Both models share one family, so agreement is not fully independent. The image never left this browser.</p>
          {DETECTOR_MODELS.map((m) => <p key={m.id}><span className="text-foreground">{m.shortName}:</span> {m.provenance}</p>)}
        </div>
      )}
    </div>
  );
};

export default LocalDetectorPanel;
