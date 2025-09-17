import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      
      <div id="features">
        <FeaturesSection />
      </div>
      
      <div id="pricing">
        <PricingSection />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
