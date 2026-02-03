import { useState, useCallback } from 'react';
import SplashScreen from './SplashScreen';
import HowToPlayModal from './HowToPlayModal';
import LoginModal from './LoginModal';
import Home from './Home';
import SignupScreen from './SignupScreen';
import StartingScreen from './StartingScreen';
import Game from './game/Game';
import GameOver from './GameOver';
import LevelsScreen from './LevelsScreen';
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
    setScreen('starting');
  }, []);

  const handleCountdownComplete = useCallback(() => {
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
    const newXP = progress.totalXP + score;
    const updated = { totalXP: newXP };
    setProgress(updated);
    saveProgress(updated);
    setSessionScore(score);
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

  const handleUnlockThemes = useCallback(() => {
    setScreen('levels');
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

  if (screen === 'starting') {
    return <StartingScreen levelName="Midnight Paws" onCountdownComplete={handleCountdownComplete} />;
  }

  if (screen === 'game') {
    return <Game key={`game-${progress.totalXP}-${gameKey}`} playerLevel={playerLevel} totalXP={progress.totalXP} onEnd={handleEndGame} onRestart={handleStartGame} />;
  }

  if (screen === 'gameover') {
    return (
      <GameOver
        score={sessionScore}
        onPlayAgain={handleStartGame}
        onGoHome={handleGoHome}
        onUnlockThemes={handleUnlockThemes}
      />
    );
  }

  if (screen === 'levels') {
    return (
      <LevelsScreen
        totalXP={progress.totalXP}
        onStartGame={handleStartGame}
        onGoBack={handleGoHome}
      />
    );
  }

  return (
    <>
      <Home onStartGame={handlePlayClick} onResetProgress={handleResetProgress} />
      {showModal && <HowToPlayModal onClose={handleCloseModal} />}
      {showLoginModal && <LoginModal onClose={handleCloseLoginModal} onLogin={handleLogin} />}
    </>
  );
}

export default App;
