import { useState, useCallback, useRef } from 'react';
import SplashScreen from './SplashScreen';
import HowToPlayModal from './HowToPlayModal';
import LoginModal from './LoginModal';
import Home from './Home';
import StartingScreen from './StartingScreen';
import Game from './game/Game';
import GameOver from './GameOver';
import LevelsScreen from './LevelsScreen';
import UploadScreen from './UploadScreen';
import ThankYouScreen from './ThankYouScreen';
import { getLevelForXP } from './game/levels';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';
import { ALL_ASSETS } from './game/assets';

function AssetPreloader() {
  return (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0.01, pointerEvents: 'none', zIndex: -1 }}>
      {ALL_ASSETS.map((src, i) => (
        <img key={i} src={src} alt="" />
      ))}
    </div>
  );
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('tap-to-purr-progress');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { totalXP: 0, videosCount: 0, activities: [], gameTimeSpent: 0 };
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
  return { phone: '' };
}

function saveUserData(data) {
  try {
    localStorage.setItem('tap-to-purr-user', JSON.stringify(data));
  } catch { /* ignore */ }
}

function loadSession() {
  try {
    const raw = localStorage.getItem('tap-to-purr-session');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveSession(session) {
  try {
    if (session) {
      localStorage.setItem('tap-to-purr-session', JSON.stringify(session));
    } else {
      localStorage.removeItem('tap-to-purr-session');
    }
  } catch { /* ignore */ }
}

// Hash password — uses SHA-256 when available, falls back for non-secure contexts (HTTP)
async function hashPassword(password) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash for HTTP contexts
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < password.length; i++) {
    const ch = password.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

// Helper function to format current date correctly
function getCurrentDateString() {
  const now = new Date();
  // Use local timezone to get correct date
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so add 1
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
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
  const [isPaused, setIsPaused] = useState(false);
  const [autoScrollThemes, setAutoScrollThemes] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const gameStartTimeRef = useRef(null);

  const handleLogout = useCallback(() => {
    setSession(null);
    saveSession(null);
    setProgress({ totalXP: 0, videosCount: 0, activities: [], gameTimeSpent: 0 });
    setUserData({ phone: '' });
    setScreen('home');
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('Profile not found, clearing session...');
          setSession(null);
          saveSession(null);
        }
        throw error;
      }

      if (data) {
        setProgress({
          totalXP: data.total_xp || 0,
          videosCount: data.videos_count || 0,
          activities: data.activities || [],
          gameTimeSpent: data.game_time_spent || 0
        });
        setUserData({
          phone: data.phone || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase Profile Update Error:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      });
      throw err; // Re-throw so callers know it failed
    }
  }, [session]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setSession(saved);
      fetchProfile(saved.user.id);
    }
  }, [fetchProfile]);

  // Sync gameStartTime with ref
  useEffect(() => {
    gameStartTimeRef.current = gameStartTime;
  }, [gameStartTime]);

  // Cleanup: Save game time when screen changes away from game
  useEffect(() => {
    if (screen !== 'game' && gameStartTimeRef.current) {
      // Save game time when leaving game screen
      const sessionTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      if (sessionTime > 0 && session?.user) {
        const currentProgress = loadProgress();
        const totalGameTime = (currentProgress.gameTimeSpent || 0) + sessionTime;
        const updated = {
          ...currentProgress,
          gameTimeSpent: totalGameTime
        };
        saveProgress(updated);
        updateProfile({
          game_time_spent: totalGameTime
        });
      }
      setGameStartTime(null);
      gameStartTimeRef.current = null;
    }
  }, [screen, session, updateProfile]);

  const playerLevel = getLevelForXP(progress.totalXP);

  const handlePlayClick = useCallback(() => {
    if (session) {
      setScreen('starting');
    } else {
      setShowLoginModal(true);
    }
  }, [session]);

  const handleLogin = useCallback(async (formData) => {
    setAuthLoading(true);
    try {
      const hashedPwd = await hashPassword(formData.password);

      // Check if phone number already exists in profiles
      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', formData.phone)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let profile;

      if (existing) {
        // Phone exists — verify hashed password
        if (existing.password !== hashedPwd) {
          throw new Error('Incorrect password');
        }
        profile = existing;
      } else {
        // Phone not found — create new account with hashed password
        const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newId,
            phone: formData.phone,
            password: hashedPwd,
            total_xp: 0,
            videos_count: 0,
            activities: [],
            game_time_spent: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        profile = created;
      }

      // Build session object and persist
      const newSession = { user: { id: profile.id, phone: profile.phone } };
      setSession(newSession);
      saveSession(newSession);

      // Load profile data into state
      setProgress({
        totalXP: profile.total_xp || 0,
        videosCount: profile.videos_count || 0,
        activities: profile.activities || [],
        gameTimeSpent: profile.game_time_spent || 0
      });
      setUserData({ phone: profile.phone || '' });

      setShowLoginModal(false);
      setScreen('starting');
    } catch (err) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleCountdownComplete = useCallback(() => {
    const latestProgress = loadProgress();
    setProgress(latestProgress);
    setGameKey(prev => prev + 1);
    const startTime = Date.now();
    setGameStartTime(startTime); // Track when game starts
    gameStartTimeRef.current = startTime;
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
    setIsPaused(false);
    setAutoScrollThemes(false);
    const startTime = Date.now();
    setGameStartTime(startTime); // Track when game starts
    gameStartTimeRef.current = startTime;
    setScreen('game');
  }, []);

  const handleEndGame = useCallback((score) => {
    const newXP = progress.totalXP + score;
    // Use helper function to get current date
    const dateStr = getCurrentDateString();

    const newActivity = {
      text: `You earned ${score} points playing midnight paws`,
      date: dateStr
    };

    // Calculate game time spent in this session (in seconds)
    let sessionTime = 0;
    if (gameStartTime) {
      sessionTime = Math.floor((Date.now() - gameStartTime) / 1000);
    }
    const totalGameTime = (progress.gameTimeSpent || 0) + sessionTime;

    const activities = progress.activities || [];
    const updated = {
      totalXP: newXP,
      videosCount: progress.videosCount || 0,
      activities: [newActivity, ...activities].slice(0, 10),
      gameTimeSpent: totalGameTime
    };
    setProgress(updated);
    saveProgress(updated);
    setSessionScore(score);
    setGameStartTime(null); // Reset game start time
    gameStartTimeRef.current = null;

    // Sync to Supabase
    updateProfile({
      total_xp: updated.totalXP,
      activities: updated.activities,
      game_time_spent: updated.gameTimeSpent
    });
  }, [progress, session, updateProfile, gameStartTime]);

  const handleShowGameOver = useCallback((score) => {
    handleEndGame(score);
    setIsPaused(false);
    setShowGameOverModal(true);
  }, [handleEndGame]);

  const handlePause = useCallback((score) => {
    setSessionScore(score);
    setIsPaused(true);
    setShowGameOverModal(true);
    // Calculate and save game time when paused
    if (gameStartTime) {
      const sessionTime = Math.floor((Date.now() - gameStartTime) / 1000);
      const totalGameTime = (progress.gameTimeSpent || 0) + sessionTime;
      const updated = {
        ...progress,
        gameTimeSpent: totalGameTime
      };
      setProgress(updated);
      saveProgress(updated);
      // Update in Supabase
      updateProfile({
        game_time_spent: totalGameTime
      });
      // Reset start time so we can track resume
      setGameStartTime(null);
      gameStartTimeRef.current = null;
    }
  }, [progress, gameStartTime, updateProfile]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    setShowGameOverModal(false);
    const startTime = Date.now();
    setGameStartTime(startTime); // Resume tracking time
    gameStartTimeRef.current = startTime;
  }, []);

  const handleGoHome = useCallback(() => {
    // Reload progress to ensure we have the latest data
    const latestProgress = loadProgress();
    setProgress(latestProgress);
    setAutoScrollThemes(false);
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
    setAutoScrollThemes(true);
    setScreen('levels');
  }, []);

  const handleViewProfile = useCallback(() => {
    if (!session) {
      // If user is not logged in, show login modal
      setShowLoginModal(true);
      return;
    }
    // Reload progress to ensure we have the latest data
    const latestProgress = loadProgress();
    setProgress(latestProgress);
    setAutoScrollThemes(false);
    setScreen('levels');
  }, [session]);

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
          activities: [],
          game_time_spent: 0,
          video_url: [] // Clear all video URLs (JSONB array)
        });
      }
    }
  }, [session, updateProfile]);

  const handleGoToUpload = useCallback(() => {
    setScreen('upload');
  }, []);

  const handleVideoUpload = useCallback(async (videoUrl, receiptUrl = null, storeName = null) => {
    if (!session?.user) return;

    // Use helper function to get current date
    const dateStr = getCurrentDateString();

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

    try {
      // Fetch current profile to get existing records
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Prepare updated arrays - only update store_name as requested
      const storeNames = [...(currentProfile?.store_name || []), storeName || ''];

      // Update profile with synced JSONB arrays
      const updates = {
        videos_count: updated.videosCount,
        activities: updated.activities,
        store_name: storeNames
      };

      await updateProfile(updates);
    } catch (err) {
      console.error('CRITICAL: Error updating profile with upload data:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
    }
  }, [progress, session, updateProfile]);

  let content;
  if (screen === 'splash') {
    content = <SplashScreen onLoadingComplete={handleSplashComplete} />;
  } else if (screen === 'starting') {
    content = <StartingScreen levelName="Midnight Paws" onCountdownComplete={handleCountdownComplete} onProfileClick={handleViewProfile} onGoHome={handleGoHome} />;
  } else if (screen === 'game') {
    content = (
      <>
        <Game
          key={`game-${progress.totalXP}-${gameKey}`}
          playerLevel={playerLevel}
          totalXP={progress.totalXP}
          onEnd={handleEndGame}
          onRestart={handleStartGame}
          onShowGameOver={handleShowGameOver}
          isPaused={isPaused}
          onPause={handlePause}
        />
        {showGameOverModal && (
          <GameOver
            score={sessionScore}
            isPaused={isPaused}
            onPlayAgain={() => {
              if (isPaused) {
                handleResume();
              } else {
                setShowGameOverModal(false);
                handleStartGame();
              }
            }}
            onGoHome={() => {
              setShowGameOverModal(false);
              setIsPaused(false);
              handleGoHome();
            }}
            onUnlockThemes={() => {
              setShowGameOverModal(false);
              setIsPaused(false);
              handleUnlockThemes();
            }}
            onProfileClick={() => {
              setShowGameOverModal(false);
              setIsPaused(false);
              handleViewProfile();
            }}
            onGoToUpload={() => {
              setShowGameOverModal(false);
              setIsPaused(false);
              handleGoToUpload();
            }}
          />
        )}
      </>
    );
  } else if (screen === 'gameover') {
    content = (
      <GameOver
        score={sessionScore}
        onPlayAgain={handleStartGame}
        onGoHome={handleGoHome}
        onUnlockThemes={handleUnlockThemes}
        onProfileClick={handleViewProfile}
        onGoToUpload={handleGoToUpload}
      />
    );
  } else if (screen === 'levels') {
    content = (
      <LevelsScreen
        totalXP={progress.totalXP}
        videosCount={progress.videosCount || 0}
        activities={progress.activities || []}
        userData={userData}
        onStartGame={handleStartGame}
        onGoBack={handleGoHome}
        onVideoUpload={handleGoToUpload}
        autoScrollToThemes={autoScrollThemes}
        onLogout={session ? handleLogout : null}
      />
    );
  } else if (screen === 'upload') {
    content = (
      <UploadScreen
        onGoHome={handleGoHome}
        onUpload={handleVideoUpload}
        userId={session?.user?.id}
        onGoToThankYou={() => setScreen('thankyou')}
        onProfileClick={handleViewProfile}
      />
    );
  } else if (screen === 'thankyou') {
    content = (
      <ThankYouScreen
        onGoHome={handleGoHome}
        onProfileClick={handleViewProfile}
      />
    );
  } else {
    content = (
      <>
        <Home
          onStartGame={handlePlayClick}
          onResetProgress={handleResetProgress}
          onLogout={session ? handleLogout : null}
          user={session?.user}
          onProfileClick={handleViewProfile}
          onGoToUpload={handleGoToUpload}
        />
        {showModal && <HowToPlayModal onClose={handleCloseModal} />}
        {showLoginModal && (
          <LoginModal
            onClose={handleCloseLoginModal}
            onLogin={handleLogin}
            isLoading={authLoading}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-main-container">
      <AssetPreloader />
      {content}
    </div>
  );
}

export default App;
