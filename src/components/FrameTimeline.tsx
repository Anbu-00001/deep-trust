import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FrameData {
  frameNumber: number;
  timestamp: number;
  confidence: number;
  anomalyType?: "face_warp" | "temporal_inconsistency" | "lighting_mismatch" | "edge_artifact" | null;
}

interface FrameTimelineProps {
  className?: string;
  frames?: FrameData[];
  totalDuration?: number;
  overallScore?: number;
}

const FrameTimeline = ({ className, frames, totalDuration = 10, overallScore = 85 }: FrameTimelineProps) => {
  const frameData = useMemo(() => {
    if (frames) return frames;
    
    // Generate realistic frame-by-frame analysis
    const numFrames = 30; // Analyzing 30 key frames
    const generatedFrames: FrameData[] = [];
    
    const baseConfidence = overallScore;
    const anomalyProbability = 1 - (overallScore / 100);
    
    for (let i = 0; i < numFrames; i++) {
      const timestamp = (i / numFrames) * totalDuration;
      let confidence = baseConfidence + (Math.random() - 0.5) * 20;
      confidence = Math.min(100, Math.max(20, confidence));
      
      let anomalyType: FrameData["anomalyType"] = null;
      
      // Add anomalies based on score
      if (Math.random() < anomalyProbability * 0.5) {
        const anomalyTypes: FrameData["anomalyType"][] = [
          "face_warp", "temporal_inconsistency", "lighting_mismatch", "edge_artifact"
        ];
        anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        confidence = Math.min(confidence, 60 - Math.random() * 20);
      }
      
      generatedFrames.push({
        frameNumber: i,
        timestamp,
        confidence,
        anomalyType
      });
    }
    
    return generatedFrames;
  }, [frames, totalDuration, overallScore]);

  const anomalyFrames = frameData.filter((f) => f.anomalyType);
  const avgConfidence = frameData.reduce((sum, f) => sum + f.confidence, 0) / frameData.length;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-trust-high";
    if (confidence >= 60) return "bg-trust-medium";
    return "bg-trust-low";
  };

  const getAnomalyLabel = (type: FrameData["anomalyType"]) => {
    switch (type) {
      case "face_warp": return "Face Warping";
      case "temporal_inconsistency": return "Temporal Jump";
      case "lighting_mismatch": return "Lighting Shift";
      case "edge_artifact": return "Edge Artifact";
      default: return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Timeline visualization */}
      <div className="relative">
        <div className="flex items-end gap-0.5 h-24 px-2">
          {frameData.map((frame, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Confidence bar */}
              <div
                className={cn(
                  "w-full rounded-t transition-all duration-200",
                  getConfidenceColor(frame.confidence),
                  frame.anomalyType && "ring-1 ring-trust-low ring-offset-1 ring-offset-background"
                )}
                style={{ height: `${frame.confidence}%` }}
              />
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap">
                  <div className="font-mono text-muted-foreground">
                    Frame {frame.frameNumber + 1} • {frame.timestamp.toFixed(1)}s
                  </div>
                  <div className={cn(
                    "font-semibold mt-1",
                    frame.confidence >= 80 ? "text-trust-high" :
                    frame.confidence >= 60 ? "text-trust-medium" : "text-trust-low"
                  )}>
                    {frame.confidence.toFixed(0)}% confidence
                  </div>
                  {frame.anomalyType && (
                    <div className="text-trust-low mt-1">
                      ⚠ {getAnomalyLabel(frame.anomalyType)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Time axis */}
        <div className="flex justify-between px-2 mt-1 text-xs text-muted-foreground font-mono">
          <span>0:00</span>
          <span>{Math.floor(totalDuration / 2)}:{String(Math.round((totalDuration / 2 % 1) * 60)).padStart(2, '0')}</span>
          <span>{Math.floor(totalDuration)}:{String(Math.round((totalDuration % 1) * 60)).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">{frameData.length}</div>
          <div className="text-xs text-muted-foreground">Frames Analyzed</div>
        </div>
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold font-mono",
            avgConfidence >= 80 ? "text-trust-high" :
            avgConfidence >= 60 ? "text-trust-medium" : "text-trust-low"
          )}>
            {avgConfidence.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Avg Confidence</div>
        </div>
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold font-mono",
            anomalyFrames.length === 0 ? "text-trust-high" :
            anomalyFrames.length <= 2 ? "text-trust-medium" : "text-trust-low"
          )}>
            {anomalyFrames.length}
          </div>
          <div className="text-xs text-muted-foreground">Anomalies</div>
        </div>
      </div>

      {/* Anomaly details */}
      {anomalyFrames.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <h5 className="text-sm font-medium text-muted-foreground">Detected Anomalies</h5>
          <div className="space-y-1.5">
            {anomalyFrames.slice(0, 5).map((frame, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-trust-low/10 border border-trust-low/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">
                    {frame.timestamp.toFixed(1)}s
                  </span>
                  <span className="text-sm text-trust-low">
                    {getAnomalyLabel(frame.anomalyType)}
                  </span>
                </div>
                <span className="text-xs font-mono text-trust-low">
                  {frame.confidence.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameTimeline;
