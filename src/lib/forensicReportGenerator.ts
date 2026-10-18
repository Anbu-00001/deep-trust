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
  doc.text("DeepTrust Assessment Report", MARGIN, y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(c.muted);
  doc.text(`Generated ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`, MARGIN, y);
  y += 10;

  // ─── 1. Media Information ───
  heading("Media Information");
  label("File Name:", fileName || "uploaded_media");
  label("Media Type:", result.mediaType);
  label("SHA-256 Hash:", chainOfCustody ? chainOfCustody.fileHash.slice(0, 24) + "..." : "N/A");
  label("Analysis Date:", chainOfCustody?.uploadTimestamp || new Date().toISOString());
  label("Analysis Time:", `${result.analysisTime}s`);
  label("Analysis Version:", chainOfCustody?.analysisVersion || "DeepTrust_v1.3");
  y += 2;

  heading("Visual Review - Origin Not Established");
  note("This review is not a validated authenticity detector. No calibrated authenticity probability is available. A convincing AI image may show no obvious artifacts.");
  note(result.uncertaintyReason);
  label("Authenticity Probability:", "Unavailable");
  label("Benchmark Calibration:", "Not validated");
  label("Review Model:", result.modelUsed || "Legacy review");
  heading("Model Observations - Unverified");
  result.observations.forEach((obs) => bullet(`${obs.title}: ${obs.description}`));
  heading("Checks Not Performed");
  ["Independent detector inference and ensemble validation", "Frequency, sensor-noise, texture and landmark measurements", "Transformed-image robustness tests", "Video frame extraction and audio forensics", "EXIF, source matching and C2PA signature verification", "Generator attribution and measured localization"].forEach(bullet);
  heading("Measured File Identity");
  if (chainOfCustody) {
    note(`SHA-256: ${chainOfCustody.fileHash}`);
    note("This hash identifies the uploaded file bytes. It does not establish camera origin, authenticity or a complete chain of custody.");
    label("Review Version:", chainOfCustody.analysisVersion);
    label("Recorded Time:", chainOfCustody.uploadTimestamp);
  }
  heading("Research Basis");
  note("NIST AI 100-4: detection and provenance are complementary, imperfect signals.");
  note("https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-4.pdf");
  note("ICCV 2025 real-world evaluation: compression and redistribution challenge detection.");
  note("C2PA: provenance credentials do not determine whether depicted content is true.");

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
