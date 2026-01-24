import { Fingerprint, Layers, FileQuestion, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GanFingerprints, TextureAnalysis, MetadataAnalysis } from "@/hooks/useMediaAnalysis";

interface ForensicDetailsProps {
  ganFingerprints: GanFingerprints;
  textureAnalysis: TextureAnalysis;
  metadataAnalysis: MetadataAnalysis;
  className?: string;
}

const ForensicDetails = ({
  ganFingerprints,
  textureAnalysis,
  metadataAnalysis,
  className
}: ForensicDetailsProps) => {
  const getStatusIcon = (isGood: boolean, isNeutral?: boolean) => {
    if (isNeutral) return <AlertCircle className="w-4 h-4 text-trust-medium" />;
    return isGood 
      ? <CheckCircle className="w-4 h-4 text-trust-high" />
      : <XCircle className="w-4 h-4 text-trust-low" />;
  };

  const getVarianceStyle = (variance: string) => {
    switch (variance) {
      case "low": return { label: "Low (Suspicious)", color: "text-trust-low" };
      case "high": return { label: "High", color: "text-trust-high" };
      default: return { label: "Normal", color: "text-trust-high" };
    }
  };

  const getNoiseStyle = (consistency: string) => {
    switch (consistency) {
      case "inconsistent": return { label: "Inconsistent", color: "text-trust-medium" };
      case "suspicious": return { label: "Suspicious", color: "text-trust-low" };
      default: return { label: "Consistent", color: "text-trust-high" };
    }
  };

  const varianceStyle = getVarianceStyle(textureAnalysis.laplacianVariance);
  const noiseStyle = getNoiseStyle(textureAnalysis.noiseConsistency);

  return (
    <div className={cn("space-y-6", className)}>
      {/* GAN Fingerprinting Section */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">GAN Fingerprint Detection</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fingerprints Detected</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!ganFingerprints.detected)}
              <span className={cn(
                "font-mono text-sm",
                ganFingerprints.detected ? "text-trust-low" : "text-trust-high"
              )}>
                {ganFingerprints.detected ? "Yes" : "None"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Detection Confidence</span>
            <span className="font-mono text-sm">{ganFingerprints.confidence}%</span>
          </div>
          
          {ganFingerprints.patterns.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground block mb-2">Patterns Found:</span>
              <div className="flex flex-wrap gap-1">
                {ganFingerprints.patterns.map((pattern, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-trust-low/10 text-trust-low"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Texture Analysis Section */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Texture Consistency Analysis</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Laplacian Variance</span>
            <span className={cn("font-mono text-sm", varianceStyle.color)}>
              {varianceStyle.label}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Smoothness Anomalies</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!textureAnalysis.smoothnessAnomalies)}
              <span className={cn(
                "font-mono text-sm",
                textureAnalysis.smoothnessAnomalies ? "text-trust-low" : "text-trust-high"
              )}>
                {textureAnalysis.smoothnessAnomalies ? "Detected" : "None"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Noise Consistency</span>
            <span className={cn("font-mono text-sm", noiseStyle.color)}>
              {noiseStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Analysis Section */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <FileQuestion className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Metadata & Encoding Analysis</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">EXIF Metadata</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(metadataAnalysis.hasMetadata, !metadataAnalysis.hasMetadata)}
              <span className={cn(
                "font-mono text-sm",
                metadataAnalysis.hasMetadata ? "text-trust-high" : "text-trust-medium"
              )}>
                {metadataAnalysis.hasMetadata ? "Present" : "Missing"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Suspicious Signatures</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!metadataAnalysis.suspicious)}
              <span className={cn(
                "font-mono text-sm",
                metadataAnalysis.suspicious ? "text-trust-low" : "text-trust-high"
              )}>
                {metadataAnalysis.suspicious ? "Yes" : "None"}
              </span>
            </div>
          </div>
          
          {metadataAnalysis.findings.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground block mb-2">Findings:</span>
              <ul className="space-y-1">
                {metadataAnalysis.findings.map((finding, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-trust-medium">•</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForensicDetails;
