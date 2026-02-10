import { useState, useEffect } from 'react';
import './ThankYouScreen.css';
import backgroundImg from './assets/background.png';
import logoImg from './assets/logo.png';
import catImg from './assets/cat.png';

const ASSETS = [backgroundImg, logoImg, catImg];

export default function ThankYouScreen({ onGoHome, onProfileClick }) {
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

  if (!isReady) return <div className="thankyou loading" style={{ background: '#9C27B0', height: '100vh', width: '100vw' }} />;

  return (
    <div className="thankyou-screen">
      <img src={backgroundImg} alt="" className="thankyou-background" />

      {/* Header */}
      <div className="thankyou-header">
        <button className="thankyou-home-btn" onClick={onGoHome}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <img src={logoImg} alt="Whiskas" className="thankyou-logo" />
        <div className="thankyou-profile-btn" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div className="thankyou-content">
        {/* Cat Image */}
        <img src={catImg} alt="Cat" className="thankyou-cat" />

        {/* Thank You Text */}
        <h1 className="thankyou-title">Thank you</h1>
        <p className="thankyou-message">
          Your submission is successfull. We will reach out to you if you are one the winners.
        </p>

        {/* Action Buttons */}
        <div className="thankyou-actions">
          <button className="thankyou-btn" onClick={onGoHome}>
            Home Screen
          </button>
          <button className="thankyou-btn" onClick={onProfileClick}>
            My Profile
          </button>
        </div>
      </div>
    </div>
  );
}

