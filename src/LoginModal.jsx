import { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ onClose, onLogin, isLoading }) {
  const [formData, setFormData] = useState({
    phone: '+971'
  });

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
        {/* <h2 className="login-title">Login to Play</h2> */}
        <p className="login-subtitle">Enter your phone number to continue.</p>

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

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <span className="btn-loader" /> : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}
