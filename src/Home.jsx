import { useRef, useState } from 'react';
import './Home.css';
import backgroundImg from './assets/background.png';
import logoImg from './assets/logo.png';
import catImg from './assets/cat.png';
import fishImg from './assets/fish.png';
import cloudsImg from './assets/clouds.png';
import sleepCatImg from './assets/sleepCat.png';
import foodBoxImg from './assets/foodBox.png';

export default function Home({ onStartGame }) {
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
      <img src={backgroundImg} alt="" className="home-background" />

      {/* Fish at top left */}
      <img src={fishImg} alt="" className="home-fish" />

      {/* Cloud at top right */}
      <img src={cloudsImg} alt="" className="home-cloud" />

      {/* Profile icon at top right */}
      <div className="home-profile">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>

      <div className="home-content">
        {/* Logo */}
        <img src={logoImg} alt="Whiskas" className="home-logo" />

        {/* Title */}
        <h1 className="home-title">Tap To Purr</h1>

        {/* Cat with blue circle */}
        <div className="home-cat-container">
          <div className="home-cat-circle"></div>
          <img src={catImg} alt="Cat" className="home-cat" />
        </div>

        {/* Action buttons */}
        <div className="home-buttons">
          <button className="home-btn home-btn-play" onClick={onStartGame}>
            Play Tap-To-Purr
          </button>
          <button className="home-btn home-btn-upload" onClick={() => fileInputRef.current?.click()}>
            Upload Cat Video
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

        {/* Participate section */}
        <div className="home-participate">
          <h2 className="home-participate-title">Participate and win</h2>
          <div className="home-prize-buttons">
            <button className="home-prize-btn">
              <div className="home-prize-text">
                <span>Purradise</span>
                <span>Reset Day</span>
              </div>
              <img src={sleepCatImg} alt="" className="home-prize-img home-prize-img-left" />
            </button>
            <button className="home-prize-btn">
              <div className="home-prize-text">
                <span>A Year of Whiskas</span>
                <span>Wet & Dry Food</span>
              </div>
              <img src={foodBoxImg} alt="" className="home-prize-img home-prize-img-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
