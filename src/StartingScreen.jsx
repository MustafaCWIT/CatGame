import { useState, useEffect } from 'react';
import './StartingScreen.css';
import backgroundImg from './assets/background.png';
import gameBackgroundImg from './assets/gameBackground.png';
import lyingCatImg from './assets/lyingCat.png';
import fishImg from './assets/fish.png';
import bowlImg from './assets/bowl.png';
import starImg from './assets/star.png';

const ASSETS_TO_PRELOAD = [
  backgroundImg,
  gameBackgroundImg,
  lyingCatImg,
  fishImg,
  bowlImg,
  starImg
];

export default function StartingScreen({ levelName, onCountdownComplete }) {
  const [count, setCount] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // Preload assets
  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_PRELOAD.length;

    if (totalAssets === 0) {
      setIsReady(true);
      return;
    }

    const timer = setTimeout(() => {
      // Safety timeout: if images take too long, just show anyway
      setIsReady(true);
    }, 3000);

    ASSETS_TO_PRELOAD.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
          clearTimeout(timer);
          setIsReady(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
          clearTimeout(timer);
          setIsReady(true);
        }
      };
    });

    return () => clearTimeout(timer);
  }, []);

  // Countdown logic - only starts when ready
  useEffect(() => {
    if (!isReady) return;

    if (count < 3) {
      const timer = setTimeout(() => setCount(count + 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 3) {
      const timer = setTimeout(() => {
        onCountdownComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [count, isReady, onCountdownComplete]);

  // Don't show anything (except maybe background if cached) until everything is ready
  if (!isReady) {
    return (
      <div className="starting-screen loading">
        <div className="starting-loader-text">Loading Assets...</div>
      </div>
    );
  }

  return (
    <div className="starting-screen fade-in">
      <img src={backgroundImg} alt="" className="starting-background" />

      {/* Level name */}
      <h1 className="starting-title">{levelName || 'Midnight Paws'}</h1>

      {/* Game preview wrapper */}
      <div className="starting-preview-wrapper">
        {/* Cat overlapping the preview */}
        <img src={lyingCatImg} alt="" className="starting-cat" />

        {/* Game preview */}
        <div className="starting-preview">
          <img src={gameBackgroundImg} alt="" className="starting-game-bg" />

          {/* Star inside preview near cat paw */}
          <img src={starImg} alt="" className="starting-star" />

          {/* Fish */}
          <img src={fishImg} alt="" className="starting-fish" />

          {/* Bowl */}
          <img src={bowlImg} alt="" className="starting-bowl" />
        </div>
      </div>

      {/* Countdown */}
      <div className="starting-countdown">
        <span className="starting-label">Starting in</span>
        <span className="starting-number">{count}</span>
      </div>
    </div>
  );
}
