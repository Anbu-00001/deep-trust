import { Check, AlertTriangle, X, Shield, Info, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestResult {
  mode: string;
  description: string;
  confidence: number;
  drift: number;
  status: "pass" | "warning" | "fail";
}

interface RobustnessTestProps {
  results?: TestResult[];
  compact?: boolean;
}

const defaultResults: TestResult[] = [
  {
    mode: "Clean",
    description: "Baseline reference analysis",
    confidence: 94,
    drift: 0,
    status: "pass"
  },
  {
    mode: "Compressed",
    description: "JPEG compression at 60% quality",
    confidence: 91,
    drift: -3,
    status: "pass"
  },
  {
    mode: "Degraded",
    description: "Low-quality capture simulation",
    confidence: 87,
    drift: -7,
    status: "pass"
  },
  {
    mode: "Motion",
    description: "Motion blur applied",
    confidence: 72,
    drift: -22,
    status: "warning"
  },
  {
    mode: "Noise",
    description: "Gaussian noise injection",
    confidence: 85,
    drift: -9,
    status: "pass"
  }
];

// Derive stress stability status from drift values
const getStressStatus = (drift: number): "stable" | "mild" | "sensitive" => {
  if (Math.abs(drift) <= 5) return "stable";
  if (Math.abs(drift) <= 15) return "mild";
  return "sensitive";
};

const getStressStatusLabel = (status: "stable" | "mild" | "sensitive"): string => {
  switch (status) {
    case "stable": return "Stable";
    case "mild": return "Mild Sensitivity";
    case "sensitive": return "Sensitive";
  }
};

const getStressStatusColor = (status: "stable" | "mild" | "sensitive"): string => {
  switch (status) {
    case "stable": return "bg-trust-high/20 text-trust-high border-trust-high/30";
    case "mild": return "bg-trust-medium/20 text-trust-medium border-trust-medium/30";
    case "sensitive": return "bg-trust-low/20 text-trust-low border-trust-low/30";
  }
};

const getOverallStability = (results: TestResult[]): { status: "stable" | "sensitive"; score: number } => {
  const stressResults = results.filter(r => r.mode !== "Clean" && r.mode !== "Motion");
  const sensitiveCount = stressResults.filter(r => Math.abs(r.drift) > 15).length;
  const avgDrift = stressResults.reduce((sum, r) => sum + Math.abs(r.drift), 0) / stressResults.length;
  
  return {
    status: sensitiveCount >= 2 || avgDrift > 12 ? "sensitive" : "stable",
    score: Math.max(0, 100 - avgDrift * 2)
  };
};

const RobustnessTest = ({ results = defaultResults, compact = false }: RobustnessTestProps) => {
  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <Check className="w-4 h-4 text-trust-high" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-trust-medium" />;
      case "fail":
        return <X className="w-4 h-4 text-trust-low" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "bg-trust-high/20 border-trust-high/30";
      case "warning":
        return "bg-trust-medium/20 border-trust-medium/30";
      case "fail":
        return "bg-trust-low/20 border-trust-low/30";
    }
  };

  const getDriftColor = (drift: number) => {
    if (drift >= -5) return "text-trust-high";
    if (drift >= -15) return "text-trust-medium";
    return "text-trust-low";
  };

  const passCount = results.filter(r => r.status === "pass").length;
  const overallStability = getOverallStability(results);
  
  // Filter stress conditions (exclude Motion as it's a special case)
  const stressConditions = results.filter(r => 
    ["Clean", "Compressed", "Degraded", "Noise"].includes(r.mode)
  );

  if (compact) {
    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-muted-foreground">Robustness</h5>
        {results.slice(0, 3).map((result) => (
          <div key={result.mode} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{result.mode}</span>
            <span className={getDriftColor(result.drift)}>{result.drift}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Robustness Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Robustness Analysis</h3>
          <span className="text-sm text-muted-foreground">{results.length} tests completed</span>
        </div>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.mode}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                getStatusColor(result.status)
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fade-in-up 0.5s ease-out forwards"
              }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  result.status === "pass" ? "bg-trust-high/20" :
                  result.status === "warning" ? "bg-trust-medium/20" : "bg-trust-low/20"
                )}>
                  {getStatusIcon(result.status)}
                </div>
                
                <div>
                  <div className="font-medium">{result.mode}</div>
                  <div className="text-sm text-muted-foreground">{result.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="font-mono font-medium">{Math.round(result.confidence)}%</div>
                </div>
                
                <div className="text-right min-w-[60px]">
                  <div className="text-sm text-muted-foreground">Drift</div>
                  <div className={cn("font-mono font-medium", getDriftColor(result.drift))}>
                    {result.drift > 0 ? "+" : ""}{Math.round(result.drift)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Original Summary */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              passCount >= 4 ? "bg-trust-high" : passCount >= 2 ? "bg-trust-medium" : "bg-trust-low"
            )} />
            <span className="text-sm">
              <span className="font-medium">Overall Robustness:</span>{" "}
              <span className="text-muted-foreground">
                Confidence remains stable across {passCount}/{results.length} test conditions.
                {results.some(r => r.status === "warning") && " Some conditions show expected degradation."}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* NEW: Robustness Stress Evaluation Section */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Robustness Stress Evaluation
            </CardTitle>
            <Badge 
              className={cn(
                "border",
                overallStability.status === "stable" 
                  ? "bg-trust-high/20 text-trust-high border-trust-high/30" 
                  : "bg-trust-low/20 text-trust-low border-trust-low/30"
              )}
            >
              {overallStability.status === "stable" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {overallStability.status === "stable" ? "Stable" : "Sensitive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Evaluates detection consistency under real-world degradation scenarios
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stress Condition Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stressConditions.map((result) => {
              const stressStatus = getStressStatus(result.drift);
              return (
                <div
                  key={result.mode}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-all",
                    getStressStatusColor(stressStatus)
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">{result.mode}</div>
                  <div className="font-mono text-lg font-semibold">
                    {result.drift > 0 ? "+" : ""}{result.drift}%
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "mt-2 text-xs border",
                      getStressStatusColor(stressStatus)
                    )}
                  >
                    {getStressStatusLabel(stressStatus)}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Robustness Stability Summary */}
          <div className={cn(
            "p-4 rounded-lg border",
            overallStability.status === "stable" 
              ? "bg-trust-high/10 border-trust-high/20" 
              : "bg-trust-low/10 border-trust-low/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                overallStability.status === "stable" ? "bg-trust-high/20" : "bg-trust-low/20"
              )}>
                {overallStability.status === "stable" ? (
                  <Check className="w-5 h-5 text-trust-high" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-trust-low" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  Robustness Stability: {overallStability.status === "stable" ? "Stable" : "Sensitive"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {overallStability.status === "stable" 
                    ? "Model confidence remains consistent across degradation conditions"
                    : "Model confidence drops significantly under one or more stress conditions"
                  }
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold">
                  {Math.round(overallStability.score)}%
                </div>
                <div className="text-xs text-muted-foreground">Stability Score</div>
              </div>
            </div>
          </div>

          {/* Why This Matters Explanation */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <div className="font-medium text-sm">Why this matters</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Authentic media typically maintains stable detection confidence across compression, 
                  noise, and quality loss. Synthetic or manipulated media often shows larger confidence 
                  drops when stressed by real-world degradation.
                </p>
                <div className="pt-2 border-t border-border/50 mt-3">
                  <p className="text-xs text-muted-foreground italic">
                    {overallStability.status === "stable" 
                      ? "💡 High robustness strengthens trust in the final verdict"
                      : "⚠️ Low robustness indicates the result should be interpreted cautiously"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RobustnessTest;
