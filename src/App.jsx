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
import UploadScreen from './UploadScreen';
import { getLevelForXP } from './game/levels';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

function loadProgress() {
  try {
    const raw = localStorage.getItem('tap-to-purr-progress');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { totalXP: 0, videosCount: 0, activities: [] };
}

function saveProgress(data) {
  try {
    localStorage.setItem('tap-to-purr-progress', JSON.stringify(data));
  } catch { /* ignore */ }
}

function loadUserData() {
  try {
    const raw = localStorage.getItem('tap-to-purr-user');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { fullName: '', email: '', phone: '' };
}

function saveUserData(data) {
  try {
    localStorage.setItem('tap-to-purr-user', JSON.stringify(data));
  } catch { /* ignore */ }
}

// Reset progress function - call this before building for client
// You can call window.resetWhiskusProgress() in browser console
if (typeof window !== 'undefined') {
  window.resetWhiskusProgress = function () {
    localStorage.removeItem('tap-to-purr-progress');
    window.location.reload();
  };
}

function App() {
  const [screen, setScreen] = useState('splash');
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [userData, setUserData] = useState(loadUserData);
  const [sessionScore, setSessionScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Initialize Supabase session and fetch profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProgress({ totalXP: 0, videosCount: 0, activities: [] });
        setUserData({ fullName: '', email: '', phone: '' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setProgress({
          totalXP: data.total_xp || 0,
          videosCount: data.videos_count || 0,
          activities: data.activities || []
        });
        setUserData({
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const updateProfile = async (updates) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const playerLevel = getLevelForXP(progress.totalXP);

  const handlePlayClick = useCallback(() => {
    if (session) {
      setScreen('starting');
    } else {
      setShowLoginModal(true);
    }
  }, [session]);

  const handleSignupClick = useCallback(() => {
    setScreen('signup');
  }, []);

  const handleSignup = useCallback(async (formData) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            cat_name: formData.catName
          }
        }
      });

      if (error) throw error;

      alert('Signup successful! Your account is ready.');
      setScreen('home');
      setShowLoginModal(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (formData) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      setShowLoginModal(false);
      setScreen('starting');
    } catch (err) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setScreen('home');
    } catch (err) {
      alert(err.message);
    }
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
    setShowGameOverModal(false);
    setScreen('game');
  }, []);

  const handleEndGame = useCallback((score) => {
    const newXP = progress.totalXP + score;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newActivity = {
      text: `You earned ${score} points playing midnight paws`,
      date: dateStr
    };
    const activities = progress.activities || [];
    const updated = {
      totalXP: newXP,
      videosCount: progress.videosCount || 0,
      activities: [newActivity, ...activities].slice(0, 10)
    };
    setProgress(updated);
    saveProgress(updated);
    setSessionScore(score);

    // Sync to Supabase
    updateProfile({
      total_xp: updated.totalXP,
      activities: updated.activities
    });
  }, [progress, session, updateProfile]);

  const handleShowGameOver = useCallback((score) => {
    handleEndGame(score);
    setShowGameOverModal(true);
  }, [handleEndGame]);

  const handleGoHome = useCallback(() => {
    // Reload progress to ensure we have the latest data
    const latestProgress = loadProgress();
    setProgress(latestProgress);
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
    // Reload progress to ensure we have the latest data
    const latestProgress = loadProgress();
    setProgress(latestProgress);
    setScreen('levels');
  }, []);

  const handleResetProgress = useCallback(async () => {
    if (window.confirm('Reset all progress? This will set XP to 0 and cannot be undone.')) {
      localStorage.removeItem('tap-to-purr-progress');
      const resetProgress = { totalXP: 0, videosCount: 0, activities: [] };
      setProgress(resetProgress);
      setGameKey(prev => prev + 1);

      if (session?.user) {
        await updateProfile({
          total_xp: 0,
          videos_count: 0,
          activities: []
        });
      }
    }
  }, [session, updateProfile]);

  const handleGoToUpload = useCallback(() => {
    setScreen('upload');
  }, []);

  const handleVideoUpload = useCallback(() => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newActivity = {
      text: 'You uploaded a video',
      date: dateStr
    };
    const activities = progress.activities || [];
    const updated = {
      ...progress,
      videosCount: (progress.videosCount || 0) + 1,
      activities: [newActivity, ...activities].slice(0, 10)
    };
    setProgress(updated);
    saveProgress(updated);

    // Sync to Supabase
    updateProfile({
      videos_count: updated.videosCount,
      activities: updated.activities
    });
  }, [progress, session, updateProfile]);

  if (screen === 'splash') {
    return <SplashScreen onLoadingComplete={handleSplashComplete} />;
  }

  if (screen === 'signup') {
    return <SignupScreen onSignup={handleSignup} onGoHome={handleGoHome} isLoading={authLoading} />;
  }

  if (screen === 'starting') {
    return <StartingScreen levelName="Midnight Paws" onCountdownComplete={handleCountdownComplete} />;
  }

  if (screen === 'game') {
    return (
      <>
        <Game
          key={`game-${progress.totalXP}-${gameKey}`}
          playerLevel={playerLevel}
          totalXP={progress.totalXP}
          onEnd={handleEndGame}
          onRestart={handleStartGame}
          onShowGameOver={handleShowGameOver}
        />
        {showGameOverModal && (
          <GameOver
            score={sessionScore}
            onPlayAgain={() => {
              setShowGameOverModal(false);
              handleStartGame();
            }}
            onGoHome={() => {
              setShowGameOverModal(false);
              handleGoHome();
            }}
            onUnlockThemes={() => {
              setShowGameOverModal(false);
              handleUnlockThemes();
            }}
          />
        )}
      </>
    );
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
        videosCount={progress.videosCount || 0}
        activities={progress.activities || []}
        userData={userData}
        onStartGame={handleStartGame}
        onGoBack={handleGoHome}
        onVideoUpload={handleGoToUpload}
      />
    );
  }

  if (screen === 'upload') {
    return (
      <UploadScreen
        onGoHome={handleGoHome}
        onUpload={handleVideoUpload}
      />
    );
  }

  return (
    <>
      <Home
        onStartGame={handlePlayClick}
        onResetProgress={handleResetProgress}
        onLogout={session ? handleLogout : null}
        user={session?.user}
      />
      {showModal && <HowToPlayModal onClose={handleCloseModal} />}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLoginModal}
          onLogin={handleLogin}
          onSignup={handleSignupClick}
          isLoading={authLoading}
        />
      )}
    </>
  );
}

export default App;
