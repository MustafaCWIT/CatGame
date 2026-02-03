import { useState, useEffect } from 'react';
import './SplashScreen.css';
import logoImg from './assets/logo.png';
import catImg from './assets/cat.png';
import nameImg from './assets/name.png';
import fishImg from './assets/fish.png';
import bowlImg from './assets/bowl.png';
import cloudsImg from './assets/clouds.png';
import backgroundImg from './assets/background.png';

export default function SplashScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Wait a bit before transitioning
      const timeout = setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 500);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress, onLoadingComplete]);

  return (
    <div className={`splash-screen ${isLoaded ? 'splash-fade-out' : ''}`}>
      <img src={backgroundImg} alt="" className="splash-background" />

      {/* Clouds */}
      <img src={cloudsImg} alt="" className="splash-clouds splash-clouds-left" />
      <img src={cloudsImg} alt="" className="splash-clouds splash-clouds-right" />

      {/* Logo */}
      <img src={logoImg} alt="Whiskas" className="splash-logo" />

      {/* Fish */}
      <img src={fishImg} alt="" className="splash-fish" />

      {/* Main content */}
      <div className="splash-content">
        {/* Title */}
        <h1 className="splash-title">Tap To Purr</h1>

        {/* Cat */}
        <img src={catImg} alt="Cat" className="splash-cat" />

        {/* Name/Purradise */}
        <img src={nameImg} alt="Purradise" className="splash-name" />

        {/* Loader */}
        <div className="splash-loader-container">
          <div className="splash-loader">
            <div className="splash-loader-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="splash-loader-text">{progress}%</span>
        </div>
      </div>

      {/* Bowl */}
      <img src={bowlImg} alt="" className="splash-bowl" />
    </div>
  );
}
