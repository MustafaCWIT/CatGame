import { useEffect, useRef } from 'react';

export default function Ripple({ ripple, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = el.animate(
      [
        { r: 10, opacity: 0.7, strokeWidth: 4 },
        { r: 80, opacity: 0, strokeWidth: 1 },
      ],
      { duration: 500, easing: 'ease-out', fill: 'forwards' }
    );
    anim.onfinish = () => onDone(ripple.id);
    return () => anim.cancel();
  }, [ripple.id, onDone]);

  return (
    <circle
      ref={ref}
      cx={ripple.x}
      cy={ripple.y}
      r="10"
      fill="none"
      stroke={ripple.color}
      strokeWidth="4"
      opacity="0.7"
    />
  );
}
