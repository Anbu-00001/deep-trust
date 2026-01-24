import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TrustScoreMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const TrustScoreMeter = ({ 
  score, 
  size = "md", 
  showLabel = true,
  animated = true 
}: TrustScoreMeterProps) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animated]);

  const getRiskLevel = (value: number) => {
    if (value >= 70) return { label: "Likely Authentic", color: "text-trust-high" };
    if (value >= 40) return { label: "Needs Review", color: "text-trust-medium" };
    return { label: "Suspicious", color: "text-trust-low" };
  };

  const risk = getRiskLevel(displayScore);

  const sizes = {
    sm: { ring: "w-24 h-24", text: "text-2xl", label: "text-xs" },
    md: { ring: "w-36 h-36", text: "text-4xl", label: "text-sm" },
    lg: { ring: "w-48 h-48", text: "text-5xl", label: "text-base" },
  };

  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const radius = size === "sm" ? 42 : size === "md" ? 64 : 86;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getStrokeColor = (value: number) => {
    if (value >= 70) return "stroke-trust-high";
    if (value >= 40) return "stroke-trust-medium";
    return "stroke-trust-low";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("relative", sizes[size].ring)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            className={cn("transition-all duration-300", getStrokeColor(displayScore))}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animated ? "stroke-dashoffset 1.5s ease-out" : "none"
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizes[size].text, risk.color)}>
            {displayScore}
          </span>
          <span className={cn("text-muted-foreground", sizes[size].label)}>
            Trust Score
          </span>
        </div>
      </div>

      {showLabel && (
        <div className={cn("font-medium", risk.color)}>
          {risk.label}
        </div>
      )}
    </div>
  );
};

export default TrustScoreMeter;
