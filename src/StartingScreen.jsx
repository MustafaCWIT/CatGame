import { useState, useEffect } from 'react';
import './StartingScreen.css';
import { ALL_ASSETS, GAME_ASSETS } from './game/assets';
import { useLanguage } from './i18n/LanguageContext';

const {
  background: backgroundImg,
  gameBackground: gameBackgroundImg,
  lyingCat: lyingCatImg,
  fish: fishImg,
  bowl: bowlImg,
  star: starImg,
  gameScore: gameScoreImg,
  gameTime: gameTimeImg
} = GAME_ASSETS;

const ASSETS_TO_PRELOAD = ALL_ASSETS;

export default function StartingScreen({ levelName, onCountdownComplete, onProfileClick, onGoHome }) {
  const { t } = useLanguage();
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
    }, 12000);

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
      // Temporarily disabled - prevent auto-navigation on countdown completion
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
        <div className="starting-loader-text">{t('starting_loading')}</div>
      </div>
    );
  }

  return (
    <div className="starting-screen fade-in">
      <img src={backgroundImg} alt="" className="starting-background" />

      {/* Top Navigation */}
      <div className="starting-nav">
        <button className="starting-home-btn" onClick={onGoHome}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <div className="starting-profile" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      {/* Level name */}
      <h1 className="starting-title">{levelName || t('starting_level_midnight')}</h1>

      {/* Game preview wrapper with Tablet Frame */}
      <div className="starting-preview-wrapper">
        <div className="starting-tablet-frame">
          <div className="starting-tablet-bezel">
            {/* Game preview */}
            <div className="starting-preview">
              <img src={gameBackgroundImg} alt="" className="starting-game-bg" />

              {/* In-game UI pills */}
              <div className="preview-ui-top">
                <img src={gameScoreImg} alt="Score" className="starting-score-img" />
                <img src={gameTimeImg} alt="Time" className="starting-time-img" />
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
        <span className="starting-label">{t('starting_label')}</span>
        <span className="starting-number">{count}</span>
      </div>
    </div>
  );
}
