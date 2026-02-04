import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useTouchHandler } from '../hooks/useTouchHandler';
import { OBJECT_SIZE, LEVELS, getLevelForXP, getNextLevelXP, MIN_OBJECT_DISTANCE, TAP_RADIUS } from './levels';
import { playChime, tryVibrate } from './sounds';
import FloatingObject from './FloatingObject';
import Ripple from './Ripple';
import PointPopup from './PointPopup';
import Background, { BackgroundDefs } from './Background';
import { createObject } from '../hooks/useGameState';

const GAME_DURATION = 120; // 2 minutes

export default function Game({ playerLevel, totalXP, onEnd, onRestart, onShowGameOver }) {
  const {
    score,
    objects,
    setObjects,
    ripples,
    pointPopups,
    initObjects,
    collectById,
    replaceObject,
    clearRipple,
    clearPointPopup,
    resetGame,
    updateScreenSize,
  } = useGameState(playerLevel);

  const svgRef = useRef(null);
  const objectRefs = useRef({}); // To track visual positions for GSAP
  const longPressTimer = useRef(null);
  const pitchCounter = useRef(0);
  const scoreRef = useRef(score);
  const isTouchDevice = useRef('ontouchstart' in window);
  scoreRef.current = score;

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [showGameOver, setShowGameOver] = useState(false);
  const scoreSavedRef = useRef(false);
  const timerIntervalRef = useRef(null);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const newTotalXP = totalXP + score;
  const newLevel = getLevelForXP(newTotalXP);
  const level = LEVELS[playerLevel];

  const currentLevelXP = LEVELS[playerLevel].xpRequired;
  const nextLevelXP = getNextLevelXP(playerLevel);
  const xpProgress = nextLevelXP
    ? Math.min(1, (newTotalXP - currentLevelXP) / (nextLevelXP - currentLevelXP))
    : 1;

  useEffect(() => {
    if (showGameOver) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          if (onEnd && scoreRef.current > 0 && !scoreSavedRef.current) {
            onEnd(scoreRef.current);
            scoreSavedRef.current = true;
          }
          if (onShowGameOver) {
            onShowGameOver(scoreRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [onEnd, onShowGameOver, showGameOver]);

  // Initialize objects on mount and handle resize
  useEffect(() => {
    scoreSavedRef.current = false;
    // Use initial window size
    const w = window.innerWidth;
    const h = window.innerHeight;
    initObjects(w, h);

    const onResize = () => {
      updateScreenSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [initObjects, updateScreenSize]); // stable dependencies

  const registerRef = useCallback((id, el) => {
    if (el) objectRefs.current[id] = el;
    else delete objectRefs.current[id];
  }, []);

  const onTouch = useCallback((tx, ty) => {
    if (showGameOver) return;

    // Find nearest object by checking the ACTUAL screen position of the animated elements
    let minDist = Infinity;
    let nearestId = null;

    objects.forEach(obj => {
      const el = objectRefs.current[obj.id];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const d = Math.hypot(tx - cx, ty - cy);

      if (d < minDist) {
        minDist = d;
        nearestId = obj.id;
      }
    });

    if (nearestId !== null && minDist < TAP_RADIUS) {
      collectById(nearestId, tx, ty);
      playChime(pitchCounter.current++);
      tryVibrate();
    }
  }, [objects, showGameOver, collectById]);

  const { handleTouchStart, handleTouchEnd, handleMouseDown } = useTouchHandler(onTouch);

  const handleEndGame = useCallback(() => {
    // Only save if not already saved when time ran out
    if (onEnd && !scoreSavedRef.current) {
      onEnd(scoreRef.current);
      scoreSavedRef.current = true;
    } else if (!onEnd) {
      resetGame();
    }
  }, [onEnd, resetGame]);

  const handleResetStart = useCallback((e) => {
    const t = e.touches ? e.touches[0] : e;
    if (t.clientX < 60 && t.clientY < 60) {
      longPressTimer.current = setTimeout(() => handleEndGame(), 3000);
    }
  }, [handleEndGame]);

  const handleResetEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const glassStyle = {
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0a1a' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute', top: 0, left: 0,
          touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'none',
        }}
        onTouchStart={(e) => {
          if (!showGameOver) {
            isTouchDevice.current = true;
            handleTouchStart(e);
            handleResetStart(e);
          }
        }}
        onTouchEnd={(e) => { handleTouchEnd(e); handleResetEnd(); }}
        onMouseDown={(e) => {
          if (!showGameOver && !isTouchDevice.current) {
            handleMouseDown(e);
            handleResetStart(e);
          }
        }}
        onMouseUp={handleResetEnd}
      >
        <BackgroundDefs levelIndex={playerLevel} width={width} height={height} />
        <Background levelIndex={playerLevel} width={width} height={height} />
        {objects.map(obj => (
          <FloatingObject
            key={obj.id}
            obj={obj}
            onOffScreen={replaceObject}
            registerRef={registerRef}
          />
        ))}
        {ripples.map(r => <Ripple key={r.id} ripple={r} onDone={clearRipple} />)}
        {pointPopups.map(p => <PointPopup key={p.id} popup={p} onDone={clearPointPopup} />)}
      </svg>

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        pointerEvents: 'none', fontFamily: 'system-ui, -apple-system, sans-serif', zIndex: 10,
      }}>
        {/* Left: Score */}
        <div style={{
          ...glassStyle,
          background: 'rgba(124, 58, 237, 0.9)',
          padding: '10px 18px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
        </div>

        {/* Right: Timer */}
        <div style={{
          ...glassStyle,
          background: 'rgba(124, 58, 237, 0.9)',
          padding: '10px 18px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{
            fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: timeLeft <= 10 ? '#f87171' : 'white', transition: 'color 0.3s',
          }}>{timeStr}</span>
        </div>
      </div>

      {/* Bottom Left: Pause Button */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        pointerEvents: 'auto', zIndex: 10,
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Pause the game and show GameOver modal
            setShowGameOver(true);
            // Save score and show GameOver modal
            if (onEnd && !scoreSavedRef.current) {
              onEnd(scoreRef.current);
              scoreSavedRef.current = true;
            }
            if (onShowGameOver) {
              onShowGameOver(scoreRef.current);
            }
          }}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(124, 58, 237, 0.9)',
            border: '2px solid rgba(167, 139, 250, 0.5)',
            borderRadius: 12,
            padding: '10px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </button>
      </div>

      {/* Bottom: Level + XP bar - Hidden for level 0 */}
      {playerLevel > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px 20px', display: 'flex', justifyContent: 'center',
          pointerEvents: 'none', fontFamily: 'system-ui, -apple-system, sans-serif', zIndex: 10,
        }}>
          <div style={{ ...glassStyle, background: 'rgba(0,0,0,0.35)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 260 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Lvl {playerLevel + 1}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: level.primaryColor }}>{level.name}</span>
            {/* XP progress to next level */}
            {nextLevelXP && (
              <>
                <div style={{
                  flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2,
                  overflow: 'hidden', minWidth: 50,
                }}>
                  <div style={{
                    height: '100%', width: `${xpProgress * 100}%`,
                    background: xpProgress >= 1
                      ? 'linear-gradient(90deg, #6ee7b7, #34d399)'
                      : `linear-gradient(90deg, ${level.primaryColor}, ${level.secondaryColor})`,
                    borderRadius: 2, transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                  {newTotalXP}/{nextLevelXP} XP
                </span>
              </>
            )}
            {!nextLevelXP && (
              <span style={{ fontSize: 10, color: 'rgba(110,231,183,0.6)' }}>MAX</span>
            )}
          </div>
        </div>
      )}


      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
