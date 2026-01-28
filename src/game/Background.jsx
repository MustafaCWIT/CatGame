import { memo } from 'react';
import { LEVELS } from './levels';

const Background = memo(function Background({ levelIndex, width, height }) {
  const level = LEVELS[levelIndex] || LEVELS[0];
  const [c1, c2, c3] = level.background;

  return (
    <rect width={width} height={height} fill={`url(#bg-grad-${levelIndex})`}>
      <animate attributeName="opacity" from="0" to="1" dur="1.5s" fill="freeze" />
    </rect>
  );
}, (prev, next) => prev.levelIndex === next.levelIndex && prev.width === next.width && prev.height === next.height);

export function BackgroundDefs({ levelIndex, width, height }) {
  // Render defs for current and adjacent levels for smooth transitions
  const indices = [...new Set([Math.max(0, levelIndex - 1), levelIndex, Math.min(LEVELS.length - 1, levelIndex + 1)])];

  return (
    <defs>
      {indices.map(i => {
        const [c1, c2, c3] = LEVELS[i].background;
        return (
          <linearGradient key={i} id={`bg-grad-${i}`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="50%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

export default Background;
