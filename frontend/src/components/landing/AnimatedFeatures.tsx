import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Shield, 
  Eye, 
  Cpu, 
  Target,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AnimatedFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const bgParticlesRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Brain,
      title: "Advanced AI Detection",
      description: "State-of-the-art neural networks trained on millions of samples",
      gradient: "from-primary to-blue-500",
      delay: "0.1s"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Get instant results with sub-second processing times",
      gradient: "from-accent to-purple-500",
      delay: "0.2s"
    },
    {
      icon: Shield,
      title: "99.3% Accuracy",
      description: "Industry-leading precision in AI content detection",
      gradient: "from-success to-green-500",
      delay: "0.3s"
    },
    {
      icon: Eye,
      title: "Multi-Modal Detection",
      description: "Analyze text, images, and documents simultaneously",
      gradient: "from-warning to-orange-500",
      delay: "0.4s"
    },
    {
      icon: Cpu,
      title: "Edge Computing",
      description: "Fast processing with privacy-first architecture",
      gradient: "from-pink-500 to-rose-500",
      delay: "0.5s"
    },
    {
      icon: Target,
      title: "Granular Analysis",
      description: "Sentence-level detection with confidence scoring",
      gradient: "from-indigo-500 to-purple-500",
      delay: "0.6s"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([badgeRef.current, titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 50
      });

      gsap.set(cardsRef.current, {
        opacity: 0,
        y: 100,
        scale: 0.8
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          const tl = gsap.timeline();

          // Animate header elements
          tl.to(badgeRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
          })
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
          }, "-=0.3");

          // Animate cards with stagger
          gsap.to(cardsRef.current, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            stagger: {
              amount: 0.6,
              from: "start"
            },
            delay: 0.5
          });
        }
      });

      // Individual card hover animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          const icon = card.querySelector('.feature-icon');
          const arrow = card.querySelector('.feature-arrow');
          const title = card.querySelector('.feature-title');

          gsap.set(arrow, { opacity: 0, x: -10 });

          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -10,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to(icon, {
              rotation: 360,
              scale: 1.1,
              duration: 0.6,
              ease: "back.out(1.7)"
            });

            gsap.to(arrow, {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to(title, {
              color: "#06B6D4",
              duration: 0.3
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to(icon, {
              rotation: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });

            gsap.to(arrow, {
              opacity: 0,
              x: -10,
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

      // Floating background particles
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full bg-primary/10';
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        bgParticlesRef.current?.appendChild(particle);

        gsap.to(particle, {
          y: "random(-100, 100)",
          x: "random(-50, 50)",
          opacity: "random(0.1, 0.5)",
          duration: "random(4, 8)",
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
      className="py-12 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div 
        ref={bgParticlesRef}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div ref={badgeRef}>
            <Badge variant="secondary" className="mb-4 glass border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Features
            </Badge>
          </div>
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent"
          >
            Cutting-Edge Detection Technology
          </h2>
          <p 
            ref={subtitleRef}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Our advanced AI detection suite combines multiple neural networks and 
            machine learning models to provide unparalleled accuracy in identifying 
            artificial content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="glass relative overflow-hidden group cursor-pointer border border-border/50 hover:border-primary/50 transition-colors duration-300"
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Floating mini particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 w-1 h-1 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`feature-icon p-3 rounded-lg bg-gradient-to-br ${feature.gradient} transition-all duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="feature-arrow w-4 h-4 text-muted-foreground transition-all duration-300" />
                </div>
                <CardTitle className="feature-title text-xl font-bold transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom tech indicator */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full border border-primary/30 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
            <Layers className="w-5 h-5 text-primary group-hover:animate-pulse" />
            <span className="text-sm font-medium">
              Powered by Advanced Neural Networks
            </span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}