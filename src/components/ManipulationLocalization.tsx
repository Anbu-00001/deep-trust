import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { ManipulationRegion } from "@/hooks/useMediaAnalysis";

interface ManipulationLocalizationProps {
  regions?: ManipulationRegion[];
  className?: string;
}

const REGION_DISPLAY_NAMES: Record<string, string> = {
  left_eye: "Left Eye",
  right_eye: "Right Eye",
  lip_boundary: "Mouth / Lip Boundary",
  left_cheek: "Left Cheek",
  right_cheek: "Right Cheek",
  nose_bridge: "Nose Bridge",
  hairline: "Hairline / Forehead",
};

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "high": return { badge: "bg-trust-low/20 text-trust-low border-trust-low/30", text: "text-trust-low" };
    case "medium": return { badge: "bg-trust-medium/20 text-trust-medium border-trust-medium/30", text: "text-trust-medium" };
    default: return { badge: "bg-trust-high/20 text-trust-high border-trust-high/30", text: "text-trust-high" };
  }
};

const ManipulationLocalization = ({ regions = [], className }: ManipulationLocalizationProps) => {
  const flaggedRegions = regions.filter(r => r.severity === "medium" || r.severity === "high");

  return (
    <Card className={cn("bg-secondary/30 border-border", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          Manipulation Localization
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-4">
        {flaggedRegions.length > 0 ? (
          <>
            {/* Region table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">Region</th>
                    <th className="text-center py-2 font-medium">Severity</th>
                    <th className="text-right py-2 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedRegions.map((region, idx) => {
                    const style = getSeverityStyle(region.severity);
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-2.5 font-medium">
                          {REGION_DISPLAY_NAMES[region.region] || region.region}
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge variant="outline" className={cn("text-xs capitalize", style.badge)}>
                            {region.severity}
                          </Badge>
                        </td>
                        <td className={cn("py-2.5 text-right font-mono text-xs", style.text)}>
                          {(region.score * 100).toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Evidence explanation */}
            <div className="pt-3 border-t border-border space-y-1.5">
              <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Evidence Explanation
              </h5>
              <ul className="space-y-1">
                {flaggedRegions.map((region, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className={getSeverityStyle(region.severity).text}>•</span>
                    {region.description}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-md bg-trust-high/10 border border-trust-high/20">
            <CheckCircle className="w-5 h-5 text-trust-high flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-trust-high">No Localized Manipulation Detected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No facial regions exhibit elevated or high-severity anomaly patterns.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Region-level localization maps heatmap attention to specific facial zones. 
              High-severity regions indicate where the detection model identified potential manipulation artifacts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManipulationLocalization;
