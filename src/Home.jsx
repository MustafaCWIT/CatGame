import { useRef, useState, useEffect } from 'react';
import './Home.css';
import { ALL_ASSETS, GAME_ASSETS } from './game/assets';

const {
  background: backgroundImg,
  logo: logoImg,
  cat: catImg,
  fish: fishImg,
  clearClouds: cloudsImg,
  sleepCat: sleepCatImg,
  foodBox: foodBoxImg
} = GAME_ASSETS;

const ASSETS = ALL_ASSETS;

export default function Home({ onStartGame, onResetProgress, onLogout, user, onProfileClick, onGoToUpload }) {
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
    // Safety
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return <div className="home loading" style={{ background: '#9C27B0', height: '100vh', width: '100vw' }} />;


  return (
    <div className="home">
      <img src={backgroundImg} alt="" className="home-background" />

      {/* Fish at top left */}
      <img src={fishImg} alt="" className="home-fish" />

      {/* Cloud at top right */}
      <img src={cloudsImg} alt="" className="home-cloud" />

      {/* Profile icon at top right */}
      <div className="home-profile" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      {/* Reset XP button */}
      {onResetProgress && (
        <button className="home-reset-btn" onClick={onResetProgress} title="Reset XP">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
          </svg>
        </button>
      )}


      <div className="home-content">
        {/* Logo */}
        <img src={logoImg} alt="Whiskas" className="home-logo" />

        {/* Title and Cat in same row */}
        <div className="home-hero">
          <h1 className="home-title">Tap To Purr</h1>
          <div className="home-cat-container">
            <div className="home-cat-circle"></div>
            <img src={catImg} alt="Cat" className="home-cat" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="home-buttons">
          <div className="home-btn-wrapper">
            <div className="home-step-tag">STEP 1</div>
            <button className="home-btn home-btn-play" onClick={onStartGame}>
              Play Tap-To-Purr
            </button>
          </div>
          <div className="home-btn-wrapper">
            <div className="home-step-tag">STEP 2</div>
            <button className="home-btn home-btn-upload" onClick={onGoToUpload}>
              Upload Cat Video & Win
            </button>
          </div>
        </div>


        {/* Participate section */}
        <div className="home-participate">
          <h2 className="home-participate-title">Participate and win</h2>
          <div className="home-prize-buttons">
            <button className="home-prize-btn home-prize-btn-left">
              <img src={sleepCatImg} alt="" className="home-prize-img home-prize-img-left" />
              <div className="home-prize-text">
                <span>Purradise</span>
                <span>Reset Day</span>
              </div>
            </button>
            <button className="home-prize-btn home-prize-btn-right">
              <div className="home-prize-text">
                <span>A Year of Whiskas</span>
                <span>Wet & Dry Food</span>
              </div>
              <img src={foodBoxImg} alt="" className="home-prize-img home-prize-img-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
