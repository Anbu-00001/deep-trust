import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, Shield, TrendingUp, TrendingDown, Brain } from "lucide-react";
import type { VisualDeepfakeDetection, ConfidenceDrift } from "@/hooks/useMediaAnalysis";

interface ConfidenceDriftTableProps {
  detection?: VisualDeepfakeDetection;
  drift?: ConfidenceDrift;
}

const getSeverityColor = (score: number) => {
  if (score < 0.3) return "text-trust-high";
  if (score < 0.6) return "text-trust-medium";
  return "text-trust-low";
};

const getSeverityBg = (score: number) => {
  if (score < 0.3) return "bg-trust-high/10";
  if (score < 0.6) return "bg-trust-medium/10";
  return "bg-trust-low/10";
};

const ConfidenceDriftTable = ({ detection, drift }: ConfidenceDriftTableProps) => {
  if (!detection || !drift) return null;

  const conditions = [
    { label: "Clean", score: drift.cleanScore },
    { label: "Compressed", score: drift.compressedScore },
    { label: "Blurred", score: drift.blurredScore },
    { label: "Noise", score: drift.noiseScore },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Deepfake Detection Summary */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Visual Deepfake Detector
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {detection.modelUsed}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered deepfake probability estimation across sampled frames
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall probability */}
          <div className={cn(
            "p-4 rounded-lg border flex items-center justify-between",
            getSeverityBg(detection.visualDeepfakeProbability),
            detection.visualDeepfakeProbability >= 0.6 ? "border-trust-low/30" : 
            detection.visualDeepfakeProbability >= 0.3 ? "border-trust-medium/30" : "border-trust-high/30"
          )}>
            <div>
              <div className="font-medium">Visual Deepfake Probability</div>
              <div className="text-sm text-muted-foreground">
                Aggregated across {detection.frameScores.length} sampled frames
              </div>
            </div>
            <div className={cn("text-3xl font-mono font-bold", getSeverityColor(detection.visualDeepfakeProbability))}>
              {(detection.visualDeepfakeProbability * 100).toFixed(1)}%
            </div>
          </div>

          {/* Frame scores mini chart */}
          {detection.frameScores.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Per-Frame Scores</div>
              <div className="flex items-end gap-1 h-16">
                {detection.frameScores.map((score, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-t transition-all",
                      score < 0.3 ? "bg-trust-high/60" : score < 0.6 ? "bg-trust-medium/60" : "bg-trust-low/60"
                    )}
                    style={{ height: `${Math.max(10, score * 100)}%` }}
                    title={`Frame ${i + 1}: ${(score * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Frame 1</span>
                <span>Frame {detection.frameScores.length}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confidence Drift Table */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Model Confidence Drift
            </CardTitle>
            <Badge
              className={cn(
                "border",
                drift.stabilityStatus === "stable"
                  ? "bg-trust-high/20 text-trust-high border-trust-high/30"
                  : "bg-trust-low/20 text-trust-low border-trust-low/30"
              )}
            >
              {drift.stabilityStatus === "stable" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              Detection {drift.stabilityStatus === "stable" ? "Stable" : "Sensitive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Re-evaluates deepfake probability under simulated distortions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Fake Probability</TableHead>
                <TableHead className="text-right">Δ from Clean</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.map((c) => {
                const delta = c.score - drift.cleanScore;
                return (
                  <TableRow key={c.label}>
                    <TableCell className="font-medium">{c.label}</TableCell>
                    <TableCell className={cn("text-right font-mono", getSeverityColor(c.score))}>
                      {(c.score * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-mono",
                      Math.abs(delta) < 0.03 ? "text-trust-high" :
                      Math.abs(delta) < 0.08 ? "text-trust-medium" : "text-trust-low"
                    )}>
                      {delta >= 0 ? "+" : ""}{(delta * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Stability score */}
          <div className={cn(
            "p-4 rounded-lg border",
            drift.stabilityStatus === "stable"
              ? "bg-trust-high/10 border-trust-high/20"
              : "bg-trust-low/10 border-trust-low/20"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  Detection Stability: {drift.stabilityStatus === "stable" ? "Stable" : "Sensitive"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {drift.stabilityStatus === "stable"
                    ? "Predictions remain consistent under common distortions"
                    : "Predictions shift significantly under one or more distortions"
                  }
                </div>
              </div>
              <div className="text-2xl font-mono font-bold">
                {(drift.stabilityScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div className="font-medium text-sm">Why this matters</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Authentic detectors maintain stable predictions under common distortions such as 
                  compression or blur. Large probability shifts suggest the detection result may be 
                  fragile and should be interpreted with caution.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfidenceDriftTable;
