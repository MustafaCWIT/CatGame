import { useState, useEffect, useRef } from 'react';
import './LevelsScreen.css';
import logoImg from './assets/logo.png';
import dollarImg from './assets/dollar.png';
import gameImg from './assets/game.png';
import backgroundImg from './assets/background.png';
import cloudsImg from './assets/clouds.png';
import { useLanguage } from './i18n/LanguageContext';

const ASSETS = [logoImg, dollarImg, gameImg, backgroundImg, cloudsImg];

export default function LevelsScreen({
  totalXP = 0,
  videosCount = 0,
  activities = [],
  userData = {},
  onStartGame,
  onGoBack,
  onVideoUpload,
  autoScrollToThemes = false,
  onLogout
}) {
  const { t } = useLanguage();
  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [isReady, setIsReady] = useState(false);
  const themeSectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isReady && autoScrollToThemes && themeSectionRef.current && contentRef.current) {
      const scrollTimer = setTimeout(() => {
        const container = contentRef.current;
        const target = themeSectionRef.current;

        // Calculate position relative to the main scroll container
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top;

        container.scrollTo({
          top: container.scrollTop + relativeTop + 100, // 100px extra to scroll deeper
          behavior: 'smooth'
        });
      }, 700);
      return () => clearTimeout(scrollTimer);
    }
  }, [isReady, autoScrollToThemes]);

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

  if (!isReady) return <div className="levels loading" style={{ background: '#9C27B0', height: '100vh', width: '100vw' }} />;

  const handleThemeSelect = (theme) => {
    if (theme === 'midnight') {
      setSelectedTheme(theme);
      onStartGame?.();
    }
  };

  return (
    <div className="levels" ref={contentRef}>
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
          <h1 className="levels-user-name">{userData.full_name || t('levels_player')}</h1>
          {userData.phone && <p className="levels-user-phone">{userData.phone}</p>}
        </div>

        {/* Stats Section */}
        <div className="levels-stats">
          <div className="levels-stat-card">
            <img src={dollarImg} alt="" className="levels-stat-img" />
            <div className="levels-stat-content">
              <span className="levels-stat-label">{t('levels_points')}</span>
              <span className="levels-stat-value">{totalXP.toLocaleString()}</span>
            </div>
          </div>
          <div className="levels-stat-column">
            <div className="levels-stat-video-card">
              <img src={gameImg} alt="" className="levels-stat-img" />
              <div className="levels-stat-content">
                <span className="levels-stat-label">{t('levels_videos')}</span>
                <span className="levels-stat-value">{String(videosCount).padStart(2, '0')}</span>
              </div>
            </div>
            <button className="levels-upload-btn" onClick={onVideoUpload}>
              {t('levels_upload_btn')}
            </button>
          </div>
        </div>

        {/* Select Theme Section */}
        <div className="levels-theme-section" ref={themeSectionRef}>
          <h2 className="levels-section-title">{t('levels_select_theme')}</h2>
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
                <span className="levels-theme-name">{t('levels_theme_midnight')}</span>
              </div>
            </div>
            <div className="levels-theme-card levels-theme-locked">
              <div className="levels-theme-overlay">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <div className="levels-theme-footer">
                <span className="levels-theme-name">{t('levels_theme_purrlight')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Activity Section */}
        <div className="levels-activity-section">
          <h2 className="levels-activity-title">{t('levels_activity_title')}</h2>
          <div className="levels-activity-list">
            {activities.length === 0 ? (
              <p className="levels-activity-empty">{t('levels_activity_empty')}</p>
            ) : activities.map((activity, index) => (
              <div key={index} className="levels-activity-item">
                <div className="levels-activity-icon">
                  <img src={gameImg} alt="" className="levels-activity-img" />
                </div>
                <span className="levels-activity-text">{activity.key ? t(activity.key, activity.params) : activity.text}</span>
                <span className="levels-activity-date">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout button */}
        {onLogout && (
          <div className="levels-logout-section">
            <button className="levels-logout-btn" onClick={onLogout}>
              {t('levels_logout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

