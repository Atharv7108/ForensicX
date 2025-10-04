import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create AI/forensic themed background elements
    const createBackgroundElements = () => {
      // Neural network nodes
      for (let i = 0; i < 50; i++) {
        const node = document.createElement('div');
        node.className = 'absolute w-1 h-1 bg-primary/20 rounded-full';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        container.appendChild(node);

        // Animate nodes
        gsap.to(node, {
          opacity: Math.random() * 0.8 + 0.2,
          scale: Math.random() * 2 + 0.5,
          duration: Math.random() * 4 + 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }

      // Connection lines between nodes
      for (let i = 0; i < 30; i++) {
        const line = document.createElement('div');
        line.className = 'absolute bg-gradient-to-r from-primary/10 to-transparent';
        line.style.width = `${Math.random() * 200 + 50}px`;
        line.style.height = '1px';
        line.style.left = `${Math.random() * 100}%`;
        line.style.top = `${Math.random() * 100}%`;
        line.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(line);

        gsap.to(line, {
          opacity: Math.random() * 0.3 + 0.1,
          duration: Math.random() * 6 + 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 3
        });
      }

      // Binary code streams
      for (let i = 0; i < 15; i++) {
        const binaryStream = document.createElement('div');
        binaryStream.className = 'absolute text-xs font-mono text-primary/10 pointer-events-none';
        binaryStream.textContent = Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join('');
        binaryStream.style.left = `${Math.random() * 100}%`;
        binaryStream.style.top = `${Math.random() * 100}%`;
        binaryStream.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
        container.appendChild(binaryStream);

        gsap.to(binaryStream, {
          y: "+=100",
          opacity: 0,
          duration: Math.random() * 10 + 8,
          repeat: -1,
          ease: "none",
          delay: Math.random() * 5
        });
      }

      // AI scanning lines
      for (let i = 0; i < 8; i++) {
        const scanLine = document.createElement('div');
        scanLine.className = 'absolute bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent';
        scanLine.style.width = '100%';
        scanLine.style.height = '2px';
        scanLine.style.top = `${Math.random() * 100}%`;
        container.appendChild(scanLine);

        gsap.fromTo(scanLine, 
          { x: '-100%', opacity: 0 },
          {
            x: '100%',
            opacity: 1,
            duration: Math.random() * 8 + 6,
            repeat: -1,
            ease: "power2.inOut",
            delay: Math.random() * 4
          }
        );
      }

      // Forensic magnifying glass effects
      for (let i = 0; i < 5; i++) {
        const magnifier = document.createElement('div');
        magnifier.className = 'absolute w-20 h-20 border border-primary/20 rounded-full';
        magnifier.style.left = `${Math.random() * 100}%`;
        magnifier.style.top = `${Math.random() * 100}%`;
        container.appendChild(magnifier);

        gsap.to(magnifier, {
          scale: Math.random() * 1.5 + 0.5,
          rotation: 360,
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 12 + 8,
          repeat: -1,
          ease: "sine.inOut",
          delay: Math.random() * 3
        });
      }

      // Data points/particles
      for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-0.5 h-0.5 bg-primary/30 rounded-full';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        container.appendChild(particle);

        gsap.to(particle, {
          x: `+=${Math.random() * 200 - 100}`,
          y: `+=${Math.random() * 200 - 100}`,
          opacity: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 15 + 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 5
        });
      }

      // Hexagonal grid pattern
      for (let i = 0; i < 20; i++) {
        const hex = document.createElement('div');
        hex.className = 'absolute w-8 h-8 border border-primary/10';
        hex.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        hex.style.left = `${Math.random() * 100}%`;
        hex.style.top = `${Math.random() * 100}%`;
        container.appendChild(hex);

        gsap.to(hex, {
          rotation: 180,
          scale: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          duration: Math.random() * 10 + 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 3
        });
      }
    };

    createBackgroundElements();

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)
        `
      }}
    >
      {/* Additional fixed gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute bottom-0 right-0 w-full h-screen bg-gradient-to-tl from-primary/5 via-transparent to-accent/5" />
      
      {/* Animated grid overlay */}
      <div 
        className="absolute inset-0 opacity-10 animate-pulse"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}