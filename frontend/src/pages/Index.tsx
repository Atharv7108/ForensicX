import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AnimatedFeatures } from "@/components/landing/AnimatedFeatures";
import { PricingSection } from "@/components/landing/PricingSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { MatrixRain } from "@/components/background/MatrixRain";
import { AINetworkVisualization } from "@/components/background/AINetworkVisualization";
import { SeamlessTransition } from "@/components/background/SeamlessTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();

  // Handle hash navigation on component mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Remove the # from the hash
      const elementId = hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Background Layers */}
      <AINetworkVisualization />
      <MatrixRain />
      <AnimatedBackground />
      <SeamlessTransition />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        
        {/* Enhanced GSAP animated features */}
        <AnimatedFeatures />
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <div id="pricing">
          <PricingSection />
        </div>
        
        <div id="about">
          <AboutSection />
        </div>
        
        <Footer />
        
        {/* Show animated FAB only for authenticated users */}
        {user && <FloatingActionButton />}
      </div>
    </div>
  );
};

export default Index;
