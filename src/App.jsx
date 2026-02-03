import { useState, useCallback } from 'react';
import SplashScreen from './SplashScreen';
import HowToPlayModal from './HowToPlayModal';
import LoginModal from './LoginModal';
import Home from './Home';
import SignupScreen from './SignupScreen';
import Game from './game/Game';
import GameOver from './GameOver';
import { getLevelForXP } from './game/levels';

function loadProgress() {
  try {
    const raw = localStorage.getItem('tap-to-purr-progress');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { totalXP: 0 };
}

function saveProgress(data) {
  try {
    localStorage.setItem('tap-to-purr-progress', JSON.stringify(data));
  } catch { /* ignore */ }
}

// Reset progress function - call this before building for client
// You can call window.resetWhiskusProgress() in browser console
if (typeof window !== 'undefined') {
  window.resetWhiskusProgress = function() {
    localStorage.removeItem('tap-to-purr-progress');
    window.location.reload();
  };
}

function App() {
  const [screen, setScreen] = useState('splash');
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [sessionScore, setSessionScore] = useState(0);
  const [prevLevel, setPrevLevel] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const playerLevel = getLevelForXP(progress.totalXP);

  const handlePlayClick = useCallback(() => {
    setScreen('signup');
  }, []);

  const handleSignup = useCallback(() => {
    // After signup, go back to home and show login modal
    setScreen('home');
    setShowLoginModal(true);
  }, []);

  const handleLogin = useCallback(() => {
    setShowLoginModal(false);
    const latestProgress = loadProgress();
    setProgress(latestProgress);
    setGameKey(prev => prev + 1);
    setScreen('game');
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleStartGame = useCallback(() => {
    // Reload progress to ensure we have the latest level
    const latestProgress = loadProgress();
    setProgress(latestProgress);
    setGameKey(prev => prev + 1); // Force remount with updated props
    setScreen('game');
  }, []);

  const handleEndGame = useCallback((score) => {
    const oldLevel = getLevelForXP(progress.totalXP);
    const newXP = progress.totalXP + score;
    const updated = { totalXP: newXP };
    setProgress(updated);
    saveProgress(updated);
    setSessionScore(score);
    setPrevLevel(oldLevel);
    setScreen('gameover');
  }, [progress]);

  const handleGoHome = useCallback(() => {
    setScreen('home');
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowModal(true);
    setScreen('home');
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleResetProgress = useCallback(() => {
    if (window.confirm('Reset all progress? This will set XP to 0 and cannot be undone.')) {
      localStorage.removeItem('tap-to-purr-progress');
      const resetProgress = { totalXP: 0 };
      setProgress(resetProgress);
      setGameKey(prev => prev + 1);
    }
  }, []);

  if (screen === 'splash') {
    return <SplashScreen onLoadingComplete={handleSplashComplete} />;
  }

  if (screen === 'signup') {
    return <SignupScreen onSignup={handleSignup} onGoHome={handleGoHome} />;
  }

  if (screen === 'game') {
    return <Game key={`game-${progress.totalXP}-${gameKey}`} playerLevel={playerLevel} totalXP={progress.totalXP} onEnd={handleEndGame} onRestart={handleStartGame} />;
  }

  if (screen === 'gameover') {
    const newLevel = getLevelForXP(progress.totalXP);
    return (
      <GameOver
        score={sessionScore}
        totalXP={progress.totalXP}
        prevLevel={prevLevel}
        newLevel={newLevel}
        onPlayAgain={handleStartGame}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <>
      <Home onStartGame={handlePlayClick} playerLevel={playerLevel} totalXP={progress.totalXP} onResetProgress={handleResetProgress} />
      {showModal && <HowToPlayModal onClose={handleCloseModal} />}
      {showLoginModal && <LoginModal onClose={handleCloseLoginModal} onLogin={handleLogin} />}
    </>
  );
}

export default App;
