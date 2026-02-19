import { useEffect, useRef, useState } from 'react';

export default function PointPopup({ popup, onDone, language }) {
  const [y, setY] = useState(popup.y);
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const duration = 1200;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.2) {
        // Bounce in
        const p = progress / 0.2;
        setOpacity(p);
        setScale(0.5 + (1.2 - 0.5) * p);
        setY(popup.y);
      } else if (progress < 0.7) {
        // Move up
        const p = (progress - 0.2) / 0.5;
        setOpacity(1 - 0.1 * p);
        setScale(1.2 - (1.2 - 1) * p);
        setY(popup.y - 70 * p);
      } else {
        // Fade out
        const p = (progress - 0.7) / 0.3;
        setOpacity(0.9 - 0.9 * p);
        setScale(1 - 0.3 * p);
        setY(popup.y - 70 - 30 * p);
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onDone(popup.id);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [popup.id, popup.y, onDone]);

  // Determine font size based on points
  const fontSize = popup.points >= 3 ? 40 : popup.points >= 2 ? 36 : 32;

  return (
    <g
      transform={`translate(${popup.x}, ${y}) scale(${scale})`}
      opacity={opacity}
      style={{
        pointerEvents: 'none',
      }}
    >
      <text
        x="0"
        y="0"
        fill={popup.color}
        fontSize={fontSize}
        fontWeight="800"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          filter: `drop-shadow(0 0 6px ${popup.color}) drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
          userSelect: 'none',
        }}
      >
        +{language === 'ar' ? Number(popup.points).toLocaleString('ar-EG') : popup.points}
      </text>
    </g>
  );
}

