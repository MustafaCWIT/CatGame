import { useRef, useState } from 'react';
import './Home.css';
import { LEVELS, getNextLevelXP } from './game/levels';

export default function Home({ onStartGame, playerLevel = 0, totalXP = 0 }) {
  const fileInputRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [videoName, setVideoName] = useState('');

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoName(file.name);
    setVideo(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    if (video) URL.revokeObjectURL(video);
    setVideo(null);
    setVideoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="home">
      <div className="home-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="home-content">
        {/* Header */}
        <div className="home-header">
          <div className="home-logo">
            <span className="home-logo-icon">🐾</span>
          </div>
          <h1 className="home-title">Whiskus</h1>
          <p className="home-subtitle">A magical interactive game designed for cats</p>
        </div>

        {/* Action cards */}
        <div className="home-cards">
          <button className="card card-play" onClick={onStartGame}>
            <div className="card-icon-wrap card-icon-play">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="currentColor"/>
              </svg>
            </div>
            <div className="card-text">
              <span className="card-label">Start Game</span>
              <span className="card-desc">Place tablet on the floor and let your cat play</span>
            </div>
            <svg className="card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="card card-upload" onClick={() => fileInputRef.current?.click()}>
            <div className="card-icon-wrap card-icon-upload">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M15 10l-4-4-4 4M11 6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="card-text">
              <span className="card-label">Upload Video</span>
              <span className="card-desc">Share a recording of your cat playing</span>
            </div>
            <svg className="card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden-input"
            onChange={handleUpload}
          />
        </div>

        {/* Video preview */}
        {video && (
          <div className="video-preview">
            <div className="video-header">
              <span className="video-name">{videoName}</span>
              <button className="video-remove" onClick={handleRemoveVideo}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <video src={video} controls className="video-player" playsInline />
          </div>
        )}

        {/* Player level badge */}
        <div className="home-level-badge">
          <div className="home-level-info">
            <span className="home-level-label">Level {playerLevel + 1}</span>
            <span className="home-level-name">{LEVELS[playerLevel].name}</span>
          </div>
          {(() => {
            const nextXP = getNextLevelXP(playerLevel);
            if (!nextXP) return <span className="home-level-max">MAX</span>;
            const currentXP = LEVELS[playerLevel].xpRequired;
            const progress = Math.min(1, (totalXP - currentXP) / (nextXP - currentXP));
            return (
              <div className="home-level-bar-wrap">
                <div className="home-level-bar">
                  <div className="home-level-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <span className="home-level-xp">{totalXP} / {nextXP} XP</span>
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}
