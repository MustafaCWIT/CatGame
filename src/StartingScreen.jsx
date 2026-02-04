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
    if (count < 3) {
      const timer = setTimeout(() => setCount(count + 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 3) {
      // Start game when count reaches 3 (show 3 briefly then start)
      const timer = setTimeout(() => {
        onCountdownComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onCountdownComplete]);

  return (
    <div className="starting-screen">
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
