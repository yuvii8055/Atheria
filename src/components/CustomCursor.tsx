import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hoverState, setHoverState] = useState<'default' | 'pointer' | 'text' | 'action'>('default');
  const [cursorText, setCursorText] = useState<string>('');

  // Spring physics for smooth cursor lagging & elasticity
  const springConfig = { damping: 25, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  const dotConfig = { damping: 45, stiffness: 800, mass: 0.1 };
  const dotX = useSpring(-100, dotConfig);
  const dotY = useSpring(-100, dotConfig);

  useEffect(() => {
    // Detect touch / mobile device to prevent interfering with touch screens
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);

      // Check hover targets
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest('button, a, input, textarea, [data-cursor], [role="button"]');
      if (interactiveEl) {
        const customType = interactiveEl.getAttribute('data-cursor');
        const customLabel = interactiveEl.getAttribute('data-cursor-text') || '';
        setCursorText(customLabel);

        if (customType === 'action') {
          setHoverState('action');
        } else if (interactiveEl.tagName === 'INPUT' || interactiveEl.tagName === 'TEXTAREA') {
          setHoverState('text');
        } else {
          setHoverState('pointer');
        }
      } else {
        setHoverState('default');
        setCursorText('');
      }
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [visible, cursorX, cursorY, dotX, dotY]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Outer Spring Trailer Ring */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/40 backdrop-blur-[1px] flex items-center justify-center transition-[width,height,background-color,border-color] duration-200"
        style={{
          x: cursorX,
          y: cursorY,
          width: hoverState === 'pointer' ? 48 : hoverState === 'action' ? 64 : hoverState === 'text' ? 4 : 32,
          height: hoverState === 'pointer' ? 48 : hoverState === 'action' ? 64 : hoverState === 'text' ? 24 : 32,
          backgroundColor:
            hoverState === 'pointer'
              ? 'rgba(6, 182, 212, 0.12)'
              : hoverState === 'action'
              ? 'rgba(168, 85, 247, 0.2)'
              : 'rgba(255, 255, 255, 0.03)',
          borderColor:
            hoverState === 'action'
              ? 'rgba(168, 85, 247, 0.7)'
              : hoverState === 'pointer'
              ? 'rgba(56, 189, 248, 0.6)'
              : 'rgba(255, 255, 255, 0.25)',
          borderRadius: hoverState === 'text' ? '2px' : '9999px',
        }}
      >
        {cursorText && (
          <span className="text-[9px] uppercase tracking-wider font-semibold text-cyan-200 whitespace-nowrap px-1">
            {cursorText}
          </span>
        )}
      </motion.div>

      {/* Inner High-Precision Core Dot with difference blend */}
      {hoverState !== 'text' && (
        <motion.div
          className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#38bdf8] mix-blend-screen"
          style={{
            x: dotX,
            y: dotY,
          }}
        />
      )}
    </div>
  );
};
