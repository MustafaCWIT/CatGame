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
      // Transition paused at user request
      /*
      const timer = setTimeout(() => {
        onCountdownComplete();
      }, 500);
      return () => clearTimeout(timer);
      */
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

      {/* Top Navigation */}
      <div className="starting-nav">
        <button className="starting-home-btn">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <div className="starting-profile">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      {/* Level name */}
      <h1 className="starting-title">{levelName || 'Midnight Paws'}</h1>

      {/* Game preview wrapper with Tablet Frame */}
      <div className="starting-preview-wrapper">
        <div className="starting-tablet-frame">
          <div className="starting-tablet-bezel">
            {/* Game preview */}
            <div className="starting-preview">
              <img src={gameBackgroundImg} alt="" className="starting-game-bg" />

              {/* In-game UI pills */}
              <div className="preview-ui-top">
                <div className="preview-pill preview-pill-score">15000</div>
                <div className="preview-pill preview-pill-time">00:25</div>
              </div>

              {/* Star inside preview */}
              <img src={starImg} alt="" className="starting-star" />

              {/* Fish */}
              <img src={fishImg} alt="" className="starting-fish" />

              {/* Bowl */}
              <img src={bowlImg} alt="" className="starting-bowl" />
            </div>
          </div>
        </div>

        {/* Cat overlapping everything */}
        <img src={lyingCatImg} alt="" className="starting-cat" />
      </div>

      {/* Countdown */}
      <div className="starting-countdown">
        <span className="starting-label">Starting in</span>
        <span className="starting-number">{count}</span>
      </div>
    </div>
  );
}
