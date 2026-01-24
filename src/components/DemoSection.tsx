import { useState } from "react";
import MediaUpload from "./MediaUpload";
import TrustScoreMeter from "./TrustScoreMeter";
import StructuralGraph from "./StructuralGraph";
import RobustnessTest from "./RobustnessTest";
import ExplanationPanel from "./ExplanationPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DemoSection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
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
              <MediaUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            </div>

            {/* Right: Results */}
            <div className="p-8 rounded-2xl bg-gradient-card border border-border">
              {!showResults && !isAnalyzing ? (
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
                    Analyzing structural patterns...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Analysis Results</h3>
                    <span className="text-sm text-muted-foreground font-mono">1.8s</span>
                  </div>
                  
                  <div className="flex justify-center py-4">
                    <TrustScoreMeter score={87} size="lg" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed results */}
          {showResults && (
            <div className="mt-8 p-8 rounded-2xl bg-gradient-card border border-border animate-fade-in-up">
              <Tabs defaultValue="graph" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="graph">Structural Graph</TabsTrigger>
                  <TabsTrigger value="robustness">Robustness Tests</TabsTrigger>
                  <TabsTrigger value="explanation">Explanation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="graph" className="mt-0">
                  <div className="flex flex-col lg:flex-row items-start gap-8">
                    <StructuralGraph className="flex-1" />
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
                          <span className="font-mono">24</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Edge connections</span>
                          <span className="font-mono">38</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Suspicious nodes</span>
                          <span className="font-mono text-trust-low">3</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Graph coherence</span>
                          <span className="font-mono text-trust-high">94.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="robustness" className="mt-0">
                  <RobustnessTest />
                </TabsContent>
                
                <TabsContent value="explanation" className="mt-0">
                  <ExplanationPanel />
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
