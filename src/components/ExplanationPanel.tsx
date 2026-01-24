import { Info, AlertCircle, CheckCircle, Eye, Fingerprint, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Observation {
  type: "positive" | "neutral" | "concern";
  icon: React.ReactNode;
  title: string;
  description: string;
}

const observations: Observation[] = [
  {
    type: "positive",
    icon: <Fingerprint className="w-5 h-5" />,
    title: "Consistent Structural Topology",
    description: "Facial keypoint graph shows expected spatial relationships with minimal irregularities in landmark positioning."
  },
  {
    type: "positive",
    icon: <Activity className="w-5 h-5" />,
    title: "Stable Confidence Under Stress",
    description: "Trust score maintained above 85% across 4 of 5 robustness conditions, indicating genuine structural consistency."
  },
  {
    type: "concern",
    icon: <Eye className="w-5 h-5" />,
    title: "Minor Mouth Region Anomaly",
    description: "Slight irregularity detected in lower facial region keypoints. This may indicate editing or could be natural expression variance."
  },
  {
    type: "neutral",
    icon: <Info className="w-5 h-5" />,
    title: "Motion Blur Sensitivity",
    description: "22% confidence drift under motion simulation is within expected parameters for this media type."
  }
];

const ExplanationPanel = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analysis Explanation</h3>
        <span className="text-sm text-muted-foreground">4 observations</span>
      </div>

      {/* Summary verdict */}
      <div className="p-4 rounded-xl bg-trust-high/10 border border-trust-high/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-trust-high/20">
            <CheckCircle className="w-6 h-6 text-trust-high" />
          </div>
          <div>
            <h4 className="font-semibold text-trust-high">Likely Authentic</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Based on structural analysis and robustness testing, this media shows characteristics 
              consistent with authentic content. Minor anomalies detected do not indicate manipulation.
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
                  {obs.icon}
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
            Analysis completed in 1.8s using structural graph topology and 5-condition robustness testing.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;
