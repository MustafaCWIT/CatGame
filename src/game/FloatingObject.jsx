import { memo } from 'react';
import { OBJECT_SHAPES, OBJECT_SIZE } from './levels';

const FloatingObject = memo(function FloatingObject({ obj }) {
  const path = OBJECT_SHAPES[obj.type] || OBJECT_SHAPES.orb;

  return (
    <g
      transform={`translate(${obj.x}, ${obj.y}) scale(${obj.scale}) rotate(${obj.rotation}, ${OBJECT_SIZE / 2}, ${OBJECT_SIZE / 2})`}
      opacity={obj.opacity}
      style={{ transition: obj.spawning ? 'opacity 0.5s ease-out' : undefined }}
    >
      <defs>
        <radialGradient id={`glow-${obj.id}`}>
          <stop offset="0%" stopColor={obj.color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={obj.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow behind */}
      <circle
        cx={OBJECT_SIZE / 2}
        cy={OBJECT_SIZE / 2}
        r={OBJECT_SIZE * 0.6}
        fill={`url(#glow-${obj.id})`}
      />
      {/* Shape */}
      <path
        d={path}
        fill={obj.color}
        fillOpacity="0.85"
        stroke={obj.color}
        strokeWidth="1"
        strokeOpacity="0.4"
        transform={`scale(${OBJECT_SIZE / 70})`}
      />
    </g>
  );
});

export default FloatingObject;
