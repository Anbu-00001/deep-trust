import MediaUpload from "./MediaUpload";
import TrustScoreMeter from "./TrustScoreMeter";
import StructuralGraph from "./StructuralGraph";
import RobustnessTest from "./RobustnessTest";
import ExplanationPanel from "./ExplanationPanel";
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
                    Analyzing with AI...
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Analysis Results</h3>
                    <span className="text-sm text-muted-foreground font-mono">{result.analysisTime}s</span>
                  </div>
                  
                  <div className="flex justify-center py-4">
                    <TrustScoreMeter score={result.trustScore} size="lg" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Detailed results */}
          {result && (
            <div className="mt-8 p-8 rounded-2xl bg-gradient-card border border-border animate-fade-in-up">
              <Tabs defaultValue="graph" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="graph">Structural Graph</TabsTrigger>
                  <TabsTrigger value="robustness">Robustness Tests</TabsTrigger>
                  <TabsTrigger value="explanation">Explanation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="graph" className="mt-0">
                  <div className="flex flex-col lg:flex-row items-start gap-8">
                    <StructuralGraph 
                      className="flex-1" 
                      suspiciousCount={result.graphStats.suspiciousNodes}
                    />
                    <div className="flex-1 space-y-4">
                      <h4 className="font-semibold">Graph Analysis</h4>
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
                
                <TabsContent value="robustness" className="mt-0">
                  <RobustnessTest results={result.robustnessTests} />
                </TabsContent>
                
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
