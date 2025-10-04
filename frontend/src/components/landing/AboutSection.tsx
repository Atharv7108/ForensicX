import { useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Zap, Brain, Shield } from "lucide-react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    number: "99.3%",
    label: "Detection Accuracy",
    icon: Target,
  },
  {
    number: "1M+",
    label: "Content Analyzed",
    icon: Brain,
  },
  {
    number: "50K+",
    label: "Active Users",
    icon: Users,
  },
  {
    number: "24/7",
    label: "Support Available",
    icon: Shield,
  },
];

const values = [
  {
    title: "Innovation First",
    description: "We leverage cutting-edge AI and machine learning technologies to stay ahead of evolving AI-generated content.",
    icon: Zap,
  },
  {
    title: "Accuracy & Trust",
    description: "Our models are trained on diverse datasets to ensure reliable and unbiased detection across various content types.",
    icon: Award,
  },
  {
    title: "Privacy & Security",
    description: "We prioritize data protection with end-to-end encryption and never store your analyzed content permanently.",
    icon: Shield,
  },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement[]>([]);
  const storyRef = useRef<HTMLDivElement>(null);
  const storyContentRef = useRef<HTMLDivElement>(null);
  const storyVisualRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement[]>([]);
  const missionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([badgeRef.current, titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 50
      });

      gsap.set(statsRef.current, {
        opacity: 0,
        y: 60,
        scale: 0.8
      });

      gsap.set([storyContentRef.current, storyVisualRef.current], {
        opacity: 0,
        x: -50
      });

      gsap.set(storyVisualRef.current, {
        x: 50
      });

      gsap.set(valuesRef.current, {
        opacity: 0,
        y: 80,
        rotationX: 45
      });

      gsap.set(missionRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50
      });

      // Create floating data particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full pointer-events-none';
        
        const dataElements = ['01', '10', 'AI', '★', '◆', '▲', '●'];
        const element = dataElements[Math.floor(Math.random() * dataElements.length)];
        particle.textContent = element;
        particle.style.fontSize = `${Math.random() * 10 + 6}px`;
        particle.style.color = 'rgba(99, 102, 241, 0.1)';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.fontWeight = 'bold';
        backgroundRef.current?.appendChild(particle);

        gsap.to(particle, {
          y: "random(-100, 100)",
          x: "random(-60, 60)",
          rotation: "random(-360, 360)",
          opacity: "random(0.05, 0.2)",
          duration: "random(8, 15)",
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 4
        });
      }

      // Header animation
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: "top 80%",
        onEnter: () => {
          const tl = gsap.timeline();
          
          tl.to(badgeRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
          })
          .to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
          }, "-=0.4")
          .to(subtitleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          }, "-=0.6");
        }
      });

      // Stats animation with counter effect
      ScrollTrigger.create({
        trigger: '.stats-grid',
        start: "top 75%",
        onEnter: () => {
          statsRef.current.forEach((stat, index) => {
            if (stat) {
              gsap.to(stat, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: "back.out(1.7)",
                delay: index * 0.1
              });

              // Counter animation for numbers
              const numberElement = stat.querySelector('.stat-number');
              if (numberElement) {
                const originalText = numberElement.textContent;
                const hasPercent = originalText?.includes('%');
                const hasPlus = originalText?.includes('+');
                const hasSlash = originalText?.includes('/');
                
                if (originalText && !hasSlash) {
                  let targetNumber = parseInt(originalText.replace(/[^\d]/g, ''));
                  if (originalText.includes('K')) targetNumber *= 1000;
                  if (originalText.includes('M')) targetNumber *= 1000000;
                  
                  let currentNumber = 0;
                  gsap.to({ value: currentNumber }, {
                    value: targetNumber,
                    duration: 1.5,
                    ease: "power2.out",
                    delay: index * 0.1 + 0.3,
                    onUpdate: function() {
                      let displayValue = Math.floor(this.targets()[0].value);
                      let suffix = '';
                      
                      if (originalText?.includes('K')) {
                        displayValue = Math.floor(displayValue / 1000);
                        suffix = 'K';
                      } else if (originalText?.includes('M')) {
                        displayValue = Math.floor(displayValue / 1000000);
                        suffix = 'M';
                      }
                      
                      numberElement.textContent = displayValue + suffix + 
                        (hasPercent ? '%' : '') + 
                        (hasPlus ? '+' : '');
                    }
                  });
                }
              }
            }
          });
        }
      });

      // Story section animation
      ScrollTrigger.create({
        trigger: storyRef.current,
        start: "top 70%",
        onEnter: () => {
          const tl = gsap.timeline();
          
          tl.to(storyContentRef.current, {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out"
          })
          .to(storyVisualRef.current, {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out"
          }, "-=0.7");

          // Animate story visual grid items
          const gridItems = storyVisualRef.current?.querySelectorAll('.story-grid-item');
          if (gridItems) {
            gsap.fromTo(gridItems, 
              { scale: 0, rotation: 180 },
              { 
                scale: 1, 
                rotation: 0, 
                duration: 0.6, 
                ease: "back.out(2)",
                stagger: 0.1,
                delay: 0.5
              }
            );
          }
        }
      });

      // Values section animation
      ScrollTrigger.create({
        trigger: '.values-section',
        start: "top 70%",
        onEnter: () => {
          valuesRef.current.forEach((value, index) => {
            if (value) {
              gsap.to(value, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.8,
                ease: "back.out(1.7)",
                delay: index * 0.2
              });

              // Icon animation
              const icon = value.querySelector('.value-icon');
              if (icon) {
                gsap.fromTo(icon, 
                  { scale: 0, rotation: -180 },
                  { 
                    scale: 1, 
                    rotation: 0, 
                    duration: 0.6, 
                    ease: "back.out(2)",
                    delay: index * 0.2 + 0.3
                  }
                );
              }
            }
          });
        }
      });

      // Mission statement animation
      ScrollTrigger.create({
        trigger: missionRef.current,
        start: "top 85%",
        onEnter: () => {
          // First animate the container
          gsap.to(missionRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            onComplete: () => {
              // Then start the typewriter effect
              const missionText = missionRef.current?.querySelector('.mission-text');
              if (missionText) {
                const originalText = missionText.textContent || '';
                missionText.textContent = '';
                
                // Add blinking cursor
                const cursor = document.createElement('span');
                cursor.textContent = '|';
                cursor.className = 'text-primary animate-pulse';
                missionText.appendChild(cursor);
                
                // Get progress bar
                const progressBar = missionRef.current?.querySelector('.mission-progress');
                
                let currentIndex = 0;
                const typeInterval = setInterval(() => {
                  if (currentIndex < originalText.length) {
                    missionText.textContent = originalText.substring(0, currentIndex + 1);
                    missionText.appendChild(cursor);
                    
                    // Update progress bar
                    if (progressBar) {
                      const progress = (currentIndex / originalText.length) * 100;
                      (progressBar as HTMLElement).style.width = `${progress}%`;
                    }
                    
                    currentIndex++;
                  } else {
                    // Complete progress bar
                    if (progressBar) {
                      (progressBar as HTMLElement).style.width = '100%';
                    }
                    
                    // Remove cursor after typing is complete
                    setTimeout(() => {
                      if (cursor.parentNode) {
                        cursor.remove();
                      }
                      // Fade out progress bar
                      if (progressBar) {
                        (progressBar as HTMLElement).style.opacity = '0';
                      }
                    }, 1000);
                    clearInterval(typeInterval);
                  }
                }, 35); // Typing speed - slightly slower for better effect
              }
            }
          });
        }
      });

      // Hover animations for interactive elements
      statsRef.current.forEach((stat) => {
        if (stat) {
          stat.addEventListener('mouseenter', () => {
            gsap.to(stat, {
              y: -10,
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)",
              duration: 0.3,
              ease: "power2.out"
            });

            const icon = stat.querySelector('.stat-icon');
            if (icon) {
              gsap.to(icon, {
                scale: 1.2,
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
              });
            }
          });

          stat.addEventListener('mouseleave', () => {
            gsap.to(stat, {
              y: 0,
              scale: 1,
              boxShadow: "none",
              duration: 0.3,
              ease: "power2.out"
            });

            const icon = stat.querySelector('.stat-icon');
            if (icon) {
              gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out"
              });
            }
          });
        }
      });

      valuesRef.current.forEach((value) => {
        if (value) {
          value.addEventListener('mouseenter', () => {
            gsap.to(value, {
              y: -15,
              scale: 1.03,
              rotationY: 5,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
              duration: 0.4,
              ease: "power2.out"
            });

            const icon = value.querySelector('.value-icon-bg');
            if (icon) {
              gsap.to(icon, {
                scale: 1.1,
                rotation: 10,
                duration: 0.3
              });
            }
          });

          value.addEventListener('mouseleave', () => {
            gsap.to(value, {
              y: 0,
              scale: 1,
              rotationY: 0,
              boxShadow: "none",
              duration: 0.3,
              ease: "power2.out"
            });

            const icon = value.querySelector('.value-icon-bg');
            if (icon) {
              gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3
              });
            }
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
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div ref={badgeRef}>
            <Badge variant="outline" className="mb-4 border-primary/30">
              About ForensicX
            </Badge>
          </div>
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent"
          >
            Leading the Future of AI Content Detection
          </h2>
          <p 
            ref={subtitleRef}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            ForensicX is at the forefront of AI detection technology, empowering individuals 
            and organizations to identify AI-generated content with unprecedented accuracy 
            across text, images, and documents.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              ref={(el) => {
                if (el) statsRef.current[index] = el;
              }}
              className="text-center glass cursor-pointer border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="stat-icon w-6 h-6 text-primary" />
                </div>
                <div className="stat-number text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story */}
        <div ref={storyRef} className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div ref={storyContentRef}>
            <h3 className="text-3xl font-bold mb-6">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2024, ForensicX emerged from the growing need to distinguish 
                between human-created and AI-generated content in an era where artificial 
                intelligence has become increasingly sophisticated.
              </p>
              <p>
                Our team of AI researchers, data scientists, and cybersecurity experts 
                recognized that traditional detection methods were becoming obsolete. 
                We set out to build a comprehensive platform that could adapt to the 
                rapidly evolving landscape of AI content generation.
              </p>
              <p>
                Today, ForensicX serves thousands of users worldwide, from content creators 
                and educators to enterprise organizations and research institutions, 
                helping them maintain authenticity and trust in digital content.
              </p>
            </div>
          </div>
          
          <div ref={storyVisualRef} className="relative">
            <div className="glass p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="story-grid-item text-center">
                  <div className="text-2xl font-bold text-primary">🚀</div>
                  <div className="text-sm mt-2">Advanced AI Models</div>
                </div>
                <div className="story-grid-item text-center">
                  <div className="text-2xl font-bold text-primary">🔍</div>
                  <div className="text-sm mt-2">Multi-Modal Detection</div>
                </div>
                <div className="story-grid-item text-center">
                  <div className="text-2xl font-bold text-primary">⚡</div>
                  <div className="text-sm mt-2">Real-Time Processing</div>
                </div>
                <div className="story-grid-item text-center">
                  <div className="text-2xl font-bold text-primary">🛡️</div>
                  <div className="text-sm mt-2">Enterprise Security</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="values-section">
          <h3 className="text-3xl font-bold text-center mb-12">Our Core Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index} 
                ref={(el) => {
                  if (el) valuesRef.current[index] = el;
                }}
                className="glass cursor-pointer border border-border/50 hover:border-primary/30 transition-colors duration-300"
              >
                <CardContent className="p-8">
                  <div className="value-icon-bg w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <value.icon className="value-icon w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold mb-4 text-center">{value.title}</h4>
                  <p className="text-muted-foreground text-center">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center mt-20">
          <div 
            ref={missionRef}
            className="glass p-12 rounded-3xl max-w-4xl mx-auto border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
          >
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Mission
            </h3>
            <div className="relative">
              <p className="mission-text text-lg text-muted-foreground leading-relaxed font-medium">
                "To democratize AI content detection technology and empower everyone with the tools 
                needed to distinguish authentic human-created content from AI-generated material, 
                fostering transparency and trust in our digital world."
              </p>
              
              {/* Typing progress indicator */}
              <div className="absolute -bottom-6 left-0 w-full h-0.5 bg-border/30 rounded-full overflow-hidden">
                <div className="mission-progress h-full bg-gradient-to-r from-primary to-accent rounded-full w-0 transition-all duration-300"></div>
              </div>
            </div>
            
            {/* Mission accent decoration */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-accent/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}