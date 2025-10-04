import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  FileText, 
  ImageIcon, 
  FileCheck, 
  X,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLButtonElement[]>([]);

  const quickActions = [
    {
      icon: FileText,
      label: "Text Detection",
      href: "/dashboard?tab=text",
      color: "from-primary to-blue-500"
    },
    {
      icon: ImageIcon,
      label: "Image Analysis",
      href: "/dashboard?tab=image", 
      color: "from-accent to-purple-500"
    },
    {
      icon: FileCheck,
      label: "PDF Scan",
      href: "/dashboard?tab=pdf",
      color: "from-success to-green-500"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(menuRef.current, {
        opacity: 0,
        scale: 0.8,
        transformOrigin: "bottom right"
      });

      gsap.set(actionsRef.current, {
        opacity: 0,
        x: 50,
        scale: 0.8
      });

      // Floating animation for FAB
      gsap.to(fabRef.current, {
        y: "random(-3, 3)",
        duration: "random(2, 4)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      // Pulsing glow effect
      gsap.to(fabRef.current, {
        boxShadow: "0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)",
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleMenu = () => {
    if (!isOpen) {
      // Opening animation
      setIsOpen(true);
      
      gsap.to(menuRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });

      gsap.to(actionsRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: {
          amount: 0.2,
          from: "end"
        }
      });

      // Rotate FAB icon
      gsap.to(fabRef.current?.querySelector('svg'), {
        rotation: 45,
        duration: 0.3,
        ease: "power2.out"
      });

    } else {
      // Closing animation
      gsap.to(actionsRef.current, {
        opacity: 0,
        x: 50,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.in",
        stagger: {
          amount: 0.1,
          from: "start"
        }
      });

      gsap.to(menuRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.in",
        delay: 0.1,
        onComplete: () => setIsOpen(false)
      });

      // Rotate FAB icon back
      gsap.to(fabRef.current?.querySelector('svg'), {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleActionClick = (index: number) => {
    // Animate clicked action
    gsap.to(actionsRef.current[index], {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setIsOpen(false);
      }
    });
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {/* Quick action menu */}
      {isOpen && (
        <Card 
          ref={menuRef}
          className="absolute bottom-16 right-0 p-4 glass border-primary/20 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 min-w-[200px]">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                ref={(el) => {
                  if (el) actionsRef.current[index] = el;
                }}
                variant="ghost"
                size="sm"
                className={`justify-start gap-3 relative overflow-hidden group hover:text-white transition-all duration-300`}
                asChild
              >
                <Link 
                  to={action.href} 
                  onClick={() => handleActionClick(index)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md`} />
                  <action.icon className="w-4 h-4 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="relative z-10">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Main FAB */}
      <Button
        ref={fabRef}
        size="lg"
        className={`
          h-14 w-14 rounded-full shadow-2xl transition-all duration-300 group
          relative overflow-hidden
          ${isOpen 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-gradient-to-r from-primary to-accent hover:scale-110'
          }
        `}
        onClick={toggleMenu}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        
        {/* Icon */}
        {isOpen ? (
          <X className="w-6 h-6 relative z-10 transition-transform duration-300" />
        ) : (
          <Zap className="w-6 h-6 relative z-10 transition-transform duration-300" />
        )}

        {/* Pulsing ring effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        )}
      </Button>
    </div>
  );
}