import { useState, useCallback, useRef } from 'react';
import { LEVELS, MAX_OBJECTS, SPAWN_MARGIN, OBJECT_SIZE, OBJECT_POINTS, MIN_OBJECT_DISTANCE } from '../game/levels';

let objectIdCounter = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function createObject(levelIndex, screenW, screenH, existingObjects = [], isInitial = false, index = 0) {
  const level = LEVELS[levelIndex];
  const type = level.objects[Math.floor(Math.random() * level.objects.length)];
  const color = level.objectColors[Math.floor(Math.random() * level.objectColors.length)];

  // Always drop from top to bottom for "one at a time" flow

  // Ensure objects are well-centered and not clumped at the left
  let range = screenW - (SPAWN_MARGIN * 2) - OBJECT_SIZE;
  let x;
  if (range <= 0) {
    // If screen is narrow, just center it
    x = (screenW - OBJECT_SIZE) / 2;
  } else {
    // Randomly place within the safe middle area
    x = SPAWN_MARGIN + Math.random() * range;
  }

  const y = -OBJECT_SIZE;
  const targetX = x;
  const targetY = screenH + OBJECT_SIZE;

  return {
    id: ++objectIdCounter,
    type,
    color,
    x,
    y,
    targetX,
    targetY,
    duration: randomBetween(1.5, 2.8), // Slower and more varied for easier catching
    scale: randomBetween(1.0, 1.4),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-0.2, 0.2),
    opacity: 1,
    spawning: true,
  };
}

// playerLevel is the fixed level for this game session (does not change mid-game)
export function useGameState(playerLevel = 0) {
  const [score, setScore] = useState(0);
  const [objects, setObjects] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [pointPopups, setPointPopups] = useState([]);
  const screenSize = useRef({ w: window.innerWidth, h: window.innerHeight });
  const isCollectingRef = useRef(false);
  const lastCollectedIdRef = useRef(null);

  const updateScreenSize = useCallback((w, h) => {
    screenSize.current = { w, h };
  }, []);

  const timeoutsRef = useRef([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const initObjects = useCallback((w, h) => {
    screenSize.current = { w, h };
    clearTimeouts();
    setObjects([]);

    for (let i = 0; i < MAX_OBJECTS; i++) {
      const tid = setTimeout(() => {
        setObjects(prev => {
          const newObj = createObject(playerLevel, w, h, prev, true, i);
          return [...prev, newObj];
        });
      }, i * 400);
      timeoutsRef.current.push(tid);
    }
  }, [playerLevel, clearTimeouts]);

  const replaceObject = useCallback((oldId) => {
    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === oldId);
      if (idx === -1) return prev;

      const { w, h } = screenSize.current;
      const newObj = createObject(playerLevel, w, h, prev);
      const next = [...prev];
      next[idx] = newObj;
      return next;
    });
  }, [playerLevel]);

  const collectNearest = useCallback((touchX, touchY) => {
    // Prevent double collection
    if (isCollectingRef.current) return;

    // Mark as collecting immediately to prevent re-entry
    isCollectingRef.current = true;

    setObjects(prev => {
      if (prev.length === 0) {
        isCollectingRef.current = false;
        return prev;
      }

      let minDist = Infinity;
      let nearestIdx = -1;
      prev.forEach((obj, i) => {
        // We use the object's CURRENT position (from React state)
        // Note: For GSAP, we might need a way to get the actual visual position if we want perfect accuracy
        // but since we update state on collection, it's usually reasonable to use state.
        const cx = obj.x + OBJECT_SIZE / 2;
        const cy = obj.y + OBJECT_SIZE / 2;
        const d = Math.hypot(touchX - cx, touchY - cy);
        if (d < minDist) {
          minDist = d;
          nearestIdx = i;
        }
      });

      if (nearestIdx === -1) {
        isCollectingRef.current = false;
        return prev;
      }

      const collected = prev[nearestIdx];

      // Prevent processing the same object twice
      if (lastCollectedIdRef.current === collected.id) {
        isCollectingRef.current = false;
        return prev;
      }

      // Mark this object as collected
      lastCollectedIdRef.current = collected.id;

      // Get points based on object type
      const pointsEarned = OBJECT_POINTS[collected.type] ?? 1;
      // We'll use the touch coords for effects for better feedback
      const popupX = touchX;
      const popupY = touchY;

      // Update effects and score
      setRipples(r => [...r, {
        id: Date.now() + Math.random(),
        x: popupX,
        y: popupY,
        color: collected.color,
      }]);

      setScore(s => s + pointsEarned);

      setPointPopups(p => [...p, {
        id: Date.now() + Math.random(),
        x: popupX,
        y: popupY,
        points: pointsEarned,
        color: collected.color,
        type: collected.type,
      }]);

      const { w, h } = screenSize.current;
      const newObj = createObject(playerLevel, w, h, prev);

      const next = [...prev];
      next[nearestIdx] = newObj;

      setTimeout(() => {
        isCollectingRef.current = false;
        lastCollectedIdRef.current = null;
      }, 300);

      return next;
    });
  }, [playerLevel]);

  const collectById = useCallback((id, touchX, touchY) => {
    if (isCollectingRef.current) return;
    isCollectingRef.current = true;

    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) {
        isCollectingRef.current = false;
        return prev;
      }

      const collected = prev[idx];
      if (lastCollectedIdRef.current === collected.id) {
        isCollectingRef.current = false;
        return prev;
      }

      lastCollectedIdRef.current = collected.id;
      const pointsEarned = OBJECT_POINTS[collected.type] ?? 1;

      setRipples(r => [...r, {
        id: Date.now() + Math.random(),
        x: touchX,
        y: touchY,
        color: collected.color,
      }]);

      setScore(s => s + pointsEarned);

      setPointPopups(p => [...p, {
        id: Date.now() + Math.random(),
        x: touchX,
        y: touchY,
        points: pointsEarned,
        color: collected.color,
        type: collected.type,
      }]);

      const { w, h } = screenSize.current;
      const newObj = createObject(playerLevel, w, h, prev);
      const next = [...prev];
      next[idx] = newObj;

      setTimeout(() => {
        isCollectingRef.current = false;
        lastCollectedIdRef.current = null;
      }, 300);

      return next;
    });
  }, [playerLevel]);

  const clearRipple = useCallback((id) => {
    setRipples(r => r.filter(rip => rip.id !== id));
  }, []);

  const clearPointPopup = useCallback((id) => {
    setPointPopups(p => p.filter(pop => pop.id !== id));
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    objectIdCounter = 0;
    isCollectingRef.current = false;
    lastCollectedIdRef.current = null;
    setRipples([]);
    setPointPopups([]);

    const { w, h } = screenSize.current;
    initObjects(w, h);
  }, [playerLevel, initObjects]);

  return {
    score,
    playerLevel,
    objects,
    setObjects,
    ripples,
    pointPopups,
    initObjects,
    collectNearest,
    collectById,
    replaceObject,
    clearRipple,
    clearPointPopup,
    resetGame,
    updateScreenSize,
  };
}
