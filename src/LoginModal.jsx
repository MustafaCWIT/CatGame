import { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ onClose, onLogin, onSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        {/* Close button */}
        <button className="login-close" onClick={onClose}>
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
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {/* Signup link */}
        <p className="login-signup-text">
          Don't have an account? <span className="login-signup-link" onClick={onSignup}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
