import { Check, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

      {/* Summary */}
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
  );
};

export default RobustnessTest;
