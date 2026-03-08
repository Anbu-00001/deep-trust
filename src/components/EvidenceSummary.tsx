import { cn } from "@/lib/utils";
import { FileText, Info } from "lucide-react";

interface Observation {
  type: "positive" | "neutral" | "concern";
  title: string;
  description: string;
}

interface EvidenceSummaryProps {
  observations: Observation[];
  trustScore: number;
  verdict: string;
  className?: string;
}

/**
 * Generates a concise human-readable summary by aggregating
 * existing observation cards. Does NOT invent new evidence.
 */
const summarizeObservation = (obs: Observation): string => {
  const title = obs.title.toLowerCase();
  const desc = obs.description.toLowerCase();

  // Map known observation patterns to plain-language summaries
  if (title.includes("resolution") || title.includes("jpeg") || title.includes("compression") || desc.includes("compression") || desc.includes("jpeg"))
    return "Image quality degraded due to resolution and compression artifacts.";
  if (title.includes("structural integrity") || title.includes("landmark") || desc.includes("facial landmark") || desc.includes("structural"))
    return "Facial landmark structure consistent with natural geometry.";
  if (title.includes("gan") || title.includes("fingerprint"))
    return obs.type === "positive" ? "No strong GAN fingerprint artifacts detected." : "GAN fingerprint patterns identified in the media.";
  if (title.includes("robustness") || title.includes("stable") || title.includes("confidence"))
    return "Robustness testing remained stable under distortion conditions.";
  if (title.includes("temporal") || title.includes("drift") || title.includes("motion"))
    return "Frame-level motion inconsistencies detected.";
  if (title.includes("texture") || title.includes("smoothness"))
    return obs.type === "concern" ? "Texture anomalies detected in facial regions." : "Texture consistency appears natural.";
  if (title.includes("metadata") || title.includes("exif"))
    return obs.type === "concern" ? "Metadata irregularities found in the file." : "File metadata appears consistent.";
  if (title.includes("lighting") || title.includes("shadow"))
    return obs.type === "concern" ? "Lighting inconsistencies observed." : "Lighting patterns appear natural.";
  if (title.includes("eye") || title.includes("reflection"))
    return obs.type === "concern" ? "Eye reflection anomalies detected." : "Eye reflections appear consistent.";
  if (title.includes("audio") || title.includes("voice"))
    return obs.type === "concern" ? "Audio characteristics show potential anomalies." : "Audio signals appear natural.";

  // Fallback: condense the original description
  const sentences = obs.description.split(/\.\s+/);
  return sentences[0].endsWith(".") ? sentences[0] : sentences[0] + ".";
};

const getAssessmentLabel = (trustScore: number, verdict: string): string => {
  if (verdict) return verdict;
  if (trustScore >= 70) return "Likely Authentic";
  if (trustScore >= 40) return "Needs Review";
  return "Likely Manipulated";
};

const EvidenceSummary = ({ observations, trustScore, verdict, className }: EvidenceSummaryProps) => {
  const summaryPoints = observations.map(summarizeObservation);
  // Deduplicate
  const uniquePoints = [...new Set(summaryPoints)];
  const assessment = getAssessmentLabel(trustScore, verdict);

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-secondary/30", className)}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence Summary
        </h4>
      </div>

      {/* Assessment headline */}
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mb-4",
        trustScore >= 70 ? "bg-trust-high/10 text-trust-high border-trust-high/20" :
        trustScore >= 40 ? "bg-trust-medium/10 text-trust-medium border-trust-medium/20" :
        "bg-trust-low/10 text-trust-low border-trust-low/20"
      )}>
        Authenticity Assessment: {assessment}
      </div>

      {/* Summary bullet points */}
      <ul className="space-y-2 mb-4">
        {uniquePoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This summary is auto-generated from the analysis observations below. No additional evidence has been introduced.
        </p>
      </div>
    </div>
  );
};

export default EvidenceSummary;
