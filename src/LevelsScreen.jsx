import { useState } from 'react';
import './LevelsScreen.css';
import logoImg from './assets/logo.png';
import dollarImg from './assets/dollar.png';
import gameImg from './assets/game.png';
import backgroundImg from './assets/background.png';
import cloudsImg from './assets/clouds.png';

export default function LevelsScreen({
  totalXP = 0,
  videosCount = 0,
  activities = [],
  userData = {},
  onStartGame,
  onGoBack,
  onVideoUpload
}) {
  const [selectedTheme, setSelectedTheme] = useState('midnight');

  const handleThemeSelect = (theme) => {
    if (theme === 'midnight') {
      setSelectedTheme(theme);
      onStartGame?.();
    }
  };

  return (
    <div className="levels">
      <img src={backgroundImg} alt="" className="levels-background" />
      <img src={cloudsImg} alt="" className="levels-clouds-decoration" />
      {/* Header */}
      <div className="levels-header">
        <button className="levels-home-btn" onClick={onGoBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <img src={logoImg} alt="Whiskas" className="levels-logo" />
        <div className="levels-profile-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div className="levels-content">
        {/* User Profile */}
        <div className="levels-user-section">
          <h1 className="levels-user-name">{userData.fullName || 'Stella Metthew'}</h1>
          <div className="levels-user-info">
            <span>{userData.email || 'stella@gmail.com'}</span>
            <span>{userData.phone || '052 2785545'}</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="levels-stats">
          <div className="levels-stat-card">
            <img src={dollarImg} alt="" className="levels-stat-img" />
            <div className="levels-stat-content">
              <span className="levels-stat-label">Points Earned</span>
              <span className="levels-stat-value">{totalXP.toLocaleString() || '15000'}</span>
            </div>
          </div>
          <div className="levels-stat-column">
            <div className="levels-stat-video-card">
              <img src={gameImg} alt="" className="levels-stat-img" />
              <div className="levels-stat-content">
                <span className="levels-stat-label">Videos uploaded</span>
                <span className="levels-stat-value">{String(videosCount || 2).padStart(2, '0')}</span>
              </div>
            </div>
            <button className="levels-upload-btn" onClick={onVideoUpload}>
              Upload Video
            </button>
          </div>
        </div>

        {/* Select Theme Section */}
        <div className="levels-theme-section">
          <h2 className="levels-section-title">Select theme</h2>
          <div className="levels-theme-cards">
            <div
              className={`levels-theme-card levels-theme-midnight ${selectedTheme === 'midnight' ? 'levels-theme-selected' : ''}`}
              onClick={() => handleThemeSelect('midnight')}
            >
              <div className="levels-theme-overlay">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div className="levels-theme-footer">
                <span className="levels-theme-name">Midnight Paws</span>
              </div>
            </div>
            <div className="levels-theme-card levels-theme-locked">
              <div className="levels-theme-overlay">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <div className="levels-theme-footer">
                <span className="levels-theme-name">Purrlight Valley</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Activity Section */}
        <div className="levels-activity-section">
          <h2 className="levels-activity-title">My Activity</h2>
          <div className="levels-activity-list">
            {(activities.length > 0 ? activities : [
              { text: "You earned 4500 points playing midnight paws", date: "29/01/2026" },
              { text: "You earned 4500 points playing midnight paws", date: "29/01/2026" },
              { text: "You earned 4500 points playing midnight paws", date: "29/01/2026" },
              { text: "You earned 4500 points playing midnight paws", date: "29/01/2026" }
            ]).map((activity, index) => (
              <div key={index} className="levels-activity-item">
                <div className="levels-activity-icon">
                  <img src={gameImg} alt="" className="levels-activity-img" />
                </div>
                <span className="levels-activity-text">{activity.text}</span>
                <span className="levels-activity-date">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

