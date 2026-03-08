/**
 * Forensic Report Generator
 * Produces a downloadable PDF verification report from existing analysis outputs.
 */

import { jsPDF } from "jspdf";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";
import type { ForensicEvidenceObject, ChainOfCustodyMetadata } from "@/lib/forensicEvidence";
import { calibrateConfidence } from "@/lib/confidenceCalibration";
import { computeDetectorEnsemble } from "@/lib/detectorEnsemble";
import { extractArtifactSignature, matchFingerprint } from "@/lib/fingerprintLibrary";
import { analyzeProvenance } from "@/lib/provenanceAnalyzer";

interface ReportInput {
  result: AnalysisResult;
  evidenceObjects: ForensicEvidenceObject[];
  chainOfCustody: ChainOfCustodyMetadata | null;
  fileName?: string;
}

const PAGE_W = 210;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 6;

function col(doc: jsPDF): { fg: string; muted: string; primary: string; accent: string; high: string; low: string; medium: string } {
  return {
    fg: "#e8ecf1",
    muted: "#7a8494",
    primary: "#22b8a0",
    accent: "#e8960c",
    high: "#2cb67d",
    low: "#d64545",
    medium: "#d4a017",
  };
}

export function generateForensicReport({ result, evidenceObjects, chainOfCustody, fileName }: ReportInput) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const c = col(doc);
  let y = MARGIN;

  const ensurePage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text: string) => {
    ensurePage(14);
    y += 4;
    doc.setDrawColor(c.primary);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 6;
    doc.setFontSize(13);
    doc.setTextColor(c.primary);
    doc.text(text, MARGIN, y);
    y += 8;
    doc.setTextColor(c.fg);
    doc.setFontSize(10);
  };

  const label = (l: string, v: string) => {
    ensurePage(LINE_H + 2);
    doc.setTextColor(c.muted);
    doc.text(l, MARGIN, y);
    doc.setTextColor(c.fg);
    doc.text(v, MARGIN + 55, y);
    y += LINE_H;
  };

  const bullet = (text: string) => {
    ensurePage(LINE_H + 2);
    doc.setTextColor(c.fg);
    const lines = doc.splitTextToSize(`• ${text}`, CONTENT_W - 4);
    doc.text(lines, MARGIN + 4, y);
    y += lines.length * LINE_H;
  };

  const note = (text: string) => {
    ensurePage(LINE_H + 2);
    doc.setFontSize(9);
    doc.setTextColor(c.muted);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5;
    doc.setFontSize(10);
    doc.setTextColor(c.fg);
  };

  // ─── Background ───
  doc.setFillColor("#0f1319");
  doc.rect(0, 0, PAGE_W, 297, "F");

  // ─── Title ───
  doc.setFontSize(22);
  doc.setTextColor(c.primary);
  doc.text("DeepTrust Verification Report", MARGIN, y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(c.muted);
  doc.text(`Generated ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`, MARGIN, y);
  y += 10;

  // ─── 1. Media Information ───
  heading("Media Information");
  label("File Name:", fileName || "uploaded_media");
  label("Media Type:", result.mediaType);
  label("SHA-256 Hash:", chainOfCustody?.fileHash.slice(0, 32) + "..." || "N/A");
  label("Analysis Date:", chainOfCustody?.uploadTimestamp || new Date().toISOString());
  label("Analysis Time:", `${result.analysisTime}s`);
  label("Analysis Version:", chainOfCustody?.analysisVersion || "DeepTrust_v1.3");
  y += 2;

  // ─── 2. Authenticity Assessment ───
  heading("Authenticity Assessment");
  const manipScore = 100 - result.trustScore;
  const verdictLabel = manipScore < 30 ? "Likely Authentic" : manipScore < 60 ? "Suspicious" : "Likely Manipulated";
  const verdictColor = manipScore < 30 ? c.high : manipScore < 60 ? c.medium : c.low;

  doc.setFontSize(14);
  doc.setTextColor(verdictColor);
  doc.text(`Verdict: ${verdictLabel}`, MARGIN, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(c.fg);

  label("Trust Score:", `${result.trustScore} / 100`);
  label("Risk Level:", result.riskLevel.toUpperCase());

  // Calibration
  const cal = calibrateConfidence(result.trustScore, result.modalityScores);
  label("Calibrated Score:", String(cal.calibratedScore));
  label("Confidence Interval:", `±${cal.confidenceInterval}`);
  label("Calibration Status:", cal.calibrationStatus.replace(/_/g, " "));

  if (result.uncertaintyFlag) {
    y += 2;
    note(`⚠ Uncertainty: ${result.uncertaintyReason}`);
  }
  y += 2;

  // ─── 3. Evidence Summary ───
  heading("Evidence Summary");
  result.observations.forEach((obs) => {
    bullet(`[${obs.type.toUpperCase()}] ${obs.title}: ${obs.description}`);
  });
  y += 2;

  // ─── 4. Detector Consensus ───
  heading("Detector Consensus");
  const ensemble = computeDetectorEnsemble(result);
  ensemble.detectors.forEach((d) => {
    const probPct = Math.round(d.fakeProbability * 100);
    label(`${d.label}:`, `${probPct}% Fake (weight ${d.weight})`);
  });
  y += 2;
  doc.setFontSize(11);
  const consColor = ensemble.consensusScore >= 0.6 ? c.low : ensemble.consensusScore >= 0.4 ? c.medium : c.high;
  doc.setTextColor(consColor);
  doc.text(`Consensus: ${Math.round(ensemble.consensusScore * 100)}% — ${ensemble.consensusLabel}`, MARGIN, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(c.fg);

  // ─── 5. Robustness Analysis ───
  heading("Robustness Analysis");
  result.robustnessTests.forEach((r) => {
    const statusIcon = r.status === "pass" ? "✓" : r.status === "warning" ? "⚠" : "✗";
    label(`${statusIcon} ${r.mode}:`, `Confidence ${r.confidence}% (drift ${r.drift > 0 ? "+" : ""}${r.drift}%)`);
  });
  if (result.confidenceDrift) {
    y += 2;
    label("Stability Score:", `${result.confidenceDrift.stabilityScore} — ${result.confidenceDrift.stabilityStatus}`);
  }
  y += 2;

  // New page for detailed evidence
  doc.addPage();
  doc.setFillColor("#0f1319");
  doc.rect(0, 0, PAGE_W, 297, "F");
  y = MARGIN;

  // ─── 6. Timeline Anomaly Analysis ───
  heading("Timeline Anomaly Analysis");
  const anomalyFrames = result.frameAnalysis.filter((f) => f.anomalyType);
  if (anomalyFrames.length > 0) {
    anomalyFrames.forEach((f) => {
      bullet(`Frame ${f.frameNumber + 1} (${f.timestamp.toFixed(1)}s): ${f.anomalyType?.replace(/_/g, " ")} — confidence ${f.confidence}%`);
    });
  } else {
    note("No temporal anomalies detected in frame analysis.");
  }
  y += 2;

  // ─── 7. Heatmap Evidence ───
  heading("Heatmap Evidence");
  if (result.heatmapRegions.length > 0) {
    const highRegions = result.heatmapRegions.filter((r) => r.intensity > 0.5);
    label("Regions Analyzed:", String(result.heatmapRegions.length));
    label("High-Intensity Regions:", String(highRegions.length));
    highRegions.forEach((r) => {
      bullet(`Region${r.label ? ` "${r.label}"` : ""} at (${r.x}, ${r.y}): intensity ${(r.intensity * 100).toFixed(0)}%`);
    });
  } else {
    note("No significant heatmap activations detected.");
  }

  // ─── 8. Manipulation Regions ───
  if (result.manipulationRegions && result.manipulationRegions.length > 0) {
    heading("Manipulation Localization");
    result.manipulationRegions.forEach((mr) => {
      bullet(`[${mr.severity.toUpperCase()}] ${mr.region}: ${mr.description} (score ${(mr.score * 100).toFixed(0)}%)`);
    });
    y += 2;
  }

  // ─── 9. Generator Attribution ───
  heading("DeepFake Generator Attribution");
  const sig = extractArtifactSignature(result);
  const fp = matchFingerprint(sig);
  label("Best Match:", `${fp.generatorMatch.label} — ${Math.round(fp.generatorMatch.similarity * 100)}%`);
  fp.alternativeMatches.slice(0, 3).forEach((m) => {
    label(`  ${m.label}:`, `${Math.round(m.similarity * 100)}%`);
  });
  note(`Artifacts ${fp.generatorMatch.similarity >= 0.6 ? "consistent" : "weakly correlated"} with ${fp.generatorMatch.label}-style synthesis.`);
  y += 2;

  // ─── 10. Content Provenance ───
  heading("Content Provenance");
  const prov = analyzeProvenance(result.trustScore, result.mediaType, result.frameAnalysis.length);
  if (prov.bestMatch) {
    label("Source:", prov.bestMatch.sourceLabel);
    label("Similarity:", `${Math.round(prov.bestMatch.similarityScore * 100)}%`);
    note("Media likely originates from previously published content.");
  } else {
    note("No strong provenance match found in reference index.");
  }
  if (prov.matches.length > 0) {
    y += 2;
    prov.matches.forEach((m) => {
      label(`  ${m.sourceLabel}:`, `${Math.round(m.similarityScore * 100)}%`);
    });
  }
  y += 2;

  // ─── 11. Evidence Objects ───
  if (evidenceObjects.length > 0) {
    heading("Forensic Evidence Objects");
    evidenceObjects.forEach((e) => {
      ensurePage(LINE_H * 2);
      bullet(`[${e.severity.toUpperCase()}] ${e.category.replace(/_/g, " ")} — ${e.description} (confidence ${(e.confidence * 100).toFixed(0)}%)`);
    });
    y += 2;
  }

  // ─── 12. Chain of Custody ───
  if (chainOfCustody) {
    heading("Chain of Custody");
    label("File Hash:", chainOfCustody.fileHash);
    label("Upload Time:", chainOfCustody.uploadTimestamp);
    label("Version:", chainOfCustody.analysisVersion);
    label("Modules Used:", chainOfCustody.modulesUsed.join(", "));
  }

  // ─── Footer ───
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(c.muted);
    doc.text("Generated by DeepTrust Media Verification System", MARGIN, 290);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN - 20, 290);
  }

  // Download
  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, "_");
  doc.save(`DeepTrust_Report_${ts}.pdf`);
}
