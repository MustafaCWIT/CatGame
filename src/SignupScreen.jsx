import { useState, useEffect } from 'react';
import './SignupScreen.css';
import { ALL_ASSETS, GAME_ASSETS } from './game/assets';

const {
  logo: logoImg,
  background: backgroundImg,
  signUpCloud: signUpCloudImg
} = GAME_ASSETS;

const ASSETS = ALL_ASSETS;

export default function SignupScreen({ onSignup, onGoHome, isLoading }) {
  const [formData, setFormData] = useState({
    phone: '+971'
  });
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

  if (!isReady) return <div className="signup loading" style={{ background: '#9C27B0', height: '100vh', width: '100vw' }} />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      // Phone already includes the prefix in a single field
      onSignup(formData);
    }
  };

  return (
    <div className="signup-screen">
      <img src={backgroundImg} alt="" className="signup-background" />

      {/* Cloud at bottom */}
      <img src={signUpCloudImg} alt="" className="signup-cloud" />

      {/* Home button */}
      <button className="signup-home" onClick={onGoHome} disabled={isLoading}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </button>

      {/* Profile icon */}
      <div className="signup-profile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      <div className="signup-content">
        {/* Logo */}
        <img src={logoImg} alt="Whiskas" className="signup-logo" />

        {/* Title */}
        <h1 className="signup-title">Signup to play</h1>
        <p className="signup-subtitle">Enter your phone number to continue.</p>

        {/* Form */}
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (e.g., +971XXXXXXXXX)"
            value={formData.phone}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={isLoading}
          />

          <button type="submit" className="signup-btn" disabled={isLoading}>
            {isLoading ? <span className="btn-loader" /> : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
