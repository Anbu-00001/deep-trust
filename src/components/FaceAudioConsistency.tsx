import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, HelpCircle, Volume2 } from "lucide-react";

interface FaceAudioConsistencyProps {
  mediaType: "image" | "video" | "audio";
  visualScore: number;
  audioScore: number | null;
  className?: string;
}

/**
 * Lightweight Face-Audio Consistency indicator.
 * Reads existing visual and audio scores — no new models.
 */
const FaceAudioConsistency = ({ mediaType, visualScore, audioScore, className }: FaceAudioConsistencyProps) => {
  const hasAudio = audioScore !== null && mediaType !== "image";

  if (!hasAudio) {
    return (
      <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Face-Audio Consistency
          </h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Audio stream not available for cross-modal verification.
        </p>
      </div>
    );
  }

  // Compute lightweight similarity from existing scores
  const visualNorm = visualScore / 100;
  const audioNorm = (audioScore ?? 0) / 100;
  const consistencyScore = Math.round((1 - Math.abs(visualNorm - audioNorm)) * 100) / 100;

  const getStatus = () => {
    if (consistencyScore >= 0.6) return { label: "Consistent", color: "text-trust-high", Icon: CheckCircle, bgColor: "bg-trust-high/10 border-trust-high/20" };
    if (consistencyScore >= 0.4) return { label: "Uncertain", color: "text-trust-medium", Icon: HelpCircle, bgColor: "bg-trust-medium/10 border-trust-medium/20" };
    return { label: "Potential Mismatch", color: "text-trust-low", Icon: AlertTriangle, bgColor: "bg-trust-low/10 border-trust-low/20" };
  };

  const { label, color, Icon, bgColor } = getStatus();

  return (
    <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Face-Audio Consistency
          </h4>
        </div>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border", bgColor)}>
          <Icon className={cn("w-4 h-4", color)} />
          <span className={color}>{label}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-3">
        <div>
          <span className="text-xs text-muted-foreground block">Score</span>
          <span className={cn("text-2xl font-bold font-mono", color)}>{consistencyScore.toFixed(2)}</span>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500",
                consistencyScore >= 0.6 ? "bg-trust-high" :
                consistencyScore >= 0.4 ? "bg-trust-medium" : "bg-trust-low"
              )}
              style={{ width: `${consistencyScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {consistencyScore < 0.4
          ? "Voice characteristics appear inconsistent with facial motion patterns."
          : consistencyScore < 0.6
          ? "Synchronization patterns show some variability between face and audio."
          : "Face motion and audio speech patterns show consistent synchronization."}
      </p>
    </div>
  );
};

export default FaceAudioConsistency;
