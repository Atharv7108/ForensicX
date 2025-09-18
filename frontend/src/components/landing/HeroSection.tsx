import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <Badge variant="secondary" className="mb-6 glass border-primary/20">
          <Sparkles className="w-4 h-4 mr-2" />
          Advanced AI Detection Technology
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
          Detect AI-Generated Content
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Identify AI-generated text, images, and documents with our cutting-edge detection algorithms. 
          Protect authenticity in the age of artificial intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="group hover-glow" asChild>
            <Link to="/dashboard">
              Start Detecting Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="glass hover:bg-primary/10">
            View Demo
          </Button>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm">99.3% Accuracy</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm">Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
            <Sparkles className="w-4 h-4 text-neon-green" />
            <span className="text-sm">Multiple Formats</span>
          </div>
        </div>
      </div>
    </section>
  );
}