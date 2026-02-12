import { useState, useEffect } from 'react';
import './SignupScreen.css';
import { ALL_ASSETS, GAME_ASSETS } from './game/assets';

const {
  logo: logoImg,
  background: backgroundImg,
  signUpCloud: signUpCloudImg
} = GAME_ASSETS;

const ASSETS = ALL_ASSETS;

// Common country codes
const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'AU' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'SA' },
  { code: '+974', country: 'QA' },
  { code: '+965', country: 'KW' },
  { code: '+973', country: 'BH' },
  { code: '+968', country: 'OM' },
  { code: '+961', country: 'LB' },
  { code: '+962', country: 'JO' },
  { code: '+20', country: 'EG' },
  { code: '+91', country: 'IN' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+82', country: 'KR' },
  { code: '+33', country: 'FR' },
  { code: '+49', country: 'DE' },
  { code: '+39', country: 'IT' },
  { code: '+34', country: 'ES' },
  { code: '+31', country: 'NL' },
  { code: '+32', country: 'BE' },
  { code: '+41', country: 'CH' },
  { code: '+46', country: 'SE' },
  { code: '+47', country: 'NO' },
  { code: '+45', country: 'DK' },
  { code: '+358', country: 'FI' },
  { code: '+351', country: 'PT' },
  { code: '+353', country: 'IE' },
  { code: '+48', country: 'PL' },
  { code: '+7', country: 'RU' },
  { code: '+90', country: 'TR' },
  { code: '+27', country: 'ZA' },
  { code: '+55', country: 'BR' },
  { code: '+52', country: 'MX' },
  { code: '+54', country: 'AR' },
  { code: '+65', country: 'SG' },
  { code: '+60', country: 'MY' },
  { code: '+66', country: 'TH' },
  { code: '+84', country: 'VN' },
  { code: '+62', country: 'ID' },
  { code: '+63', country: 'PH' },
];

export default function SignupScreen({ onSignup, onGoHome, isLoading }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    catName: ''
  });
  const [countryCode, setCountryCode] = useState('+971'); 
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
      // Combine country code with phone number
      const phoneWithCode = countryCode + formData.phone;
      onSignup({ ...formData, phone: phoneWithCode });
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
          <div className="signup-phone-wrapper">
            <select
              className="signup-phone-code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              disabled={isLoading}
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="signup-input signup-phone-input"
              required
              disabled={isLoading}
            />
          </div>
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
            {isLoading ? <span className="btn-loader" /> : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
