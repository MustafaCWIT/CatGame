import { useState, useEffect } from 'react';
import './GameOver.css';
import catViewingImg from './assets/catViewing.png';
import dollarImg from './assets/dollar.png';
import gameBackgroundImg from './assets/gameBackground.png';

const ASSETS = [catViewingImg, dollarImg, gameBackgroundImg];

export default function GameOver({ score, onPlayAgain, onGoHome, onUnlockThemes, isPaused }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let loaded = 0;
    ASSETS.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === ASSETS.length) setIsReady(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === ASSETS.length) setIsReady(true);
      };
    });
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null; // Game Over is usually an overlay, so hide until ready
  return (
    <div className="go-page">
      <img src={gameBackgroundImg} alt="" className="go-background-blur" />

      {/* Header */}
      <div className="go-header">
        <button className="go-home-btn" onClick={onGoHome}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <div className="go-profile-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div className="go-modal-container">
        {/* Cat peeking from top */}
        <img src={catViewingImg} alt="Cat" className="go-cat" />

        <div className="go-modal">
          {/* Dollar icon */}
          <img src={dollarImg} alt="Dollar" className="go-dollar" />

          {/* Score text */}
          <p className="go-label">You have got</p>
          <h1 className="go-score">+{score.toLocaleString()}</h1>

          {/* Action buttons */}
          <div className="go-actions">
            <button className="go-btn go-btn-play" onClick={onPlayAgain}>
              {isPaused ? "Resume" : "Play Again"}
            </button>
            <button className="go-btn go-btn-end" onClick={onUnlockThemes}>
              End Game
            </button>
          </div>
        </div>

        {/* Bottom button moved inside container */}
        <button className="go-unlock-btn" onClick={onUnlockThemes}>
          Unlock More Themes
        </button>
      </div>
    </div>
  );
}
