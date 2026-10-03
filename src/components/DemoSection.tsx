import { useState, useMemo } from "react";
import GeneratorAttribution from "./GeneratorAttribution";
import DetectorConsensus from "./DetectorConsensus";
import ArtifactAmplification from "./ArtifactAmplification";
import AuthenticityTimeline from "./AuthenticityTimeline";
import ConfidenceDriftTable from "./ConfidenceDriftTable";
import MediaUpload from "./MediaUpload";
import TrustScoreMeter from "./TrustScoreMeter";
import StructuralGraph from "./StructuralGraph";
import RobustnessTest from "./RobustnessTest";
import ExplanationPanel from "./ExplanationPanel";
import FaceHeatmap from "./FaceHeatmap";
import AudioSpectrogram from "./AudioSpectrogram";
import FrameTimeline from "./FrameTimeline";
import MultiModalFusion from "./MultiModalFusion";
import UncertaintyIndicator from "./UncertaintyIndicator";
import ForensicDetails from "./ForensicDetails";
import MultimodalConsistencyCheck from "./MultimodalConsistencyCheck";
import AuthenticityMeter from "./AuthenticityMeter";
import EvidenceSummary from "./EvidenceSummary";
import FaceAudioConsistency from "./FaceAudioConsistency";
import ChainOfCustody from "./ChainOfCustody";
import EvidenceObjectList from "./EvidenceObjectList";
import ContentProvenance from "./ContentProvenance";
import ConfidenceCalibration from "./ConfidenceCalibration";
import DownloadReportButton from "./DownloadReportButton";
import AdversarialStressTestPanel from "./AdversarialStressTest";
import ForgeryPatternDiscovery from "./ForgeryPatternDiscovery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useMediaAnalysis } from "@/hooks/useMediaAnalysis";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, CircleDashed, FileCheck2, FlaskConical, Search, ShieldAlert, Zap } from "lucide-react";

