import { useState, useEffect } from 'react';
import './SignupScreen.css';
import logoImg from './assets/logo.png';
import backgroundImg from './assets/background.png';
import signUpCloudImg from './assets/signUpCloud.png';

const ASSETS = [logoImg, backgroundImg, signUpCloudImg];

export default function SignupScreen({ onSignup, onGoHome, isLoading }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    catName: ''
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
    if (!isLoading) onSignup(formData);
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
        <p className="signup-subtitle">Please fill out the information below.</p>

        {/* Form */}
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={isLoading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={isLoading}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={isLoading}
          />
          <input
            type="text"
            name="catName"
            placeholder="Your Cat Name"
            value={formData.catName}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={isLoading}
          />

          <button type="submit" className="signup-btn" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
