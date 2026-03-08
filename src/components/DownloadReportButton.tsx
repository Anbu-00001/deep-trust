import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";
import type { ForensicEvidenceObject, ChainOfCustodyMetadata } from "@/lib/forensicEvidence";

interface DownloadReportButtonProps {
  result: AnalysisResult;
  evidenceObjects: ForensicEvidenceObject[];
  chainOfCustody: ChainOfCustodyMetadata | null;
  fileName?: string;
}

const DownloadReportButton = ({ result, evidenceObjects, chainOfCustody, fileName }: DownloadReportButtonProps) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const { generateForensicReport } = await import("@/lib/forensicReportGenerator");
      generateForensicReport({ result, evidenceObjects, chainOfCustody, fileName });
      toast.success("Forensic report downloaded");
    } catch (err) {
      toast.error("Failed to generate report");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={generating}
      className="gap-2"
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Download Forensic Report
    </Button>
  );
};

export default DownloadReportButton;
