import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export function DashboardBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create dashboard-specific background elements
    const createDashboardElements = () => {
      // Scanning grid lines (forensic style)
      for (let i = 0; i < 12; i++) {
        const scanLine = document.createElement('div');
        scanLine.className = 'absolute bg-gradient-to-r from-transparent via-primary/10 to-transparent';
        scanLine.style.width = '100%';
        scanLine.style.height = '1px';
        scanLine.style.top = `${(i + 1) * 8}%`;
        container.appendChild(scanLine);

        gsap.fromTo(scanLine, 
          { x: '-100%', opacity: 0 },
          {
            x: '100%',
            opacity: 0.8,
            duration: Math.random() * 6 + 4,
            repeat: -1,
            ease: "power2.inOut",
            delay: Math.random() * 3
          }
        );
      }

      // Vertical scanning lines
      for (let i = 0; i < 8; i++) {
        const vScanLine = document.createElement('div');
        vScanLine.className = 'absolute bg-gradient-to-b from-transparent via-accent/8 to-transparent';
        vScanLine.style.height = '100%';
        vScanLine.style.width = '1px';
        vScanLine.style.left = `${(i + 1) * 12}%`;
        container.appendChild(vScanLine);

        gsap.fromTo(vScanLine, 
          { y: '-100%', opacity: 0 },
          {
            y: '100%',
            opacity: 0.6,
            duration: Math.random() * 8 + 6,
            repeat: -1,
            ease: "power2.inOut",
            delay: Math.random() * 2
          }
        );
      }

      // Data points/detection markers
      for (let i = 0; i < 60; i++) {
        const dataPoint = document.createElement('div');
        dataPoint.className = 'absolute w-1 h-1 rounded-full';
        
        // Different colors for different detection types
        const colors = [
          'bg-primary/30',
          'bg-accent/25', 
          'bg-success/20',
          'bg-warning/15'
        ];
        dataPoint.className += ' ' + colors[Math.floor(Math.random() * colors.length)];
        
        dataPoint.style.left = `${Math.random() * 100}%`;
        dataPoint.style.top = `${Math.random() * 100}%`;
        container.appendChild(dataPoint);

        gsap.to(dataPoint, {
          scale: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 3 + 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }

      // Analysis progress bars (floating)
      for (let i = 0; i < 8; i++) {
        const progressBar = document.createElement('div');
        progressBar.className = 'absolute h-0.5 bg-primary/20 rounded-full';
        progressBar.style.width = `${Math.random() * 120 + 40}px`;
        progressBar.style.left = `${Math.random() * 80}%`;
        progressBar.style.top = `${Math.random() * 90}%`;
        container.appendChild(progressBar);

        const progressFill = document.createElement('div');
        progressFill.className = 'h-full bg-gradient-to-r from-primary/60 to-accent/40 rounded-full';
        progressFill.style.width = '0%';
        progressBar.appendChild(progressFill);

        gsap.to(progressFill, {
          width: `${Math.random() * 80 + 20}%`,
          duration: Math.random() * 4 + 2,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: Math.random() * 3
        });
      }

      // Forensic magnification circles
      for (let i = 0; i < 6; i++) {
        const magCircle = document.createElement('div');
        magCircle.className = 'absolute border border-primary/15 rounded-full';
        const size = Math.random() * 60 + 30;
        magCircle.style.width = `${size}px`;
        magCircle.style.height = `${size}px`;
        magCircle.style.left = `${Math.random() * 90}%`;
        magCircle.style.top = `${Math.random() * 80}%`;
        container.appendChild(magCircle);

        gsap.to(magCircle, {
          scale: Math.random() * 0.8 + 0.6,
          rotation: 360,
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 8 + 6,
          repeat: -1,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }

      // Detection result indicators
      for (let i = 0; i < 15; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'absolute text-xs font-mono pointer-events-none';
        
        const labels = ['ANALYZING...', 'DETECTED', 'VERIFIED', 'PROCESSING', 'AUTHENTIC', 'AI-GEN', 'FLAGGED'];
        indicator.textContent = labels[Math.floor(Math.random() * labels.length)];
        indicator.style.color = 'rgba(99, 102, 241, 0.15)';
        indicator.style.left = `${Math.random() * 85}%`;
        indicator.style.top = `${Math.random() * 85}%`;
        indicator.style.fontSize = `${Math.random() * 4 + 8}px`;
        container.appendChild(indicator);

        gsap.to(indicator, {
          opacity: Math.random() * 0.3 + 0.1,
          y: `+=${Math.random() * 40 - 20}`,
          duration: Math.random() * 6 + 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 3
        });
      }

      // Circuit-like connection patterns
      for (let i = 0; i < 20; i++) {
        const circuit = document.createElement('div');
        circuit.className = 'absolute bg-primary/8';
        
        // Random horizontal or vertical lines
        if (Math.random() > 0.5) {
          circuit.style.width = `${Math.random() * 100 + 50}px`;
          circuit.style.height = '1px';
        } else {
          circuit.style.height = `${Math.random() * 100 + 50}px`;
          circuit.style.width = '1px';
        }
        
        circuit.style.left = `${Math.random() * 90}%`;
        circuit.style.top = `${Math.random() * 90}%`;
        container.appendChild(circuit);

        gsap.to(circuit, {
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 4 + 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }

      // Floating data fragments
      for (let i = 0; i < 25; i++) {
        const fragment = document.createElement('div');
        fragment.className = 'absolute text-xs font-mono text-primary/10 pointer-events-none';
        
        const dataFragments = ['0x1A', '0xFF', 'SHA256', 'MD5', 'RGB', 'PDF', 'AI%', 'CHK', 'EOF', 'HDR'];
        fragment.textContent = dataFragments[Math.floor(Math.random() * dataFragments.length)];
        fragment.style.left = `${Math.random() * 95}%`;
        fragment.style.top = `${Math.random() * 95}%`;
        container.appendChild(fragment);

        gsap.to(fragment, {
          x: `+=${Math.random() * 60 - 30}`,
          y: `+=${Math.random() * 60 - 30}`,
          opacity: Math.random() * 0.3 + 0.05,
          duration: Math.random() * 10 + 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 4
        });
      }
    };

    createDashboardElements();

    const handleResize = () => {
      if (container) {
        container.innerHTML = '';
        createDashboardElements();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
          radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)
        `
      }}
    >
      {/* Dashboard-specific gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-60" />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-success/2 via-transparent to-primary/2 opacity-40" />
      
      {/* Subtle grid pattern for dashboard */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
