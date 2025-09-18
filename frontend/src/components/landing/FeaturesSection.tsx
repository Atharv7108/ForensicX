import { FileText, ImageIcon, FileCheck, Brain, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Text Detection",
    description: "Analyze written content to identify AI-generated text with advanced language models.",
    color: "text-primary",
  },
  {
    icon: ImageIcon,
    title: "Image Analysis",
    description: "Detect AI-generated or enhanced images using sophisticated computer vision algorithms.",
    color: "text-accent",
  },
  {
    icon: FileCheck,
    title: "PDF Processing",
    description: "Extract and analyze text from PDF documents for comprehensive content verification.",
    color: "text-neon-green",
  },
  {
    icon: Brain,
    title: "Advanced AI Models",
    description: "Powered by state-of-the-art machine learning models trained on diverse datasets.",
    color: "text-warning",
  },
  {
    icon: Shield,
    title: "High Accuracy",
    description: "Achieve 99.3% detection accuracy with continuous model improvements and updates.",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Get results in seconds with our optimized detection pipeline and cloud infrastructure.",
    color: "text-accent",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comprehensive AI Detection Suite
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our advanced detection algorithms can identify AI-generated content across multiple formats 
            with industry-leading accuracy and speed.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl glass hover:bg-card/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-${feature.color.replace('text-', '')}/20 to-${feature.color.replace('text-', '')}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}