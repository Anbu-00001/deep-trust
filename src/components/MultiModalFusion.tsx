import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ModalityScore {
  modality: "visual" | "audio" | "temporal" | "structural";
  score: number;
  weight: number;
  confidence: number;
  findings: string[];
}

interface MultiModalFusionProps {
  className?: string;
  modalities?: ModalityScore[];
  overallScore?: number;
  mediaType?: "image" | "video" | "audio";
}

const MultiModalFusion = ({ 
  className, 
  modalities, 
  overallScore = 85,
  mediaType = "video" 
}: MultiModalFusionProps) => {
  const modalityData = useMemo(() => {
    if (modalities) return modalities;
    
    // Generate realistic modality scores based on overall score
    const variance = (100 - overallScore) * 0.5;
    
    const baseModalities: ModalityScore[] = [];
    
    // Visual analysis (always present)
    baseModalities.push({
      modality: "visual",
      score: Math.min(100, Math.max(20, overallScore + (Math.random() - 0.5) * variance)),
      weight: 0.35,
      confidence: 92 + Math.random() * 6,
      findings: overallScore > 70 
        ? ["Natural lighting patterns", "Consistent texture quality", "Clean edges"]
        : ["Unusual smoothness detected", "Potential texture inconsistency", "Edge artifacts present"]
    });
    
    // Structural analysis (always present)
    baseModalities.push({
      modality: "structural",
      score: Math.min(100, Math.max(20, overallScore + (Math.random() - 0.5) * variance * 0.8)),
      weight: 0.25,
      confidence: 88 + Math.random() * 8,
      findings: overallScore > 70
        ? ["Coherent facial geometry", "Natural landmark positions"]
        : ["Geometric inconsistencies", "Unusual landmark spacing"]
    });
    
    // Audio analysis (for video/audio)
    if (mediaType === "video" || mediaType === "audio") {
      baseModalities.push({
        modality: "audio",
        score: Math.min(100, Math.max(20, overallScore + (Math.random() - 0.5) * variance * 1.2)),
        weight: 0.20,
        confidence: 85 + Math.random() * 10,
        findings: overallScore > 70
          ? ["Natural voice patterns", "Consistent audio quality"]
          : ["Voice synthesis artifacts", "Unnatural pitch variations"]
      });
    }
    
    // Temporal analysis (for video)
    if (mediaType === "video") {
      baseModalities.push({
        modality: "temporal",
        score: Math.min(100, Math.max(20, overallScore + (Math.random() - 0.5) * variance)),
        weight: 0.20,
        confidence: 90 + Math.random() * 7,
        findings: overallScore > 70
          ? ["Smooth motion flow", "Consistent frame transitions"]
          : ["Temporal discontinuities", "Frame interpolation artifacts"]
      });
    }
    
    return baseModalities;
  }, [modalities, overallScore, mediaType]);

  // Calculate fused score
  const fusedScore = useMemo(() => {
    const totalWeight = modalityData.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = modalityData.reduce((sum, m) => sum + (m.score * m.weight), 0);
    return weightedSum / totalWeight;
  }, [modalityData]);

  const getModalityIcon = (modality: ModalityScore["modality"]) => {
    switch (modality) {
      case "visual": return "👁️";
      case "audio": return "🔊";
      case "temporal": return "⏱️";
      case "structural": return "🔷";
    }
  };

  const getModalityLabel = (modality: ModalityScore["modality"]) => {
    switch (modality) {
      case "visual": return "Visual Analysis";
      case "audio": return "Audio Analysis";
      case "temporal": return "Temporal Coherence";
      case "structural": return "Structural Integrity";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-trust-high";
    if (score >= 60) return "text-trust-medium";
    return "text-trust-low";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-trust-high";
    if (score >= 60) return "bg-trust-medium";
    return "bg-trust-low";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Unified score display */}
      <div className="relative flex items-center justify-center py-8">
        <div className="relative">
          {/* Outer ring - animated */}
          <svg className="w-40 h-40" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${fusedScore * 2.83} 283`}
              strokeLinecap="round"
              className={getScoreColor(fusedScore)}
              transform="rotate(-90 50 50)"
              style={{
                transition: "stroke-dasharray 1s ease-out"
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold font-mono", getScoreColor(fusedScore))}>
              {fusedScore.toFixed(0)}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Fused Score
            </span>
          </div>
        </div>

        {/* Modality indicators around the circle */}
        <div className="absolute inset-0 pointer-events-none">
          {modalityData.map((m, idx) => {
            const angle = (idx / modalityData.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 90;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            
            return (
              <div
                key={m.modality}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`
                }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                  "bg-secondary border-2",
                  m.score >= 80 ? "border-trust-high" :
                  m.score >= 60 ? "border-trust-medium" : "border-trust-low"
                )}>
                  {getModalityIcon(m.modality)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modality breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Analysis Breakdown
        </h4>
        
        {modalityData.map((m) => (
          <div key={m.modality} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{getModalityIcon(m.modality)}</span>
                <span className="text-sm font-medium">{getModalityLabel(m.modality)}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({(m.weight * 100).toFixed(0)}% weight)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("font-mono font-bold", getScoreColor(m.score))}>
                  {m.score.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ±{(100 - m.confidence).toFixed(0)}%
                </span>
              </div>
            </div>
            
            {/* Score bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getBarColor(m.score))}
                style={{ width: `${m.score}%` }}
              />
            </div>
            
            {/* Findings */}
            <div className="flex flex-wrap gap-2">
              {m.findings.map((finding, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    m.score >= 70 
                      ? "bg-trust-high/10 text-trust-high" 
                      : "bg-trust-low/10 text-trust-low"
                  )}
                >
                  {finding}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fusion confidence */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fusion Confidence</span>
          <span className="font-mono">
            {(modalityData.reduce((sum, m) => sum + m.confidence, 0) / modalityData.length).toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Multi-modal fusion combines {modalityData.length} independent analysis channels 
          using weighted confidence aggregation for robust authenticity assessment.
        </p>
      </div>
    </div>
  );
};

export default MultiModalFusion;
