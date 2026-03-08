import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Fingerprint, ChevronRight } from "lucide-react";
import { extractArtifactSignature, matchFingerprint } from "@/lib/fingerprintLibrary";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

interface GeneratorAttributionProps {
  result: AnalysisResult;
  className?: string;
}

const GeneratorAttribution = ({ result, className }: GeneratorAttributionProps) => {
  const fingerprint = useMemo(() => {
    const sig = extractArtifactSignature(result);
    return matchFingerprint(sig);
  }, [result]);

  const match = fingerprint.generatorMatch;
  const isLowConfidence = match.similarity < 0.4;

  return (
    <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">DeepFake Generator Attribution</h4>
      </div>

      {/* Primary match */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">Generator Match</span>
        <span className={cn(
          "font-mono text-sm font-medium",
          isLowConfidence ? "text-muted-foreground" : "text-primary"
        )}>
          {isLowConfidence ? "No strong match" : match.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Confidence</span>
        <span className={cn(
          "font-mono text-sm",
          match.similarity >= 0.7 ? "text-trust-low" :
          match.similarity >= 0.5 ? "text-trust-medium" :
          "text-trust-high"
        )}>
          {(match.similarity * 100).toFixed(0)}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="w-full h-2 rounded-full bg-secondary mb-4">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            match.similarity >= 0.7 ? "bg-trust-low" :
            match.similarity >= 0.5 ? "bg-trust-medium" :
            "bg-trust-high"
          )}
          style={{ width: `${match.similarity * 100}%` }}
        />
      </div>

      {/* Alternative matches */}
      {fingerprint.alternativeMatches.filter(m => m.similarity > 0.1).length > 0 && (
        <div className="pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground block mb-2">Alternative Matches</span>
          <div className="space-y-1.5">
            {fingerprint.alternativeMatches
              .filter(m => m.similarity > 0.1)
              .slice(0, 3)
              .map((alt) => (
                <div key={alt.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ChevronRight className="w-3 h-3" />
                    <span>{alt.label}</span>
                  </div>
                  <span className="font-mono">{(alt.similarity * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
        {isLowConfidence
          ? "Artifact signatures do not strongly match any known generator family. The media may be authentic or produced by an unrecognized method."
          : `Artifact characteristics are consistent with ${match.label}-style synthesis. This attribution is probabilistic and based on known generator fingerprint patterns.`
        }
      </p>
    </div>
  );
};

export default GeneratorAttribution;
