import { useRef, useEffect } from 'react';

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters (AI/forensic themed)
    const characters = '01AI◆▲●★◇▽◯☆FORENSICX';
    const charArray = characters.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    let animationId: number;
    let lastTime = 0;
    const targetFPS = 30; // Slower for better performance
    const frameTime = 1000 / targetFPS;

    const draw = (currentTime: number) => {
      if (currentTime - lastTime < frameTime) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastTime = currentTime;

      // Clear canvas with slight fade effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw characters
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Color gradient (primary to transparent)
        const gradient = ctx.createLinearGradient(0, drops[i] - 100, 0, drops[i]);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.fillText(char, i * fontSize, drops[i]);

        // Reset drop if it goes off screen
        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i] += fontSize * 0.5;
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}