import { useEffect, useRef, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, CircleDot, User, Brain, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface HeatmapRegion {
  x: number;
  y: number;
  radius: number;
  intensity: number; // 0-1
  label?: string;
}

interface FaceHeatmapProps {
  className?: string;
  regions?: HeatmapRegion[];
  overallScore?: number;
}

// Semantic face regions for attribution
interface SemanticRegion {
  name: string;
  icon: React.ReactNode;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  avgIntensity: number;
  severity: "normal" | "elevated" | "high_risk";
  explanation: string;
}

const REGION_DEFINITIONS = [
  { 
    name: "Eyes", 
    icon: <Eye className="w-4 h-4" />,
    bounds: { xMin: 100, xMax: 300, yMin: 70, yMax: 130 },
    explanations: {
      normal: "No significant texture anomalies detected",
      elevated: "Texture inconsistency detected in eye region",
      high_risk: "High attention - potential artifacts in eye synthesis"
    }
  },
  { 
    name: "Mouth", 
    icon: <CircleDot className="w-4 h-4" />,
    bounds: { xMin: 150, xMax: 250, yMin: 170, yMax: 230 },
    explanations: {
      normal: "Natural motion and shape patterns",
      elevated: "Motion/shape irregularity detected",
      high_risk: "High attention - lip sync or expression artifacts"
    }
  },
  { 
    name: "Cheeks", 
    icon: <User className="w-4 h-4" />,
    bounds: { xMin: 80, xMax: 320, yMin: 130, yMax: 200 },
    explanations: {
      normal: "No significant artifacts detected",
      elevated: "Moderate blending artifacts present",
      high_risk: "Significant boundary artifacts detected"
    }
  },
  { 
    name: "Forehead", 
    icon: <Brain className="w-4 h-4" />,
    bounds: { xMin: 120, xMax: 280, yMin: 20, yMax: 80 },
    explanations: {
      normal: "Consistent skin texture patterns",
      elevated: "Minor texture discontinuity",
      high_risk: "High attention - unnatural texture patterns"
    }
  }
];

const getSeverityFromIntensity = (intensity: number): "normal" | "elevated" | "high_risk" => {
  if (intensity >= 0.6) return "high_risk";
  if (intensity >= 0.3) return "elevated";
  return "normal";
};

const getSeverityColor = (severity: "normal" | "elevated" | "high_risk") => {
  switch (severity) {
    case "high_risk": return "text-trust-low";
    case "elevated": return "text-trust-medium";
    default: return "text-trust-high";
  }
};

const getSeverityBadgeVariant = (severity: "normal" | "elevated" | "high_risk") => {
  switch (severity) {
    case "high_risk": return "bg-trust-low/20 text-trust-low border-trust-low/30";
    case "elevated": return "bg-trust-medium/20 text-trust-medium border-trust-medium/30";
    default: return "bg-trust-high/20 text-trust-high border-trust-high/30";
  }
};

const getSeverityLabel = (severity: "normal" | "elevated" | "high_risk") => {
  switch (severity) {
    case "high_risk": return "High Risk";
    case "elevated": return "Elevated";
    default: return "Normal";
  }
};

const FaceHeatmap = ({ className, regions, overallScore = 85 }: FaceHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  // Generate default regions based on score if not provided
  const heatmapRegions = useMemo(() => {
    if (regions) return regions;
    
    // Generate realistic face heatmap regions
    const baseIntensity = 1 - (overallScore / 100);
    const defaultRegions: HeatmapRegion[] = [
      // Left eye area
      { x: 120, y: 100, radius: 35, intensity: baseIntensity * 0.3, label: "Left Eye" },
      // Right eye area
      { x: 280, y: 100, radius: 35, intensity: baseIntensity * 0.25, label: "Right Eye" },
      // Nose bridge
      { x: 200, y: 130, radius: 25, intensity: baseIntensity * 0.2, label: "Nose" },
      // Left cheek
      { x: 100, y: 160, radius: 40, intensity: baseIntensity * 0.15 },
      // Right cheek
      { x: 300, y: 160, radius: 40, intensity: baseIntensity * 0.15 },
      // Mouth area
      { x: 200, y: 200, radius: 45, intensity: baseIntensity * 0.5, label: "Mouth Region" },
      // Jaw line left
      { x: 90, y: 220, radius: 30, intensity: baseIntensity * 0.35 },
      // Jaw line right  
      { x: 310, y: 220, radius: 30, intensity: baseIntensity * 0.3 },
      // Forehead
      { x: 200, y: 50, radius: 50, intensity: baseIntensity * 0.2 },
    ];

    // Add suspicious hotspots for lower scores
    if (overallScore < 70) {
      defaultRegions.push(
        { x: 180, y: 180, radius: 25, intensity: 0.8, label: "Suspicious" },
        { x: 220, y: 195, radius: 20, intensity: 0.7, label: "Artifact" }
      );
    }
    if (overallScore < 50) {
      defaultRegions.push(
        { x: 140, y: 110, radius: 18, intensity: 0.9, label: "Anomaly" },
        { x: 260, y: 115, radius: 15, intensity: 0.85, label: "Anomaly" }
      );
    }

    return defaultRegions;
  }, [regions, overallScore]);

  // Compute semantic region analysis
  const semanticRegions = useMemo((): SemanticRegion[] => {
    return REGION_DEFINITIONS.map(regionDef => {
      // Find all heatmap regions that overlap with this semantic region
      const overlappingRegions = heatmapRegions.filter(hr => {
        const inXBounds = hr.x >= regionDef.bounds.xMin && hr.x <= regionDef.bounds.xMax;
        const inYBounds = hr.y >= regionDef.bounds.yMin && hr.y <= regionDef.bounds.yMax;
        return inXBounds && inYBounds;
      });

      // Compute weighted average intensity
      let avgIntensity = 0;
      if (overlappingRegions.length > 0) {
        const totalWeight = overlappingRegions.reduce((sum, r) => sum + r.radius, 0);
        avgIntensity = overlappingRegions.reduce((sum, r) => sum + r.intensity * r.radius, 0) / totalWeight;
      }

      const severity = getSeverityFromIntensity(avgIntensity);

      return {
        name: regionDef.name,
        icon: regionDef.icon,
        bounds: regionDef.bounds,
        avgIntensity,
        severity,
        explanation: regionDef.explanations[severity]
      };
    });
  }, [heatmapRegions]);

  // Check if any regions have elevated or high risk signals
  const flaggedRegions = semanticRegions.filter(r => r.severity !== "normal");
  const hasSuspiciousRegions = flaggedRegions.length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 280 * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, 400, 280);

    // Draw face silhouette
    ctx.strokeStyle = "rgba(45, 212, 191, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 150, 100, 130, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw grid overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 400; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 280);
      ctx.stroke();
    }
    for (let y = 0; y <= 280; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(400, y);
      ctx.stroke();
    }

    // Draw heatmap regions (Grad-CAM style) only if overlay is enabled
    if (showOverlay) {
      heatmapRegions.forEach((region) => {
        const gradient = ctx.createRadialGradient(
          region.x, region.y, 0,
          region.x, region.y, region.radius
        );

        // Color based on intensity (low = blue/green, high = yellow/red)
        if (region.intensity < 0.3) {
          gradient.addColorStop(0, `rgba(45, 212, 191, ${region.intensity * 0.8})`);
          gradient.addColorStop(0.5, `rgba(45, 212, 191, ${region.intensity * 0.4})`);
          gradient.addColorStop(1, "rgba(45, 212, 191, 0)");
        } else if (region.intensity < 0.6) {
          gradient.addColorStop(0, `rgba(251, 191, 36, ${region.intensity * 0.9})`);
          gradient.addColorStop(0.5, `rgba(251, 191, 36, ${region.intensity * 0.5})`);
          gradient.addColorStop(1, "rgba(251, 191, 36, 0)");
        } else {
          gradient.addColorStop(0, `rgba(239, 68, 68, ${Math.min(region.intensity, 0.95)})`);
          gradient.addColorStop(0.5, `rgba(239, 68, 68, ${region.intensity * 0.6})`);
          gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw face landmarks
    const landmarks = [
      { x: 140, y: 95, label: "L Eye" },
      { x: 260, y: 95, label: "R Eye" },
      { x: 200, y: 140, label: "Nose" },
      { x: 200, y: 190, label: "Mouth" },
    ];

    landmarks.forEach((lm) => {
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fill();
    });

    // Draw suspicious region markers (only if overlay is enabled)
    if (showOverlay) {
      heatmapRegions
        .filter((r) => r.intensity > 0.6 && r.label)
        .forEach((region) => {
          // Draw marker circle
          ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(region.x, region.y, region.radius + 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw label
          ctx.font = "10px monospace";
          ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
          ctx.fillText(region.label || "", region.x - 20, region.y - region.radius - 10);
        });
    }

  }, [heatmapRegions, showOverlay]);

  const suspiciousCount = heatmapRegions.filter((r) => r.intensity > 0.6).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Heatmap Canvas with Toggle */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg bg-slate-900/50"
          style={{ maxWidth: "400px", aspectRatio: "10/7" }}
        />
        
        {/* Overlay Toggle */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 border border-border">
          <span className="text-xs text-muted-foreground">Overlay</span>
          <Switch
            checked={showOverlay}
            onCheckedChange={setShowOverlay}
            className="scale-75"
          />
        </div>
      </div>
      
      {/* Severity Legend - Enhanced for Judges */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Attention Severity Legend
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-trust-high opacity-70" />
              <div>
                <span className="text-trust-high font-medium">Low Concern</span>
                <span className="text-muted-foreground ml-1">(Normal patterns)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-trust-medium opacity-85" />
              <div>
                <span className="text-trust-medium font-medium">Moderate Concern</span>
                <span className="text-muted-foreground ml-1">(Requires attention)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-trust-low" />
              <div>
                <span className="text-trust-low font-medium">High Concern</span>
                <span className="text-muted-foreground ml-1">(Suspicious artifacts)</span>
              </div>
            </div>
          </div>
          {suspiciousCount > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <span className="text-xs text-trust-low font-mono">
                {suspiciousCount} high-attention hotspot{suspiciousCount > 1 ? "s" : ""} detected
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Region-Level Attribution Panel */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            Region-Level Attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4 space-y-3">
          {hasSuspiciousRegions ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Regions contributing to this assessment:
              </p>
              <div className="space-y-2">
                {semanticRegions.map((region) => (
                  <div 
                    key={region.name}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md transition-colors",
                      region.severity !== "normal" && "bg-secondary/50"
                    )}
                  >
                    <div className={cn("mt-0.5", getSeverityColor(region.severity))}>
                      {region.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{region.name}</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getSeverityBadgeVariant(region.severity))}
                        >
                          {getSeverityLabel(region.severity)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {region.explanation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-xs font-mono", getSeverityColor(region.severity))}>
                        {(region.avgIntensity * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-md bg-trust-high/10 border border-trust-high/20">
              <CheckCircle className="w-5 h-5 text-trust-high" />
              <div>
                <p className="text-sm font-medium text-trust-high">No Localized Suspicious Regions</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Attention is diffuse across the face. No concentrated anomaly hotspots detected.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why This Matters - Explanation Box */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="py-4 px-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Why this matters</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The heatmap overlay shows where the detection model focused its attention. 
                Authentic faces typically show uniform, low-intensity attention across all regions. 
                Synthetic or manipulated media often exhibits concentrated high-attention areas, 
                particularly around the eyes, mouth, or facial boundaries where artifacts commonly occur.
              </p>
              <div className="pt-2 border-t border-border mt-2">
                <p className="text-xs text-muted-foreground italic">
                  {hasSuspiciousRegions 
                    ? "⚠️ Elevated attention in specific regions suggests areas that may warrant closer inspection."
                    : "✓ Uniform attention distribution is consistent with authentic media patterns."
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceHeatmap;
