import { ArrowRight, Shield, Scan, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 graph-grid opacity-30" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              AI-Powered Trust Verification
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Verify Media
            <br />
            <span className="text-gradient-primary">Authenticity</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            DeepTrust uses structural analysis and robustness testing to detect deepfakes 
            with explainable results. No black-box decisions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl">
              Analyze Media
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl">
              View Documentation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-card border border-border">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <span className="text-2xl font-bold">99.2%</span>
              <span className="text-sm text-muted-foreground">Detection Accuracy</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-card border border-border">
              <Scan className="w-8 h-8 text-primary mb-3" />
              <span className="text-2xl font-bold">&lt;2s</span>
              <span className="text-sm text-muted-foreground">Analysis Time</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-card border border-border">
              <FileCheck className="w-8 h-8 text-primary mb-3" />
              <span className="text-2xl font-bold">5+</span>
              <span className="text-sm text-muted-foreground">Robustness Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
