import { useState, useEffect } from 'react';
import './StartingScreen.css';
import backgroundImg from './assets/background.png';
import gameBackgroundImg from './assets/gameBackground.png';
import lyingCatImg from './assets/lyingCat.png';
import fishImg from './assets/fish.png';
import bowlImg from './assets/bowl.png';
import starImg from './assets/star.png';

export default function StartingScreen({ levelName, onCountdownComplete }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (count < 4) {
      const timer = setTimeout(() => setCount(count + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div className="starting-screen">
      <img src={backgroundImg} alt="" className="starting-background" />

      {/* Close button */}
      <button className="starting-close" onClick={onCountdownComplete}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

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
