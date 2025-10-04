import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const bgEffect1Ref = useRef<HTMLDivElement>(null);
  const bgEffect2Ref = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create timeline for entrance animations
      const tl = gsap.timeline();

      // Set initial states
      gsap.set([badgeRef.current, titleRef.current, subtitleRef.current, buttonsRef.current, pillsRef.current], {
        opacity: 0,
        y: 30
      });

      gsap.set([bgEffect1Ref.current, bgEffect2Ref.current], {
        scale: 0,
        opacity: 0
      });

      // Entrance sequence
      tl.to(bgEffect1Ref.current, {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power2.out"
      })
      .to(bgEffect2Ref.current, {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power2.out"
      }, "-=1.5")
      .to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=1")
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.5")
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.3")
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.2")
      .to(pillsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.3");

      // Floating background animations
      gsap.to(bgEffect1Ref.current, {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        rotation: "random(-5, 5)",
        duration: "random(4, 6)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      gsap.to(bgEffect2Ref.current, {
        y: "random(-15, 15)",
        x: "random(-15, 15)",
        rotation: "random(-3, 3)",
        duration: "random(5, 7)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      // Pulsing glow effect for title
      gsap.to(titleRef.current, {
        textShadow: "0 0 20px rgba(6, 182, 212, 0.8)",
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      // Parallax scroll effect
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(bgEffect1Ref.current, {
            y: progress * 100,
            duration: 0.3
          });
          gsap.to(bgEffect2Ref.current, {
            y: progress * -80,
            duration: 0.3
          });
        }
      });

      // Create floating particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 bg-primary/30 rounded-full';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        sectionRef.current?.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.to(particle, {
          y: "random(-50, 50)",
          x: "random(-30, 30)",
          opacity: "random(0.2, 0.8)",
          duration: "random(3, 8)",
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      <div 
        ref={bgEffect1Ref}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <div 
        ref={bgEffect2Ref}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div ref={badgeRef}>
          <Badge variant="secondary" className="mb-6 glass border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Advanced AI Detection Technology
          </Badge>
        </div>
        
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent"
        >
          Detect AI-Generated Content
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
        >
          Identify AI-generated text, images, and documents with our cutting-edge detection algorithms. 
          Protect authenticity in the age of artificial intelligence.
        </p>
        
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="group relative overflow-hidden" asChild>
            <Link to="/dashboard">
              <span className="relative z-10">Start Detecting Now</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="glass hover:bg-primary/10 relative group">
            <span className="relative z-10">View Demo</span>
            <div className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-md" />
          </Button>
        </div>
        
        {/* Enhanced Feature Pills */}
        <div ref={pillsRef} className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
            <Shield className="w-4 h-4 text-primary group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-sm">99.3% Accuracy</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 group">
            <Zap className="w-4 h-4 text-accent group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <span className="text-sm">Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 hover:border-success/50 hover:bg-success/5 transition-all duration-300 group">
            <Sparkles className="w-4 h-4 text-success group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-sm">Multiple Formats</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center animate-pulse">
            <div className="w-1 h-3 bg-primary rounded-full mt-2" />
          </div>
        </div>
      </div>
    </section>
  );
}