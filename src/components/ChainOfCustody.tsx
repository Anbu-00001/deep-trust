import { Shield, Clock, Hash, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChainOfCustodyMetadata } from "@/lib/forensicEvidence";

interface ChainOfCustodyProps {
  metadata: ChainOfCustodyMetadata | null;
  className?: string;
}

const ChainOfCustody = ({ metadata, className }: ChainOfCustodyProps) => {
  if (!metadata) return null;

  return (
    <div className={cn("p-4 rounded-xl bg-secondary/30 border border-border", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Chain-of-Custody Metadata</h4>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Hash className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block">File Hash (SHA-256)</span>
            <span className="font-mono text-xs break-all">{metadata.fileHash}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block">Upload Timestamp</span>
            <span className="font-mono text-xs">{metadata.uploadTimestamp}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Cpu className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-xs text-muted-foreground block">Analysis Version</span>
            <span className="font-mono text-xs">{metadata.analysisVersion}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground block mb-2">Modules Used</span>
          <div className="flex flex-wrap gap-1.5">
            {metadata.modulesUsed.map((mod) => (
              <span
                key={mod}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground block mb-1">Analysis Duration</span>
          <span className="font-mono text-xs">{metadata.analysisTime}s</span>
        </div>
      </div>
    </div>
  );
};

export default ChainOfCustody;
