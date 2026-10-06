import { useState, useEffect, useRef } from 'react';

export function useScroll() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const handleWheel = (event: WheelEvent) => {
      targetScrollY.current = Math.max(0, targetScrollY.current + event.deltaY);
    };

    const updateSmoothScroll = () => {
      currentScrollY.current += (targetScrollY.current - currentScrollY.current) * 0.1;
      setScrollY(currentScrollY.current);

      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, Math.max(0, currentScrollY.current / maxScroll)));

      animationFrameId = requestAnimationFrame(updateSmoothScroll);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    animationFrameId = requestAnimationFrame(updateSmoothScroll);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { scrollY, scrollProgress, setTargetScrollY: (y: number) => { targetScrollY.current = y; } };
}
