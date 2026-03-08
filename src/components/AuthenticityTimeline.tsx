import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, CartesianGrid } from "recharts";
import type { FrameData } from "@/hooks/useMediaAnalysis";

interface AuthenticityTimelineProps {
  frames?: FrameData[];
  mediaType?: "image" | "video" | "audio";
  overallScore?: number;
  className?: string;
  onTimestampClick?: (timestamp: number) => void;
}

const chartConfig = {
  anomalyScore: {
    label: "Anomaly Score",
    color: "hsl(var(--trust-low))",
  },
};

const AuthenticityTimeline = ({
  frames = [],
  mediaType = "video",
  overallScore = 85,
  className,
  onTimestampClick,
}: AuthenticityTimelineProps) => {
  const [selectedSpike, setSelectedSpike] = useState<number | null>(null);

  // Convert frame confidence to anomaly scores (0-1 scale)
  const timelineData = useMemo(() => {
    if (frames.length === 0) return [];
    return frames.map((f) => ({
      time: Math.round(f.timestamp * 100) / 100,
      anomalyScore: Math.round((1 - f.confidence / 100) * 100) / 100,
      frameNumber: f.frameNumber,
      anomalyType: f.anomalyType,
      confidence: f.confidence,
    }));
  }, [frames]);

  // Identify anomaly spikes (score > 0.3)
  const spikes = useMemo(() => {
    return timelineData.filter((d) => d.anomalyScore > 0.3);
  }, [timelineData]);

  const mostSuspicious = useMemo(() => {
    if (spikes.length === 0) return null;
    return spikes.reduce((max, s) => (s.anomalyScore > max.anomalyScore ? s : max), spikes[0]);
  }, [spikes]);

  const handleSpikeClick = (time: number) => {
    setSelectedSpike(time);
    onTimestampClick?.(time);
  };

  const getColorForScore = (score: number) => {
    if (score > 0.6) return "hsl(var(--trust-low))";
    if (score > 0.3) return "hsl(var(--trust-medium))";
    return "hsl(var(--trust-high))";
  };

  if (mediaType === "image") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
          <Info className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Authenticity timeline is designed for video analysis. For static images, refer to the Heatmap and Forensic tabs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Timeline Chart */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Video Authenticity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          {timelineData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                onClick={(e) => {
                  if (e?.activePayload?.[0]) {
                    handleSpikeClick(e.activePayload[0].payload.time);
                  }
                }}
              >
                <defs>
                  <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--trust-low))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--trust-low))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  tickFormatter={(v) => `${v.toFixed(1)}s`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  width={30}
                />
                <ReferenceLine y={0.3} stroke="hsl(var(--trust-medium))" strokeDasharray="4 4" opacity={0.6} />
                <ReferenceLine y={0.6} stroke="hsl(var(--trust-low))" strokeDasharray="4 4" opacity={0.6} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const p = payload?.[0]?.payload;
                        return p ? `Frame ${p.frameNumber + 1} • ${p.time.toFixed(1)}s` : "";
                      }}
                      formatter={(value) => {
                        const v = Number(value);
                        return [
                          <span
                            key="val"
                            style={{ color: getColorForScore(v) }}
                            className="font-mono font-semibold"
                          >
                            {(v * 100).toFixed(0)}%
                          </span>,
                          "Anomaly",
                        ];
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="anomalyScore"
                  stroke="hsl(var(--trust-low))"
                  fill="url(#anomalyGradient)"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.anomalyScore > 0.3) {
                      return (
                        <circle
                          key={`dot-${payload.frameNumber}`}
                          cx={cx}
                          cy={cy}
                          r={payload.anomalyScore > 0.6 ? 5 : 3.5}
                          fill={getColorForScore(payload.anomalyScore)}
                          stroke="hsl(var(--background))"
                          strokeWidth={1.5}
                          className="cursor-pointer"
                          onClick={() => handleSpikeClick(payload.time)}
                        />
                      );
                    }
                    return <circle key={`dot-${payload.frameNumber}`} r={0} cx={cx} cy={cy} />;
                  }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No frame data available for timeline visualization.
            </p>
          )}

          {/* Color legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-trust-high" />
              <span>Normal (&lt;0.3)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-trust-medium" />
              <span>Suspicious (0.3–0.6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-trust-low" />
              <span>High Anomaly (&gt;0.6)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected spike detail */}
      {selectedSpike !== null && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-trust-low/10 border border-trust-low/20 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-trust-low flex-shrink-0" />
          <p className="text-sm text-trust-low">
            High anomaly detected near <span className="font-mono font-semibold">{selectedSpike.toFixed(1)} seconds</span>.
          </p>
        </div>
      )}

      {/* Spike markers */}
      {spikes.length > 0 && (
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-trust-low" />
              Anomaly Spikes
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap gap-2">
              {spikes.slice(0, 10).map((spike, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSpikeClick(spike.time)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-mono border transition-colors cursor-pointer",
                    spike.anomalyScore > 0.6
                      ? "bg-trust-low/10 border-trust-low/30 text-trust-low hover:bg-trust-low/20"
                      : "bg-trust-medium/10 border-trust-medium/30 text-trust-medium hover:bg-trust-medium/20"
                  )}
                >
                  {spike.time.toFixed(1)}s → {(spike.anomalyScore * 100).toFixed(0)}%
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary panel */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {spikes.length === 0 ? (
              <CheckCircle className="w-4 h-4 text-trust-high" />
            ) : (
              <Info className="w-4 h-4 text-primary" />
            )}
            Video Authenticity Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">{frames.length}</div>
              <div className="text-xs text-muted-foreground">Frames Analyzed</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold font-mono",
                spikes.length === 0 ? "text-trust-high" : spikes.length <= 3 ? "text-trust-medium" : "text-trust-low"
              )}>
                {spikes.length}
              </div>
              <div className="text-xs text-muted-foreground">Anomaly Spikes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-trust-low">
                {mostSuspicious ? `${mostSuspicious.time.toFixed(1)}s` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">Most Suspicious</div>
            </div>
          </div>

          {spikes.length > 0 && mostSuspicious ? (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              Temporal inconsistencies detected around{" "}
              <span className="font-mono text-trust-low">
                {Math.max(0, mostSuspicious.time - 1).toFixed(0)}–{(mostSuspicious.time + 1).toFixed(0)} seconds
              </span>
              . These regions may warrant closer inspection for frame-level manipulation artifacts.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              No significant temporal anomalies detected. Frame-level analysis shows consistent authenticity patterns throughout the video.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticityTimeline;
