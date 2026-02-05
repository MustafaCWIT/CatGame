import { useState, useCallback, useRef } from 'react';
import { LEVELS, MAX_OBJECTS, SPAWN_MARGIN, OBJECT_SIZE, OBJECT_POINTS, MIN_OBJECT_DISTANCE } from '../game/levels';

let objectIdCounter = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function createObject(levelIndex, screenW, screenH, existingObjects = [], isInitial = false, index = 0) {
  const level = LEVELS[levelIndex];

  // Define direction types
  const verticalTypes = ['clouds', 'cloud', 'bowl', 'star', 'stars', 'leaf', 'flower', 'paw', 'foodBox', 'foodBoxes', 'treat', 'moon', 'orb'];
  const horizontalTypes = ['fish', 'sparrow', 'butterfly', 'comet', 'dollar', 'nebula'];

  // Alternate direction based on the global counter: 0 = Horizontal, 1 = Vertical
  // We use objectIdCounter % 2 to ensure they alternate strictly one after another
  const desiredDirection = (objectIdCounter % 2);

  // Filter level objects to match the desired direction
  const matchingTypes = level.objects.filter(t => {
    // 0 = Horizontal, 1 = Vertical (as per "HORIZONTAL AND THEN VERTICAL" request)
    if (desiredDirection === 1) return verticalTypes.includes(t);
    return horizontalTypes.includes(t);
  });

  // Fallback to all objects if no match (to avoid crashes if a level is missing a type)
  const pool = matchingTypes.length > 0 ? matchingTypes : level.objects;

  // Filter out the last spawned object type to avoid repetition
  const lastType = existingObjects.length > 0 ? existingObjects[existingObjects.length - 1].type : null;
  const availableObjects = (lastType && pool.length > 1)
    ? pool.filter(t => t !== lastType)
    : pool;

  const type = availableObjects[Math.floor(Math.random() * availableObjects.length)];
  const color = level.objectColors[Math.floor(Math.random() * level.objectColors.length)];

  // Set direction based on actual selected type for movement logic
  const direction = verticalTypes.includes(type) ? 0 : 1;

  let x, y, targetX, targetY;

  if (direction === 0) {
    // Vertical: Top to Bottom
    let range = screenW - (SPAWN_MARGIN * 2) - OBJECT_SIZE;
    x = range <= 0 ? (screenW - OBJECT_SIZE) / 2 : SPAWN_MARGIN + Math.random() * range;
    y = -OBJECT_SIZE; // Start fully off-screen for complete appearance
    targetX = x;
    targetY = screenH + OBJECT_SIZE;
  } else {
    // Horizontal: Left to Right
    let range = screenH - (SPAWN_MARGIN * 2) - OBJECT_SIZE;
    y = range <= 0 ? (screenH - OBJECT_SIZE) / 2 : SPAWN_MARGIN + Math.random() * range;
    x = -OBJECT_SIZE; // Start fully off-screen
    targetX = screenW + OBJECT_SIZE;
    targetY = y;
  }

  // Define speed/duration (Decreased speed as requested)
  let duration;
  if (type === 'clouds' || type === 'cloud') {
    duration = randomBetween(4.5, 6.0);
  } else if (type === 'leaf') {
    duration = randomBetween(3.5, 5.0);
  } else {
    duration = randomBetween(2.8, 4.2);
  }

  return {
    id: ++objectIdCounter,
    type,
    color,
    x,
    y,
    targetX,
    targetY,
    duration,
    scale: randomBetween(1.0, 1.4),
    // Straight movement check including bowl, stars, and leaf
    rotation: (type === 'fish' || type === 'sparrow' || type === 'clouds' || type === 'cloud' || type === 'bowl' || type === 'star' || type === 'stars' || type === 'leaf') ? 0 : randomBetween(0, 360),
    rotationSpeed: (type === 'fish' || type === 'sparrow' || type === 'clouds' || type === 'cloud' || type === 'bowl' || type === 'star' || type === 'stars' || type === 'leaf') ? 0 : randomBetween(-0.2, 0.2),
    opacity: 1,
    spawning: true,
    moveIndex: index
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
      const newObj = createObject(playerLevel, w, h, prev, false, prev[idx].moveIndex);
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
      const newObj = createObject(playerLevel, w, h, prev, false, collected.moveIndex);

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
    // Basic debounce to prevent rapid fire accidental taps
    if (isCollectingRef.current) return false;

    let captureSuccess = false;

    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;

      const collected = prev[idx];
      // Second layer of protection: Check if this specific object was already tapped
      if (collected.collected || lastCollectedIdRef.current === collected.id) {
        return prev;
      }

      isCollectingRef.current = true;
      lastCollectedIdRef.current = collected.id;
      captureSuccess = true;

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
      const newObj = createObject(playerLevel, w, h, prev, false, collected.moveIndex);

      const next = [...prev];
      // Mark current object as collected just in case state update lags
      next[idx] = { ...collected, collected: true };

      // We replace it with the new object after a tiny delay or immediately
      // For sequential feel, we replace immediately but use the 'collected' flag to prevent double taps
      next[idx] = newObj;

      setTimeout(() => {
        isCollectingRef.current = false;
        lastCollectedIdRef.current = null;
      }, 250);

      return next;
    });

    return captureSuccess;
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