const DemoSection = () => {
  const { analyzeMedia, isAnalyzing, result, error, reset, fileHash, cachedHit, evidenceObjects, chainOfCustody } = useMediaAnalysis();
  const [investigationMode, setInvestigationMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAnalyze = async (file: File) => {
    await analyzeMedia(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    reset();
  };

  // Evidence timeline events derived from evidence objects with timestamps
  const timelineEvents = useMemo(() => {
    return evidenceObjects
      .filter((e) => e.timestamp !== null)
      .map((e) => ({
        time: e.timestamp!,
        type: e.category,
        severity: e.severity,
        linkedEvidenceId: e.id,
        description: e.description,
      }));
  }, [evidenceObjects]);

  return (
    <section id="workspace" className="relative min-h-[calc(100vh-3rem)] workspace-grid">
      <div className="mx-auto max-w-[1600px] px-3 py-3 md:px-5 md:py-5">
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-border pb-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase text-primary">
              <span className="h-1.5 w-1.5 bg-primary" /> Assessment console
            </div>
            <h1 className="text-2xl font-bold uppercase md:text-3xl">Media integrity analysis</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Inspect submitted media, preserve its file hash, and review model observations with explicit uncertainty.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase text-muted-foreground">
            <span>Mode / Single-pass model assessment</span>
            <span className="h-2 w-2 bg-success" /> Ready
          </div>
        </div>

        <div className="grid min-h-[640px] overflow-hidden rounded border border-border bg-background lg:grid-cols-[52px_minmax(0,1fr)_340px]">
          <aside className="hidden border-r border-border bg-card/60 py-3 lg:flex lg:flex-col lg:items-center lg:gap-3" aria-label="Workspace tools">
            {[Search, FileCheck2, FlaskConical].map((Icon, index) => (
              <div key={index} className={`flex h-9 w-9 items-center justify-center rounded border ${index === 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-transparent text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>
            ))}
            <div className="mt-auto h-2 w-2 bg-success" title="Analysis service ready" />
          </aside>

          <div className="flex min-w-0 flex-col p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold uppercase">Evidence intake</h2>
                <p className="mt-1 text-xs text-muted-foreground">Original files are hashed locally before assessment.</p>
              </div>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Image / video / audio</span>
            </div>
            <MediaUpload
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onClear={handleClear}
              onFileSelect={setSelectedFile}
            />
          </div>

          <aside className="border-t border-border bg-card/70 p-4 lg:border-l lg:border-t-0" aria-label="Assessment status">
            <div className="mb-4 border-b border-border pb-3">
              <h2 className="text-xs font-bold uppercase">Assessment status</h2>
              <p className="mt-1 text-xs text-muted-foreground">Evidence, inference, and limitations are separated.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 font-mono text-[10px] uppercase">
                <div className="flex items-center justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">File selected</span>
                  <span className={selectedFile ? "text-foreground" : "text-muted-foreground"}>{selectedFile ? "Yes" : "Pending"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">File hash</span>
                  <span className={fileHash ? "text-success" : "text-muted-foreground"}>{fileHash ? "Recorded" : "Pending"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">Model assessment</span>
                  <span className={result ? "text-primary" : "text-muted-foreground"}>{isAnalyzing ? "Running" : result ? "Complete" : "Pending"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Human review</span>
                  <span className="text-accent">Required</span>
                </div>
              </div>

              {error ? (
                <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <div className="mb-1 flex items-center gap-2 font-medium"><ShieldAlert className="h-4 w-4" /> Assessment interrupted</div>
                  <p className="text-xs leading-relaxed">{error}</p>
                </div>
              ) : isAnalyzing ? (
                <div className="rounded border border-primary/40 bg-primary/5 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm"><CircleDashed className="h-4 w-4 animate-spin text-primary" /> Reviewing submitted media</div>
                  <div className="h-1 overflow-hidden bg-secondary"><div className="h-full w-2/3 animate-pulse bg-primary" /></div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="rounded border border-border bg-background p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-muted-foreground">Model assessment</p>
                        <h3 className="mt-1 text-base font-bold">{result.verdict}</h3>
                      </div>
                      {cachedHit && <Badge variant="outline" className="gap-1 text-[10px]"><Zap className="h-3 w-3" /> Cached</Badge>}
                    </div>
                    <TrustScoreMeter score={result.trustScore} size="lg" />
                    <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase text-muted-foreground">
                      <span>{result.mediaType}</span><span>{result.analysisTime}s</span>
                    </div>
                  </div>
                  <UncertaintyIndicator trustScore={result.trustScore} uncertaintyFlag={result.uncertaintyFlag} uncertaintyReason={result.uncertaintyReason} />
                  <DownloadReportButton result={result} evidenceObjects={evidenceObjects} chainOfCustody={chainOfCustody} />
                </div>
              ) : (
                <div className="rounded border border-border bg-background p-4 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 text-foreground"><AlertTriangle className="h-4 w-4 text-accent" /> No conclusion yet</div>
                  Add a file to begin. No authenticity claim is made before evidence is assessed.
                </div>
              )}

              <div id="method" className="border-t border-border pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Scope disclosure</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Results are probabilistic model observations, not proof of authenticity. File hashing is directly measured; analytical findings require expert review.
                </p>
              </div>
            </div>
          </aside>
        </div>

          {/* Detailed results */}
          {result && (
            <div id="reports" className="mt-5 border border-border bg-card p-4 animate-fade-in-up md:p-6">
              {/* Investigation Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Investigation Mode</span>
                </div>
                <Switch
                  checked={investigationMode}
                  onCheckedChange={setInvestigationMode}
                />
              </div>

              {investigationMode ? (
                /* ======= INVESTIGATION MODE LAYOUT ======= */
                <div className="space-y-8">
                  {/* Layer 1: Instant Verdict */}
                  <AuthenticityMeter trustScore={result.trustScore} />

                  {/* Layer 2: Confidence Calibration */}
                  <ConfidenceCalibration
                    trustScore={result.trustScore}
                    modalityScores={result.modalityScores}
                  />

                  {/* Layer 3: Detector Consensus */}
                  <DetectorConsensus result={result} />

                  {/* Layer 4: Artifact Amplification */}
                  <ArtifactAmplification result={result} />

                  {/* Layer 5: Evidence Summary */}
                  <EvidenceSummary
                    observations={result.observations}
                    trustScore={result.trustScore}
                    verdict={result.verdict}
                  />

                  {/* Layer 6: Evidence Objects */}
                  <EvidenceObjectList evidence={evidenceObjects} />

                  {/* Layer 7: Evidence Timeline (for video) */}
                  {result.mediaType !== "image" && timelineEvents.length > 0 && (
                    <AuthenticityTimeline
                      frames={result.frameAnalysis}
                      mediaType={result.mediaType}
                      overallScore={result.trustScore}
                    />
                  )}

                  {/* Layer 8: Content Provenance */}
                  <ContentProvenance result={result} />

                  {/* Layer 9: Explanation Cards */}
                  <ExplanationPanel
                    observations={result.observations}
                    verdict={result.verdict}
                    trustScore={result.trustScore}
                    analysisTime={result.analysisTime}
                  />

                  {/* Layer 10: Forensic Metadata */}
                  <ChainOfCustody metadata={chainOfCustody} />
                </div>
              ) : (
                /* ======= STANDARD TAB LAYOUT (unchanged) ======= */
                <Tabs defaultValue="fusion" className="w-full">
                  <TabsList className="mb-8 grid h-auto w-full grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border p-0 sm:grid-cols-5 lg:grid-cols-10">
                    <TabsTrigger value="fusion" className="text-xs md:text-sm py-2">Multi-Modal</TabsTrigger>
                    <TabsTrigger value="deepfake" className="text-xs md:text-sm py-2">Deepfake</TabsTrigger>
                    <TabsTrigger value="consistency" className="text-xs md:text-sm py-2">Consistency</TabsTrigger>
                    <TabsTrigger value="robustness" className="text-xs md:text-sm py-2">Robustness</TabsTrigger>
                    <TabsTrigger value="forensic" className="text-xs md:text-sm py-2">Forensic</TabsTrigger>
                    <TabsTrigger value="heatmap" className="text-xs md:text-sm py-2">Heatmap</TabsTrigger>
                    <TabsTrigger value="graph" className="text-xs md:text-sm py-2">Structure</TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs md:text-sm py-2">Timeline</TabsTrigger>
                    <TabsTrigger value="audio" className="text-xs md:text-sm py-2">Audio</TabsTrigger>
                    <TabsTrigger value="explanation" className="text-xs md:text-sm py-2">Details</TabsTrigger>
                  </TabsList>
                  
                  {/* Multi-Modal Fusion */}
                  <TabsContent value="fusion" className="mt-0">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1">
                        <MultiModalFusion
                          overallScore={result.trustScore}
                          mediaType={result.mediaType}
                          modalities={result.modalityScores}
                        />
                      </div>
                      <div className="lg:w-72 space-y-4">
                        <h4 className="font-semibold">Fusion Analysis</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Multi-modal fusion combines independent analysis channels using 
                          weighted confidence aggregation. Each modality contributes to 
                          the final authenticity score based on its reliability.
                        </p>
                        <div className="pt-4 border-t border-border">
                          <RobustnessTest results={result.robustnessTests} compact />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Visual Deepfake Detection + Confidence Drift */}
                  <TabsContent value="deepfake" className="mt-0">
                    <div className="space-y-6">
                      <ConfidenceDriftTable
                        detection={result.visualDeepfakeDetection}
                        drift={result.confidenceDrift}
                      />
                      {/* Multi-Detector Ensemble Consensus */}
                      <DetectorConsensus result={result} />
                      <ForgeryPatternDiscovery result={result} />
                    </div>
                  </TabsContent>


                  <TabsContent value="robustness" className="mt-0">
                    <div className="space-y-6">
                      <RobustnessTest results={result.robustnessTests} />
                      <AdversarialStressTestPanel result={result} />
                    </div>
                  </TabsContent>

                  {/* Multimodal Consistency Check */}
                  <TabsContent value="consistency" className="mt-0">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1">
                        <MultimodalConsistencyCheck
                          mediaType={result.mediaType}
                          trustScore={result.trustScore}
                          modalityScores={result.modalityScores}
                          consistencyData={result.multimodalConsistency}
                        />
                      </div>
                      <div className="lg:w-80 space-y-4">
                        <h4 className="font-semibold">Consistency Analysis</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This module compares visual and audio signals to detect inconsistencies. 
                          When modalities disagree, the system becomes more cautious rather than 
                          overconfident in its predictions.
                        </p>
                        <div className="space-y-2 text-sm pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">🔍</span>
                            <span className="text-muted-foreground">Cross-modal validation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">⚖️</span>
                            <span className="text-muted-foreground">Disagreement thresholds</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">🛡️</span>
                            <span className="text-muted-foreground">Confidence calibration</span>
                          </div>
                        </div>
                        {/* Face-Audio Consistency Indicator */}
                        <FaceAudioConsistency
                          mediaType={result.mediaType}
                          visualScore={result.modalityScores.find(m => m.modality === "visual")?.score ?? result.trustScore}
                          audioScore={result.modalityScores.find(m => m.modality === "audio")?.score ?? null}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Forensic Details (GAN, Texture, Metadata) + Chain-of-Custody */}
                  <TabsContent value="forensic" className="mt-0">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                      <div className="flex-1 space-y-6">
                        <ForensicDetails
                          ganFingerprints={result.ganFingerprints}
                          textureAnalysis={result.textureAnalysis}
                          metadataAnalysis={result.metadataAnalysis}
                        />
                        {/* DeepFake Generator Attribution */}
                        <GeneratorAttribution result={result} />
                        {/* Content Provenance Detection */}
                        <ContentProvenance result={result} />
                        {/* Chain-of-Custody Metadata */}
                        <ChainOfCustody metadata={chainOfCustody} />
                      </div>
                      <div className="lg:w-80 space-y-4">
                        <h4 className="font-semibold">Advanced Forensic Detection</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Deep analysis using ensemble preprocessing, GAN fingerprinting, 
                          texture consistency checks (Laplacian variance), and metadata 
                          signature analysis to detect sophisticated manipulations.
                        </p>
                        <div className="space-y-2 text-sm pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">🔬</span>
                            <span className="text-muted-foreground">GAN artifact detection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">🧬</span>
                            <span className="text-muted-foreground">Texture uniformity analysis</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">📄</span>
                            <span className="text-muted-foreground">Metadata integrity check</span>
                          </div>
                        </div>
                        {/* Evidence Objects Summary */}
                        {evidenceObjects.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <EvidenceObjectList evidence={evidenceObjects} />
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Face Heatmap (Grad-CAM) */}
                  <TabsContent value="heatmap" className="mt-0">
                    <div className="space-y-6">
                      <div className="flex flex-col lg:flex-row items-start gap-8">
                        <FaceHeatmap 
                          className="flex-1" 
                          regions={result.heatmapRegions}
                          overallScore={result.trustScore}
                          manipulationRegions={result.manipulationRegions}
                        />
                        <div className="flex-1 space-y-4">
                          <h4 className="font-semibold">Attention Heatmap</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Grad-CAM style visualization showing regions that triggered the 
                            deepfake detection model. High-intensity (red) areas indicate 
                            regions with potential manipulation artifacts or unusual patterns.
                          </p>
                          <div className="space-y-2 text-sm pt-4 border-t border-border">
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Regions analyzed</span>
                              <span className="font-mono">{result.heatmapRegions.length || "Full face"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">High attention areas</span>
                              <span className={`font-mono ${
                                (result.heatmapRegions.filter(r => r.intensity > 0.6).length || 0) > 2 
                                  ? 'text-trust-low' : 'text-trust-high'
                              }`}>
                                {result.heatmapRegions.filter(r => r.intensity > 0.6).length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-muted-foreground">Max intensity</span>
                              <span className={`font-mono ${
                                Math.max(...result.heatmapRegions.map(r => r.intensity), 0) > 0.7 
                                  ? 'text-trust-low' : 'text-trust-high'
                              }`}>
                                {(Math.max(...result.heatmapRegions.map(r => r.intensity), 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Synthetic Artifact Amplification */}
                      <ArtifactAmplification result={result} />
                    </div>
                  </TabsContent>

                  {/* Structural Graph */}
                  <TabsContent value="graph" className="mt-0">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                      <StructuralGraph 
                        className="flex-1" 
                        suspiciousCount={result.graphStats.suspiciousNodes}
                      />
                      <div className="flex-1 space-y-4">
                        <h4 className="font-semibold">Structural Graph</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          The structural graph represents detected facial keypoints as nodes 
                          and their spatial relationships as edges. Dense, consistent patterns 
                          indicate authentic content. Isolated nodes or irregular gaps may 
                          signal manipulation.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Keypoints detected</span>
                            <span className="font-mono">{result.graphStats.keypointsDetected}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Edge connections</span>
                            <span className="font-mono">{result.graphStats.edgeConnections}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Suspicious nodes</span>
                            <span className={`font-mono ${result.graphStats.suspiciousNodes > 0 ? 'text-trust-low' : 'text-trust-high'}`}>
                              {result.graphStats.suspiciousNodes}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Graph coherence</span>
                            <span className={`font-mono ${result.graphStats.graphCoherence >= 80 ? 'text-trust-high' : result.graphStats.graphCoherence >= 60 ? 'text-trust-medium' : 'text-trust-low'}`}>
                              {result.graphStats.graphCoherence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Frame Timeline */}
                  <TabsContent value="timeline" className="mt-0">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Frame-by-Frame Analysis</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Temporal consistency analysis across video frames
                          </p>
                        </div>
                        {result.mediaType === "image" && (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            Simulated for static image
                          </span>
                        )}
                      </div>
                      <FrameTimeline 
                        frames={result.frameAnalysis}
                        overallScore={result.trustScore}
                      />
                      {/* Authenticity Timeline (video-optimized anomaly chart) */}
                      <AuthenticityTimeline
                        frames={result.frameAnalysis}
                        mediaType={result.mediaType}
                        overallScore={result.trustScore}
                      />
                    </div>
                  </TabsContent>

                  {/* Audio Spectrogram */}
                  <TabsContent value="audio" className="mt-0">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Audio Spectrogram Analysis</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Frequency-domain analysis for voice synthesis detection
                          </p>
                        </div>
                        {result.mediaType === "image" && (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            No audio in image
                          </span>
                        )}
                      </div>
                      <AudioSpectrogram 
                        anomalyRegions={result.audioAnomalies}
                        overallScore={result.trustScore}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Detailed Explanation */}
                  <TabsContent value="explanation" className="mt-0">
                    <div className="space-y-6">
                      {/* Layer 1: Instant Verdict */}
                      <AuthenticityMeter trustScore={result.trustScore} />

                      {/* Layer 1.5: Confidence Calibration */}
                      <ConfidenceCalibration
                        trustScore={result.trustScore}
                        modalityScores={result.modalityScores}
                      />

                      {/* Layer 2: Human Explanation */}
                      <EvidenceSummary
                        observations={result.observations}
                        trustScore={result.trustScore}
                        verdict={result.verdict}
                      />

                      {/* Layer 3: Technical Evidence (existing) */}
                      <ExplanationPanel 
                        observations={result.observations}
                        verdict={result.verdict}
                        trustScore={result.trustScore}
                        analysisTime={result.analysisTime}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
