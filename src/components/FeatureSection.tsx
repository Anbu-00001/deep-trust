import { Network, ShieldCheck, Eye, Zap, BarChart3, Lock } from "lucide-react";

const features = [
  {
    icon: <Network className="w-6 h-6" />,
    title: "Structural Graph Analysis",
    description: "Analyzes spatial relationships between keypoints rather than surface-level artifacts. Harder to fake consistently."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Robustness-First Design",
    description: "Validates confidence under real-world distortions including compression, noise, and motion blur."
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Explainable Outputs",
    description: "Every verdict includes visual graphs, specific observations, and clear reasoning—no black-box decisions."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Near Real-Time",
    description: "Production-oriented architecture delivers analysis results in under 2 seconds for most media."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Low False Positives",
    description: "Structural consistency analysis reduces false alarms on genuine media compared to artifact-based detection."
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Privacy-Focused",
    description: "Media is analyzed locally without storage. No data retention after analysis completes."
  }
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="text-gradient-primary">DeepTrust</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Moving beyond binary detection into comprehensive trust verification
            with transparency at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-gradient-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
