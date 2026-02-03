import { memo } from 'react';
import { OBJECT_SHAPES, OBJECT_SIZE } from './levels';
import fishImg from '../assets/fish.png';
import starImg from '../assets/star.png';
import bowlImg from '../assets/bowl.png';
import cloudsImg from '../assets/clouds.png';

const FloatingObject = memo(function FloatingObject({ obj }) {
  const path = OBJECT_SHAPES[obj.type] || OBJECT_SHAPES.orb;
  
  // Map object types to images for level 0
  const imageMap = {
    fish: fishImg,
    star: starImg,
    bowl: bowlImg,
    clouds: cloudsImg,
  };
  
  const imageSrc = imageMap[obj.type];
  const useImage = imageSrc !== undefined;

  return (
    <g
      transform={`translate(${obj.x}, ${obj.y}) scale(${obj.scale}) rotate(${obj.rotation}, ${OBJECT_SIZE / 2}, ${OBJECT_SIZE / 2})`}
      opacity={obj.opacity}
      style={{ transition: obj.spawning ? 'opacity 0.5s ease-out' : undefined }}
    >
      {useImage ? (
        // Render image for fish, star, bowl
        <image
          href={imageSrc}
          x={0}
          y={0}
          width={OBJECT_SIZE}
          height={OBJECT_SIZE}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        // Render SVG path for other objects
        <>
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
        </>
      )}
    </g>
  );
});

export default FloatingObject;
