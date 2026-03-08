import { cn } from "@/lib/utils";
import { AlertTriangle, Eye, Ear, Clock, Shield, FileQuestion, Activity } from "lucide-react";
import type { ForensicEvidenceObject, EvidenceCategory } from "@/lib/forensicEvidence";

interface EvidenceObjectListProps {
  evidence: ForensicEvidenceObject[];
  className?: string;
}

const categoryConfig: Record<EvidenceCategory, { icon: typeof Eye; label: string }> = {
  visual_artifact: { icon: Eye, label: "Visual Artifact" },
  audio_anomaly: { icon: Ear, label: "Audio Anomaly" },
  temporal_drift: { icon: Clock, label: "Temporal Drift" },
  robustness_instability: { icon: Activity, label: "Robustness" },
  structural_inconsistency: { icon: Shield, label: "Structural" },
  metadata_irregularity: { icon: FileQuestion, label: "Metadata" },
};

const severityStyles = {
  low: "bg-trust-high/10 text-trust-high border-trust-high/20",
  medium: "bg-trust-medium/10 text-trust-medium border-trust-medium/20",
  high: "bg-trust-low/10 text-trust-low border-trust-low/20",
};

const EvidenceObjectList = ({ evidence, className }: EvidenceObjectListProps) => {
  if (evidence.length === 0) {
    return (
      <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border text-center", className)}>
        <p className="text-sm text-muted-foreground">No forensic evidence objects generated.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          Forensic Evidence Objects
        </h4>
        <span className="text-xs text-muted-foreground font-mono">{evidence.length} objects</span>
      </div>

      <div className="space-y-2">
        {evidence.map((ev) => {
          const config = categoryConfig[ev.category];
          const Icon = config.icon;
          return (
            <div
              key={ev.id}
              className="p-3 rounded-lg bg-secondary/30 border border-border flex items-start gap-3"
            >
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{ev.id}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border", severityStyles[ev.severity])}>
                    {ev.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                  {ev.timestamp !== null && (
                    <span className="text-xs font-mono text-muted-foreground">@ {ev.timestamp.toFixed(1)}s</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{ev.description}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  Module: {ev.module} • Confidence: {(ev.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvidenceObjectList;
