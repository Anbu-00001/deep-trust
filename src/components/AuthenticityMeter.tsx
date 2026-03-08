import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface AuthenticityMeterProps {
  trustScore: number;
  className?: string;
}

const AuthenticityMeter = ({ trustScore, className }: AuthenticityMeterProps) => {
  // Invert: trustScore is authenticity (100=authentic), but the meter shows manipulation probability
  // Range: 0-30 = Likely Authentic, 30-60 = Suspicious, 60-100 = Likely Manipulated
  const manipulationScore = 100 - trustScore;

  const getStatus = () => {
    if (manipulationScore < 30) return { label: "Likely Authentic", color: "text-trust-high", bg: "bg-trust-high", Icon: ShieldCheck };
    if (manipulationScore < 60) return { label: "Suspicious", color: "text-trust-medium", bg: "bg-trust-medium", Icon: ShieldAlert };
    return { label: "Likely Manipulated", color: "text-trust-low", bg: "bg-trust-low", Icon: ShieldX };
  };

  const { label, color, bg, Icon } = getStatus();
  const percentage = Math.min(100, Math.max(0, manipulationScore));

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-secondary/30", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn("w-5 h-5", color)} />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Authenticity Meter
        </h4>
      </div>

      {/* Score display */}
      <div className="flex items-end gap-3 mb-4">
        <span className={cn("text-4xl font-bold font-mono", color)}>{trustScore}</span>
        <span className="text-sm text-muted-foreground mb-1">/ 100</span>
        <span className={cn("ml-auto text-sm font-medium px-3 py-1 rounded-full border", 
          manipulationScore < 30 ? "bg-trust-high/10 text-trust-high border-trust-high/20" :
          manipulationScore < 60 ? "bg-trust-medium/10 text-trust-medium border-trust-medium/20" :
          "bg-trust-low/10 text-trust-low border-trust-low/20"
        )}>
          {label}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-2">
        <div
          className={cn("h-full rounded-full transition-all duration-700", bg)}
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>Manipulated</span>
        <span>Authentic</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Final score derived from multimodal analysis including visual, structural, temporal, and robustness signals.
      </p>
    </div>
  );
};

export default AuthenticityMeter;
