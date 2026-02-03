import './GameOver.css';
import catViewingImg from './assets/catViewing.png';
import gameBackgroundImg from './assets/gameBackground.png';
import dollarImg from './assets/dollar.png';

export default function GameOver({ score, onPlayAgain, onGoHome, onUnlockThemes }) {
  return (
    <div className="go-page">
      <img src={gameBackgroundImg} alt="" className="go-background" />

      <div className="go-modal-container">
        {/* Cat peeking from top */}
        <img src={catViewingImg} alt="Cat" className="go-cat" />

        <div className="go-modal">
          {/* Dollar icon */}
          <img src={dollarImg} alt="Dollar" className="go-dollar" />

          {/* Score text */}
          <p className="go-label">You have got</p>
          <h1 className="go-score">+{score.toLocaleString()}</h1>

          {/* Action buttons */}
          <div className="go-actions">
            <button className="go-btn go-btn-play" onClick={onPlayAgain}>
              Play Again
            </button>
            <button className="go-btn go-btn-end" onClick={onGoHome}>
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <button className="go-unlock-btn" onClick={onUnlockThemes}>
        Unlock More Themes
      </button>
    </div>
  );
}
