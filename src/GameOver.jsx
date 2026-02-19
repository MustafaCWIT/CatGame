import { useState, useEffect } from 'react';
import './GameOver.css';
import catViewingImg from './assets/catViewing.png';
import dollarImg from './assets/dollar.png';
import gameBackgroundImg from './assets/gameBackground.png';
import { useLanguage } from './i18n/LanguageContext';

const ASSETS = [catViewingImg, dollarImg, gameBackgroundImg];

export default function GameOver({ score, onPlayAgain, onGoHome, onUnlockThemes, onProfileClick, isPaused, onGoToUpload }) {
  const { t, language } = useLanguage();
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
        <div className="go-profile-btn" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
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
          <p className="go-label">{t('gameover_label')}</p>
          <h1 className="go-score">+{score.toLocaleString(language === 'ar' ? 'ar-EG' : undefined)}</h1>

          {/* Action buttons */}
          <div className="go-actions">
            <button className="go-btn go-btn-play" onClick={onPlayAgain}>
              {isPaused ? t('gameover_resume') : t('gameover_play_again')}
            </button>
            <button className="go-btn go-btn-end" onClick={onUnlockThemes}>
              {t('gameover_end')}
            </button>
          </div>
        </div>

        {/* Bottom button moved inside container */}
        <button className="go-unlock-btn" onClick={onGoToUpload || onUnlockThemes}>
          {t('gameover_upload')}
        </button>
      </div>
    </div>
  );
}
