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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaAnalysis } from "@/hooks/useMediaAnalysis";

const DemoSection = () => {
  const { analyzeMedia, isAnalyzing, result, reset } = useMediaAnalysis();

  const handleAnalyze = async (file: File) => {
    await analyzeMedia(file);
  };

  const handleClear = () => {
    reset();
  };

  return (
    <section id="demo" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Try It Now
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any image, video, or audio file to see DeepTrust in action
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload */}
            <div className="p-8 rounded-2xl bg-gradient-card border border-border">
              <h3 className="text-xl font-semibold mb-6">Upload Media</h3>
              <MediaUpload 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                onClear={handleClear}
              />
            </div>

            {/* Right: Results */}
            <div className="p-8 rounded-2xl bg-gradient-card border border-border">
              {!result && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">
                    Upload a file to begin analysis
                  </p>
                </div>
              ) : isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                  <p className="text-muted-foreground animate-pulse">
                    Performing multi-modal forensic analysis...
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Analysis Results</h3>
                      <span className="text-xs text-muted-foreground font-mono uppercase">
                        {result.mediaType} • {result.analysisTime}s
                      </span>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      result.riskLevel === "low" ? "bg-trust-high/10 text-trust-high" :
                      result.riskLevel === "medium" ? "bg-trust-medium/10 text-trust-medium" :
                      "bg-trust-low/10 text-trust-low"
                    }`}>
                      {result.verdict}
                    </span>
                  </div>
                  
                  <div className="flex justify-center py-4">
                    <TrustScoreMeter score={result.trustScore} size="lg" />
                  </div>
                  
                  {/* Uncertainty Indicator */}
                  <UncertaintyIndicator 
                    trustScore={result.trustScore}
                    uncertaintyFlag={result.uncertaintyFlag}
                    uncertaintyReason={result.uncertaintyReason}
                    className="mt-4"
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Detailed results */}
          {result && (
            <div className="mt-8 p-8 rounded-2xl bg-gradient-card border border-border animate-fade-in-up">
              <Tabs defaultValue="fusion" className="w-full">
                <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-8 h-auto">
                  <TabsTrigger value="fusion" className="text-xs md:text-sm py-2">Multi-Modal</TabsTrigger>
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

                {/* Forensic Details (GAN, Texture, Metadata) */}
                <TabsContent value="forensic" className="mt-0">
                  <div className="flex flex-col lg:flex-row items-start gap-8">
                    <ForensicDetails
                      ganFingerprints={result.ganFingerprints}
                      textureAnalysis={result.textureAnalysis}
                      metadataAnalysis={result.metadataAnalysis}
                      className="flex-1"
                    />
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
                    </div>
                  </div>
                </TabsContent>

                {/* Face Heatmap (Grad-CAM) */}
                <TabsContent value="heatmap" className="mt-0">
                  <div className="flex flex-col lg:flex-row items-start gap-8">
                    <FaceHeatmap 
                      className="flex-1" 
                      regions={result.heatmapRegions}
                      overallScore={result.trustScore}
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
                  <ExplanationPanel 
                    observations={result.observations}
                    verdict={result.verdict}
                    trustScore={result.trustScore}
                    analysisTime={result.analysisTime}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
