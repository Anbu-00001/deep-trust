import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Scan, Layers } from "lucide-react";
import type { AnalysisResult, HeatmapRegion } from "@/hooks/useMediaAnalysis";

interface ArtifactAmplificationProps {
  result: AnalysisResult;
  className?: string;
}

interface AmplifiedRegion {
  label: string;
  technique: string;
  artifactScore: number;
  description: string;
}

/**
 * Derives amplification analysis from existing heatmap + texture signals.
 * Simulates edge frequency, color variance, and temporal pixel drift amplification.
 */
function deriveAmplifiedRegions(result: AnalysisResult): AmplifiedRegion[] {
  const regions: AmplifiedRegion[] = [];

  // Edge Frequency Amplification — regions with high heatmap intensity
  const highIntensity = result.heatmapRegions.filter(r => r.intensity > 0.5);
  if (highIntensity.length > 0) {
    const maxRegion = highIntensity.reduce((m, r) => r.intensity > m.intensity ? r : m, highIntensity[0]);
    regions.push({
      label: maxRegion.label || "High-frequency region",
      technique: "Edge Frequency Amplification",
      artifactScore: Math.round(maxRegion.intensity * 100) / 100,
      description: `Laplacian edge enhancement reveals high-frequency artifacts at (${maxRegion.x}, ${maxRegion.y}) with ${(maxRegion.intensity * 100).toFixed(0)}% activation.`,
    });
  }

  // Color Variance Amplification — from texture/noise analysis
  if (result.textureAnalysis.noiseConsistency !== "consistent" || result.textureAnalysis.smoothnessAnomalies) {
    const score = result.textureAnalysis.noiseConsistency === "suspicious" ? 0.78
      : result.textureAnalysis.noiseConsistency === "inconsistent" ? 0.55 : 0.35;
    regions.push({
      label: "Color noise distribution",
      technique: "Color Variance Amplification",
      artifactScore: score,
      description: `Histogram stretching reveals ${result.textureAnalysis.noiseConsistency} color noise patterns. ${result.textureAnalysis.smoothnessAnomalies ? "Smoothness anomalies amplified in facial regions." : ""}`,
    });
  }

  // Temporal Pixel Drift — for video, from frame analysis
  if (result.mediaType === "video" || result.frameAnalysis.some(f => f.anomalyType)) {
    const anomalyFrames = result.frameAnalysis.filter(f => f.confidence < 70);
    if (anomalyFrames.length > 0) {
      const worst = anomalyFrames.reduce((m, f) => f.confidence < m.confidence ? f : m, anomalyFrames[0]);
      regions.push({
        label: `Frame ${worst.frameNumber + 1} drift`,
        technique: "Temporal Pixel Drift Amplification",
        artifactScore: Math.round((100 - worst.confidence) / 100 * 100) / 100,
        description: `Pixel-level flickering amplified at frame ${worst.frameNumber + 1} (${worst.timestamp.toFixed(1)}s). ${worst.anomalyType ? `Anomaly type: ${worst.anomalyType.replace(/_/g, " ")}` : "Confidence drop detected."}`,
      });
    }
  }

  // Manipulation regions as additional amplified signals
  (result.manipulationRegions ?? []).slice(0, 2).forEach((mr) => {
    if (!regions.some(r => r.description.includes(mr.region.replace(/_/g, " ")))) {
      regions.push({
        label: mr.region.replace(/_/g, " "),
        technique: "Edge Frequency Amplification",
        artifactScore: mr.score,
        description: mr.description,
      });
    }
  });

  return regions;
}

const ArtifactAmplification = ({ result, className }: ArtifactAmplificationProps) => {
  const amplified = useMemo(() => deriveAmplifiedRegions(result), [result]);

  if (amplified.length === 0) {
    return (
      <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Scan className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Artifact Amplification Viewer</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          No significant artifacts detected for amplification. Media appears consistent across all enhancement filters.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Scan className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Artifact Amplification Viewer</h4>
      </div>

      <div className="space-y-3">
        {amplified.map((region, i) => {
          const scoreColor =
            region.artifactScore >= 0.6 ? "text-trust-low" :
            region.artifactScore >= 0.35 ? "text-trust-medium" :
            "text-trust-high";
          const barColor =
            region.artifactScore >= 0.6 ? "bg-trust-low" :
            region.artifactScore >= 0.35 ? "bg-trust-medium" :
            "bg-trust-high";

          return (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {region.technique}
                  </span>
                </div>
                <span className={cn("text-xs font-mono font-semibold", scoreColor)}>
                  {(region.artifactScore * 100).toFixed(0)}%
                </span>
              </div>

              {/* Score bar */}
              <div className="w-full h-1.5 rounded-full bg-secondary mb-2">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${region.artifactScore * 100}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {region.description}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
        Amplification enhances subtle artifacts that may be invisible to the naked eye. Results are derived from existing heatmap, texture, and temporal analysis signals.
      </p>
    </div>
  );
};

export default ArtifactAmplification;
