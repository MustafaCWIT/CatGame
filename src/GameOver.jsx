import './GameOver.css';
import { LEVELS, getNextLevelXP } from './game/levels';

export default function GameOver({ score, totalXP, prevLevel, newLevel, onPlayAgain, onGoHome }) {
  const didLevelUp = newLevel > prevLevel;
  const level = LEVELS[newLevel];
  const prevLevelData = LEVELS[prevLevel];
  const nextLevelXP = getNextLevelXP(newLevel);

  const currentLevelXP = LEVELS[newLevel].xpRequired;
  const xpProgress = nextLevelXP
    ? Math.min(1, (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP))
    : 1;

  const getMessage = () => {
    if (didLevelUp) return 'New world unlocked!';
    if (score === 0) return 'Maybe next time!';
    if (score < 10) return 'Curious paws!';
    if (score < 25) return 'Great session!';
    if (score < 45) return 'Super playful!';
    return 'Legendary hunter!';
  };

  return (
    <div className="go-page">
      <div className="go-bg">
        <div className="go-blob go-blob-1" />
        <div className="go-blob go-blob-2" />
        <div className="go-blob go-blob-3" />
      </div>

      <div className="go-container">
        {/* Level Up Banner */}
        {didLevelUp && (
          <div className="go-levelup">
            <div className="go-levelup-icon">🎉</div>
            <div className="go-levelup-title">Level Up!</div>
            <div className="go-levelup-transition">
              {prevLevelData.name} → {level.name}
            </div>
            <div className="go-levelup-sub">
              You unlocked Level {newLevel + 1}!
            </div>
          </div>
        )}

        {/* Trophy section */}
        <div className="go-trophy-section">
          <div className="go-trophy">🐾</div>
          <h1 className="go-heading">Session Complete</h1>
          <p className="go-message">{getMessage()}</p>
        </div>

        {/* Stats card */}
        <div className="go-card">
          <div className="go-card-row">
            <div className="go-stat">
              <div className="go-stat-number go-stat-purple">{score}</div>
              <div className="go-stat-label">Objects Collected</div>
            </div>
            <div className="go-stat-sep" />
            <div className="go-stat">
              <div className="go-stat-number go-stat-cyan">+{score}</div>
              <div className="go-stat-label">XP Earned</div>
            </div>
          </div>

          <div className="go-card-divider" />

          {/* XP progress bar */}
          <div className="go-xp-section">
            <div className="go-xp-header">
              <span className="go-xp-level">Level {newLevel + 1} — {level.name}</span>
              {nextLevelXP ? (
                <span className="go-xp-numbers">{totalXP} / {nextLevelXP} XP</span>
              ) : (
                <span className="go-xp-max">MAX LEVEL</span>
              )}
            </div>
            <div className="go-xp-bar">
              <div
                className={`go-xp-fill ${didLevelUp ? 'go-xp-fill-green' : ''}`}
                style={{ width: `${xpProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Level pips */}
          <div className="go-levels-row">
            {LEVELS.map((l, i) => (
              <div key={i} className={`go-level-pip ${i <= newLevel ? 'go-level-reached' : ''} ${i === newLevel ? 'go-level-current' : ''}`}>
                <div className="go-pip-dot" />
                <span className="go-pip-label">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total XP badge */}
        <div className="go-total-xp">
          Total XP: {totalXP}
        </div>

        {/* Actions */}
        <div className="go-actions">
          <button className="go-btn go-btn-primary" onClick={onPlayAgain}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="currentColor"/>
            </svg>
            Play Again
          </button>
          <button className="go-btn go-btn-secondary" onClick={onGoHome}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10v8a2 2 0 002 2h10a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
