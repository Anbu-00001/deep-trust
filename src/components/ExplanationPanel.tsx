import { Info, AlertCircle, CheckCircle, Eye, Fingerprint, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Observation {
  type: "positive" | "neutral" | "concern";
  title: string;
  description: string;
}

interface ExplanationPanelProps {
  observations?: Observation[];
  verdict?: string;
  trustScore?: number;
  analysisTime?: number;
}

const defaultObservations: Observation[] = [
  {
    type: "positive",
    title: "Consistent Structural Topology",
    description: "Facial keypoint graph shows expected spatial relationships with minimal irregularities in landmark positioning."
  },
  {
    type: "positive",
    title: "Stable Confidence Under Stress",
    description: "Trust score maintained above 85% across 4 of 5 robustness conditions, indicating genuine structural consistency."
  },
  {
    type: "concern",
    title: "Minor Mouth Region Anomaly",
    description: "Slight irregularity detected in lower facial region keypoints. This may indicate editing or could be natural expression variance."
  },
  {
    type: "neutral",
    title: "Motion Blur Sensitivity",
    description: "22% confidence drift under motion simulation is within expected parameters for this media type."
  }
];

const getIconForObservation = (index: number) => {
  const icons = [Fingerprint, Activity, Eye, Info, AlertCircle];
  const Icon = icons[index % icons.length];
  return <Icon className="w-5 h-5" />;
};

const ExplanationPanel = ({ 
  observations = defaultObservations,
  verdict = "Likely Authentic",
  trustScore = 87,
  analysisTime = 1.8
}: ExplanationPanelProps) => {
  const getTypeStyles = (type: Observation["type"]) => {
    switch (type) {
      case "positive":
        return {
          bg: "bg-trust-high/10",
          border: "border-trust-high/20",
          icon: "text-trust-high"
        };
      case "concern":
        return {
          bg: "bg-trust-low/10",
          border: "border-trust-low/20",
          icon: "text-trust-low"
        };
      default:
        return {
          bg: "bg-secondary/50",
          border: "border-border",
          icon: "text-muted-foreground"
        };
    }
  };

  const getVerdictStyles = () => {
    if (trustScore >= 70) {
      return {
        bg: "bg-trust-high/10",
        border: "border-trust-high/20",
        iconBg: "bg-trust-high/20",
        text: "text-trust-high"
      };
    }
    if (trustScore >= 40) {
      return {
        bg: "bg-trust-medium/10",
        border: "border-trust-medium/20",
        iconBg: "bg-trust-medium/20",
        text: "text-trust-medium"
      };
    }
    return {
      bg: "bg-trust-low/10",
      border: "border-trust-low/20",
      iconBg: "bg-trust-low/20",
      text: "text-trust-low"
    };
  };

  const verdictStyles = getVerdictStyles();
  const VerdictIcon = trustScore >= 70 ? CheckCircle : trustScore >= 40 ? AlertCircle : AlertCircle;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analysis Explanation</h3>
        <span className="text-sm text-muted-foreground">{observations.length} observations</span>
      </div>

      {/* Summary verdict */}
      <div className={cn("p-4 rounded-xl border", verdictStyles.bg, verdictStyles.border)}>
        <div className="flex items-start gap-4">
          <div className={cn("p-2 rounded-lg", verdictStyles.iconBg)}>
            <VerdictIcon className={cn("w-6 h-6", verdictStyles.text)} />
          </div>
          <div>
            <h4 className={cn("font-semibold", verdictStyles.text)}>{verdict}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {trustScore >= 70 
                ? "Based on structural analysis and robustness testing, this media shows characteristics consistent with authentic content."
                : trustScore >= 40
                ? "This media shows some irregularities that warrant further review. Results are inconclusive."
                : "This media exhibits multiple indicators of potential manipulation or AI generation."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Observations list */}
      <div className="space-y-3">
        {observations.map((obs, index) => {
          const styles = getTypeStyles(obs.type);
          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border transition-all duration-300",
                styles.bg,
                styles.border
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fade-in-up 0.5s ease-out forwards"
              }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", styles.icon)}>
                  {getIconForObservation(index)}
                </div>
                <div>
                  <h4 className="font-medium">{obs.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {obs.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical details toggle */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>
            Analysis completed in {analysisTime}s using AI-powered structural graph topology and 5-condition robustness testing.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;
