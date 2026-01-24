import { Upload, Scan, GitBranch, TestTube, FileCheck } from "lucide-react";

const steps = [
  {
    icon: <Upload className="w-6 h-6" />,
    title: "Upload Media",
    description: "Submit image, video, or audio for analysis"
  },
  {
    icon: <Scan className="w-6 h-6" />,
    title: "Feature Extraction",
    description: "Visual keypoints and spatial features detected"
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: "Graph Construction",
    description: "Structural relationships mapped as nodes and edges"
  },
  {
    icon: <TestTube className="w-6 h-6" />,
    title: "Robustness Testing",
    description: "Confidence validated across 5 distortion conditions"
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    title: "Trust Scoring",
    description: "Explainable verdict with confidence metrics"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent pipeline from upload to explainable trust verdict
          </p>
        </div>

        {/* Desktop timeline */}
        <div className="hidden lg:block relative">
          {/* Connection line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center">
                {/* Step number */}
                <div className="absolute -top-8 text-xs font-mono text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Icon */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-card border border-border flex items-center justify-center text-primary mb-6 relative z-10 hover:border-primary/50 hover:scale-105 transition-all duration-300">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="font-semibold text-center mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile list */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-gradient-card border border-border"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
