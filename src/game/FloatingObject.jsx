import { memo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { OBJECT_SHAPES, OBJECT_SIZE } from './levels';
import fishImg from '../assets/fish.png';
import starImg from '../assets/star.png';
import bowlImg from '../assets/bowl.png';
import gameCloudImg from '../assets/gameCloud.png';
import sparrowImg from '../assets/sparrow.png';
import foodBoxImg from '../assets/foodBox.png';
import foodBoxesImg from '../assets/foodBoxes.png';
import leafImg from '../assets/leaf.png';
import dollarImg from '../assets/dollar.png';
import starsImg from '../assets/stars.png';

const FloatingObject = memo(function FloatingObject({ obj, onOffScreen, registerRef }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const path = OBJECT_SHAPES[obj.type] || OBJECT_SHAPES.orb;

  // Map object types to images
  const imageMap = {
    fish: fishImg,
    star: starImg,
    bowl: bowlImg,
    clouds: gameCloudImg,
    cloud: gameCloudImg,
    sparrow: sparrowImg,
    foodBox: foodBoxImg,
    foodBoxes: foodBoxesImg,
    leaf: leafImg,
    dollar: dollarImg,
    stars: starsImg,
  };

  const imageSrc = imageMap[obj.type];
  const useImage = imageSrc !== undefined;

  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;

    // Register the DOM element for position tracking
    if (registerRef) registerRef(obj.id, outerRef.current);

    // Initial setup to prevent jumps
    gsap.set(outerRef.current, {
      x: obj.x,
      y: obj.y,
      scale: obj.scale,
      opacity: 1
    });

    gsap.set(innerRef.current, {
      rotation: obj.rotation
    });

    // Main movement across the screen (x and y)
    const transitTween = gsap.to(outerRef.current, {
      x: obj.targetX,
      y: obj.targetY,
      duration: obj.duration,
      ease: "power1.inOut",
      onComplete: () => {
        if (onOffScreen) onOffScreen(obj.id);
      }
    });

    // Floating animation (slight random drift)
    const floatTween = gsap.to(innerRef.current, {
      x: `+=${(Math.random() - 0.5) * 40}`,
      y: `+=${(Math.random() - 0.5) * 40}`,
      duration: 1.5 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Rotation animation
    let rotateTween;
    if (obj.rotationSpeed !== 0) {
      rotateTween = gsap.to(innerRef.current, {
        rotation: `+=${obj.rotationSpeed * 360}`,
        duration: 10 + Math.random() * 5,
        repeat: -1,
        ease: "none"
      });
    }

    return () => {
      transitTween.kill();
      floatTween.kill();
      if (rotateTween) rotateTween.kill();
      if (registerRef) registerRef(obj.id, null);
    };
  }, [obj.id, obj.x, obj.y, obj.scale, obj.rotation, obj.targetX, obj.targetY, obj.duration, obj.rotationSpeed, onOffScreen, registerRef]);

  return (
    <g ref={outerRef} style={{ pointerEvents: 'none' }}>
      <g ref={innerRef} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
        {useImage ? (
          <image
            href={imageSrc}
            x={0}
            y={0}
            width={(obj.type === 'star' || obj.type === 'stars' || obj.type === 'leaf') ? OBJECT_SIZE * 0.7 : OBJECT_SIZE}
            height={(obj.type === 'star' || obj.type === 'stars' || obj.type === 'leaf') ? OBJECT_SIZE * 0.7 : OBJECT_SIZE}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <>
            <defs>
              <radialGradient id={`glow-${obj.id}`}>
                <stop offset="0%" stopColor={obj.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={obj.color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx={OBJECT_SIZE / 2}
              cy={OBJECT_SIZE / 2}
              r={OBJECT_SIZE * 0.6}
              fill={`url(#glow-${obj.id})`}
            />
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
    </g>
  );
});

export default FloatingObject;
