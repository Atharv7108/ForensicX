import { useRef, useEffect } from 'react';

export function AINetworkVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Create animated paths that simulate neural connections
    const createNeuralPaths = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());

      // Define connection points (nodes)
      const nodes = [
        { x: width * 0.1, y: height * 0.2 },
        { x: width * 0.3, y: height * 0.1 },
        { x: width * 0.5, y: height * 0.3 },
        { x: width * 0.7, y: height * 0.2 },
        { x: width * 0.9, y: height * 0.4 },
        { x: width * 0.2, y: height * 0.6 },
        { x: width * 0.4, y: height * 0.7 },
        { x: width * 0.6, y: height * 0.5 },
        { x: width * 0.8, y: height * 0.8 },
        { x: width * 0.1, y: height * 0.9 },
      ];

      // Clear existing paths
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      pathsRef.current = [];

      // Create curved paths between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = Math.sqrt(
            Math.pow(nodes[i].x - nodes[j].x, 2) + 
            Math.pow(nodes[i].y - nodes[j].y, 2)
          );
          
          // Only connect nearby nodes
          if (distance < width * 0.4) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Create curved path
            const midX = (nodes[i].x + nodes[j].x) / 2;
            const midY = (nodes[i].y + nodes[j].y) / 2;
            const controlX = midX + (Math.random() - 0.5) * 100;
            const controlY = midY + (Math.random() - 0.5) * 100;
            
            const pathData = `M ${nodes[i].x} ${nodes[i].y} Q ${controlX} ${controlY} ${nodes[j].x} ${nodes[j].y}`;
            
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', 'rgba(99, 102, 241, 0.3)');
            path.setAttribute('stroke-width', '1');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0');
            
            // Add gradient stroke
            const gradientId = `gradient-${i}-${j}`;
            const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            if (!svg.querySelector('defs')) {
              svg.appendChild(defs);
            }
            
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
            gradient.setAttribute('x1', nodes[i].x.toString());
            gradient.setAttribute('y1', nodes[i].y.toString());
            gradient.setAttribute('x2', nodes[j].x.toString());
            gradient.setAttribute('y2', nodes[j].y.toString());
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', 'rgba(99, 102, 241, 0.6)');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '50%');
            stop2.setAttribute('stop-color', 'rgba(6, 182, 212, 0.4)');
            
            const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop3.setAttribute('offset', '100%');
            stop3.setAttribute('stop-color', 'rgba(99, 102, 241, 0.2)');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            defs.appendChild(gradient);
            
            path.setAttribute('stroke', `url(#${gradientId})`);
            
            svg.appendChild(path);
            pathsRef.current.push(path);
            
            // Animate path appearance
            setTimeout(() => {
              path.style.transition = 'opacity 2s ease-in-out';
              path.setAttribute('opacity', '0.6');
              
              // Add pulse animation
              const pulseAnimation = () => {
                path.style.transition = 'opacity 1s ease-in-out';
                path.setAttribute('opacity', (Math.random() * 0.4 + 0.2).toString());
                setTimeout(pulseAnimation, Math.random() * 3000 + 2000);
              };
              setTimeout(pulseAnimation, Math.random() * 2000);
            }, Math.random() * 3000);
          }
        }
      }

      // Add nodes
      nodes.forEach((node, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x.toString());
        circle.setAttribute('cy', node.y.toString());
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', 'rgba(6, 182, 212, 0.8)');
        circle.setAttribute('opacity', '0');
        
        svg.appendChild(circle);
        
        // Animate node appearance
        setTimeout(() => {
          circle.style.transition = 'opacity 1s ease-out, r 1s ease-out';
          circle.setAttribute('opacity', '0.8');
          
          // Add breathing effect
          const breathe = () => {
            circle.style.transition = 'r 2s ease-in-out';
            circle.setAttribute('r', (Math.random() * 2 + 2).toString());
            setTimeout(breathe, Math.random() * 3000 + 2000);
          };
          setTimeout(breathe, Math.random() * 1000);
        }, index * 200);
      });
    };

    createNeuralPaths();

    const handleResize = () => {
      createNeuralPaths();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}