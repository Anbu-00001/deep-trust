import { AlertTriangle, CircleDashed, ExternalLink } from "lucide-react";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

export const researchSources = [
  { label: "NIST · Synthetic content risks", url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-4.pdf" },
  { label: "ICCV 2025 · Real-world detection benchmark", url: "https://openaccess.thecvf.com/content/ICCV2025/papers/Li_Bridging_the_Gap_Between_Ideal_and_Real-world_Evaluation_Benchmarking_AI-Generated_ICCV_2025_paper.pdf" },
  { label: "C2PA · Provenance limitations", url: "https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html" },
];

export function NotPerformed({ title }: { title: string }) {
  return <div className="border-l-2 border-accent py-3 pl-4">
    <div className="flex items-center gap-2 text-sm font-semibold"><CircleDashed className="h-4 w-4 text-accent" />{title} · Not performed</div>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">No independently measured output is available for this check. A visual review cannot substitute for detector inference, pixel measurements, audio processing, or signed provenance verification.</p>
  </div>;
}

export default function AssessmentReview({ result, fileHash }: { result: AnalysisResult; fileHash?: string | null }) {
  return <div className="space-y-6">
    <div className="border-l-2 border-accent pl-4">
      <div className="flex items-center gap-2 text-accent"><AlertTriangle className="h-4 w-4" /><h3 className="font-bold">Origin not established</h3></div>
      <p className="mt-2 text-sm text-muted-foreground">{result.uncertaintyReason}</p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div><h4 className="mb-3 text-xs font-bold uppercase">Model observations · Unverified</h4>
        <p className="mb-3 text-sm text-muted-foreground">{result.visualSummary}</p>
        <ul className="space-y-4">{result.observations.map((item, index) => <li key={index} className="border-t border-border pt-3"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p></li>)}</ul>
      </div>
      <div className="space-y-4"><h4 className="text-xs font-bold uppercase">Evidence & coverage</h4>
        <dl className="space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Authenticity probability</dt><dd>Unavailable</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Independent detectors</dt><dd>Not run</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Benchmark calibration</dt><dd>Not validated</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">C2PA / EXIF verification</dt><dd>Not performed</dd></div></dl>
        {fileHash && <div className="border-t border-border pt-3"><p className="text-xs text-muted-foreground">SHA-256 · Measured locally</p><p className="mt-2 break-all font-mono text-xs">{fileHash}</p><p className="mt-2 text-xs text-muted-foreground">Identifies these file bytes, not their origin or truth.</p></div>}
        <p className="border-t border-border pt-3 text-xs text-muted-foreground">Review version: {result.assessmentVersion} · Model: {result.modelUsed || "Legacy review"}</p>
        <div className="border-t border-border pt-3"><h4 className="mb-2 text-xs font-bold uppercase">Research basis</h4>{researchSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="mb-2 flex items-start gap-2 text-xs text-primary hover:underline"><ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />{source.label}</a>)}</div>
      </div>
    </div>
  </div>;
}