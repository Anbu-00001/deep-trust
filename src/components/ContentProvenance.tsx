import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Fingerprint, ExternalLink, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { analyzeProvenance, type ProvenanceResult } from "@/lib/provenanceAnalyzer";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

interface ContentProvenanceProps {
  result: AnalysisResult;
  className?: string;
}

const ContentProvenance = ({ result, className }: ContentProvenanceProps) => {
  const provenance: ProvenanceResult = useMemo(
    () => analyzeProvenance(result.trustScore, result.mediaType, result.frameAnalysis.length),
    [result.trustScore, result.mediaType, result.frameAnalysis.length]
  );

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-secondary/30", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Content Provenance
        </h4>
      </div>

      {/* Perceptual hash info */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">pHash:</span>
          <span className="font-mono text-foreground">{provenance.hashSignature.pHash}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">dHash:</span>
          <span className="font-mono text-foreground">{provenance.hashSignature.dHash}</span>
        </div>
      </div>

      {/* Best match */}
      {provenance.bestMatch ? (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Similar media found</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium">{provenance.bestMatch.sourceLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Similarity:</span>
              <span className="font-mono font-medium">
                {Math.round(provenance.bestMatch.similarityScore * 100)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            This media likely originates from previously published content.
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-secondary/50 border border-border mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-trust-high" />
            <span className="text-sm font-medium">No strong provenance match found</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This media does not closely match any entries in the reference index.
          </p>
        </div>
      )}

      {/* Other matches */}
      {provenance.matches.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nearest Matches
          </span>
          {provenance.matches.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
              <span className="text-muted-foreground truncate max-w-[60%]">{m.sourceLabel}</span>
              <span className={cn(
                "font-mono font-medium",
                m.similarityScore >= 0.75 ? "text-accent" :
                m.similarityScore >= 0.5 ? "text-trust-medium" :
                "text-muted-foreground"
              )}>
                {Math.round(m.similarityScore * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentProvenance;
