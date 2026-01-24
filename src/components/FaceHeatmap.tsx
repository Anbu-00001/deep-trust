import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

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

const FaceHeatmap = ({ className, regions, overallScore = 85 }: FaceHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Draw heatmap regions (Grad-CAM style)
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

    // Draw suspicious region markers
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

  }, [heatmapRegions]);

  const suspiciousCount = heatmapRegions.filter((r) => r.intensity > 0.6).length;

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg bg-slate-900/50"
        style={{ maxWidth: "400px", aspectRatio: "10/7" }}
      />
      
      {/* Color scale legend */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-trust-high opacity-60" />
            <span className="text-muted-foreground">Low Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-trust-medium opacity-80" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-trust-low" />
            <span className="text-muted-foreground">High (Suspicious)</span>
          </div>
        </div>
        {suspiciousCount > 0 && (
          <span className="text-xs text-trust-low font-mono">
            {suspiciousCount} hotspot{suspiciousCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default FaceHeatmap;
