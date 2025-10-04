import { useEffect, useRef } from "react";
import { FileText, ImageIcon, FileCheck, Brain, Shield, Zap } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 50
      });

      gsap.set(cardsRef.current, {
        opacity: 0,
        y: 80,
        scale: 0.8,
        rotationY: 15
      });

      // Create floating background particles
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full bg-primary/10 pointer-events-none';
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        backgroundRef.current?.appendChild(particle);

        gsap.to(particle, {
          y: "random(-60, 60)",
          x: "random(-40, 40)",
          opacity: "random(0.2, 0.6)",
          duration: "random(4, 8)",
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2
        });
      }

      // Scroll-triggered animations
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          const tl = gsap.timeline();

          // Header animations
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
          })
          .to(subtitleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          }, "-=0.5");

          // Cards stagger animation
          gsap.to(cardsRef.current, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            stagger: {
              amount: 0.8,
              from: "start",
              grid: [2, 3]
            },
            delay: 0.3
          });
        }
      });

      // Individual card hover animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          const icon = card.querySelector('.feature-icon');
          const iconBg = card.querySelector('.feature-icon-bg');
          const title = card.querySelector('.feature-title');

          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -15,
              scale: 1.05,
              rotationY: 5,
              duration: 0.4,
              ease: "power2.out"
            });

            gsap.to(iconBg, {
              scale: 1.2,
              rotation: 360,
              duration: 0.6,
              ease: "back.out(1.7)"
            });

            gsap.to(icon, {
              scale: 1.2,
              rotation: -360,
              duration: 0.6,
              ease: "back.out(1.7)"
            });

            gsap.to(title, {
              color: "#06B6D4",
              duration: 0.3
            });

            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'absolute inset-0 rounded-2xl border-2 border-primary/30 opacity-0 pointer-events-none';
            card.appendChild(ripple);

            gsap.to(ripple, {
              opacity: 1,
              scale: 1.1,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to(ripple, {
              opacity: 0,
              scale: 1.2,
              duration: 0.5,
              ease: "power2.out",
              delay: 0.3,
              onComplete: () => ripple.remove()
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              rotationY: 0,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to([iconBg, icon], {
              scale: 1,
              rotation: 0,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to(title, {
              color: "inherit",
              duration: 0.3
            });
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      {/* Animated background */}
      <div ref={backgroundRef} className="absolute inset-0 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent"
          >
            Comprehensive AI Detection Suite
          </h2>
          <p 
            ref={subtitleRef}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Our advanced detection algorithms can identify AI-generated content across multiple formats 
            with industry-leading accuracy and speed.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="group p-8 rounded-2xl glass relative overflow-hidden cursor-pointer border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="feature-icon-bg w-16 h-16 rounded-xl bg-gradient-to-r from-primary/20 to-accent/10 flex items-center justify-center mb-6 relative">
                <feature.icon className={`feature-icon w-8 h-8 ${feature.color} relative z-10`} />
              </div>
              
              <h3 className="feature-title text-2xl font-semibold mb-4 transition-colors duration-300 relative z-10">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 relative z-10">
                {feature.description}
              </p>

              {/* Floating micro particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 w-1 h-1 bg-accent/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}