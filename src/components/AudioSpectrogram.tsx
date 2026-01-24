import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AudioSpectrogramProps {
  className?: string;
  anomalyRegions?: { start: number; end: number; severity: "low" | "medium" | "high" }[];
  overallScore?: number;
}

const AudioSpectrogram = ({ className, anomalyRegions, overallScore = 85 }: AudioSpectrogramProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const anomalies = useMemo(() => {
    if (anomalyRegions) return anomalyRegions;
    
    // Generate realistic anomaly regions based on score
    const baseAnomalies: { start: number; end: number; severity: "low" | "medium" | "high" }[] = [];
    
    if (overallScore < 90) {
      baseAnomalies.push({ start: 0.15, end: 0.22, severity: "low" });
    }
    if (overallScore < 70) {
      baseAnomalies.push({ start: 0.45, end: 0.55, severity: "medium" });
      baseAnomalies.push({ start: 0.72, end: 0.78, severity: "low" });
    }
    if (overallScore < 50) {
      baseAnomalies.push({ start: 0.3, end: 0.42, severity: "high" });
      baseAnomalies.push({ start: 0.85, end: 0.95, severity: "high" });
    }
    
    return baseAnomalies;
  }, [anomalyRegions, overallScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 500;
    const height = 200;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bands (spectrogram style)
    const numBands = 64;
    const bandHeight = height / numBands;
    const numTimeSlices = 100;
    const sliceWidth = width / numTimeSlices;

    for (let t = 0; t < numTimeSlices; t++) {
      const timePos = t / numTimeSlices;
      
      // Check if in anomaly region
      const anomaly = anomalies.find((a) => timePos >= a.start && timePos <= a.end);
      
      for (let f = 0; f < numBands; f++) {
        // Simulate realistic spectrogram pattern
        const freqFactor = Math.sin((f / numBands) * Math.PI * 2) * 0.5 + 0.5;
        const timeFactor = Math.sin(t * 0.1 + f * 0.05) * 0.3 + 0.7;
        const noise = Math.random() * 0.2;
        let intensity = freqFactor * timeFactor + noise;

        // Voice frequency emphasis (mid frequencies)
        if (f > 15 && f < 45) {
          intensity *= 1.3;
        }

        // Add anomaly distortion
        if (anomaly) {
          const anomalyIntensity = anomaly.severity === "high" ? 0.5 : 
                                   anomaly.severity === "medium" ? 0.3 : 0.15;
          intensity += Math.random() * anomalyIntensity;
          
          // Add unusual frequency patterns in anomaly regions
          if (f < 10 || f > 55) {
            intensity *= 1.5;
          }
        }

        intensity = Math.min(1, Math.max(0, intensity));

        // Color mapping
        let color: string;
        if (anomaly && intensity > 0.7) {
          const severityColors = {
            low: `rgba(251, 191, 36, ${intensity})`,
            medium: `rgba(249, 115, 22, ${intensity})`,
            high: `rgba(239, 68, 68, ${intensity})`
          };
          color = severityColors[anomaly.severity];
        } else {
          // Normal spectrogram colors (blue -> cyan -> green -> yellow)
          if (intensity < 0.25) {
            color = `rgba(30, 58, 138, ${intensity * 2})`;
          } else if (intensity < 0.5) {
            color = `rgba(45, 212, 191, ${intensity})`;
          } else if (intensity < 0.75) {
            color = `rgba(34, 197, 94, ${intensity})`;
          } else {
            color = `rgba(250, 204, 21, ${intensity})`;
          }
        }

        ctx.fillStyle = color;
        ctx.fillRect(t * sliceWidth, (numBands - f - 1) * bandHeight, sliceWidth + 0.5, bandHeight + 0.5);
      }
    }

    // Draw anomaly region indicators
    anomalies.forEach((anomaly) => {
      const x = anomaly.start * width;
      const w = (anomaly.end - anomaly.start) * width;
      
      ctx.strokeStyle = anomaly.severity === "high" ? "rgba(239, 68, 68, 0.8)" :
                        anomaly.severity === "medium" ? "rgba(249, 115, 22, 0.7)" :
                        "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, 2, w, height - 4);
      ctx.setLineDash([]);

      // Label
      ctx.font = "10px monospace";
      ctx.fillStyle = ctx.strokeStyle;
      const label = anomaly.severity === "high" ? "ANOMALY" :
                    anomaly.severity === "medium" ? "Warning" : "Check";
      ctx.fillText(label, x + 4, 14);
    });

    // Frequency axis labels
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("8kHz", 4, 15);
    ctx.fillText("4kHz", 4, height / 2);
    ctx.fillText("0Hz", 4, height - 5);

    // Time axis
    ctx.fillText("0s", width - 30, height - 5);

  }, [anomalies]);

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg"
        style={{ maxWidth: "500px", aspectRatio: "5/2" }}
      />
      
      <div className="flex items-center justify-between mt-3 px-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Audio Frequency Analysis</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {anomalies.length === 0 ? (
            <span className="text-trust-high">No anomalies detected</span>
          ) : (
            <>
              <span className="text-muted-foreground">
                {anomalies.length} region{anomalies.length > 1 ? "s" : ""} flagged
              </span>
              {anomalies.some((a) => a.severity === "high") && (
                <span className="text-trust-low font-medium">High severity</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioSpectrogram;
