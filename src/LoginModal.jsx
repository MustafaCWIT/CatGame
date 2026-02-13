import { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ onClose, onLogin, isLoading }) {
  const [formData, setFormData] = useState({
    phone: '+971',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) onLogin(formData);
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        {/* Close button */}
        <button className="login-close" onClick={onClose} disabled={isLoading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="login-title">Login to Play</h2>
        <p className="login-subtitle">Please fill out the information below.</p>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (e.g., +971XXXXXXXXX)"
            value={formData.phone}
            onChange={handleChange}
            className="login-input"
            required
            disabled={isLoading}
          />
          <div className="login-password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword(prev => !prev)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <span className="btn-loader" /> : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}
