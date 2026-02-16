import { useState, useCallback, useRef } from 'react';
import { LEVELS, MAX_OBJECTS, OBJECT_POINTS, MIN_OBJECT_DISTANCE, getResponsiveObjectSize, getResponsiveSpawnMargin } from '../game/levels';

let objectIdCounter = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function createObject(levelIndex, screenW, screenH, existingObjects = [], isInitial = false, index = 0) {
  const level = LEVELS[levelIndex];

  // Map object types to directions: 0 = Vertical, 1 = Horizontal
  const verticalTypes = ['clouds', 'cloud', 'bowl', 'star', 'stars', 'leaf', 'flower', 'paw', 'foodBox', 'foodBoxes', 'treat', 'moon', 'orb', 'sparkle'];
  const horizontalTypes = ['fish', 'sparrow', 'butterfly', 'comet', 'dollar', 'nebula'];

  // Determine direction based on index to ensure 3 Horizontal (0,1,2) and 3 Vertical (3,4,5)
  // if MAX_OBJECTS = 6
  const direction = (index < 3) ? 1 : 0; // 0-2 -> Horizontal (1), 3-5 -> Vertical (0)

  // Filter level objects to match the determined direction
  let matchingTypes = level.objects.filter(t => {
    const isVertical = verticalTypes.includes(t);
    return direction === 0 ? isVertical : !isVertical;
  });

  // Fallback: If level has no objects of desired direction, use whatever is in the level
  if (matchingTypes.length === 0) {
    matchingTypes = level.objects;
  }

  const pool = matchingTypes;

  // Filter out ALL currently visible object types (from the same direction) to ensure uniqueness
  const visibleTypes = existingObjects.map(o => o.type);
  const availableObjects = pool.filter(t => !visibleTypes.includes(t));

  // Safety fallback: if we filtered everything out, go back to the pool
  const finalPool = availableObjects.length > 0 ? availableObjects : pool;

  const type = finalPool[Math.floor(Math.random() * finalPool.length)];
  const color = level.objectColors[Math.floor(Math.random() * level.objectColors.length)];

  let x, y, targetX, targetY;

  // Get responsive sizes
  const responsiveObjectSize = getResponsiveObjectSize(screenW);
  const objectsPerDirection = 3; // We want 3H and 3V

  if (direction === 0) {
    // Vertical: Top to Bottom (Indices 3, 4, 5)
    // Divide screen into 3 horizontal slots
    const slotIndex = (index - 3) % objectsPerDirection;
    const slotWidth = screenW / objectsPerDirection;

    const padding = responsiveObjectSize * 0.15;
    let slotStart = slotIndex * slotWidth + padding;
    let slotEnd = (slotIndex + 1) * slotWidth - responsiveObjectSize - padding;

    if (slotEnd < slotStart) {
      x = slotIndex * slotWidth + (slotWidth - responsiveObjectSize) / 2;
    } else {
      x = slotStart + Math.random() * (slotEnd - slotStart);
    }

    y = -responsiveObjectSize; // Start fully off-screen
    targetX = x;
    targetY = screenH + responsiveObjectSize;
  } else {
    // Horizontal: Left to Right (Indices 0, 1, 2)
    // Divide screen into 3 vertical slots
    const slotIndex = index % objectsPerDirection;
    const slotHeight = screenH / objectsPerDirection;

    const padding = responsiveObjectSize * 0.15;
    let slotStart = slotIndex * slotHeight + padding;
    let slotEnd = (slotIndex + 1) * slotHeight - responsiveObjectSize - padding;

    if (slotEnd < slotStart) {
      y = slotIndex * slotHeight + (slotHeight - responsiveObjectSize) / 2;
    } else {
      y = slotStart + Math.random() * (slotEnd - slotStart);
    }

    x = -responsiveObjectSize; // Start fully off-screen
    targetX = screenW + responsiveObjectSize;
    targetY = y;
  }

  // Define speed/duration
  let duration;
  if (type === 'clouds' || type === 'cloud') {
    duration = randomBetween(10.0, 15.0); // Slow moving clouds
  } else if (type === 'leaf') {
    duration = randomBetween(8.0, 12.0);
  } else {
    duration = randomBetween(6.0, 10.0);
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
    scale: randomBetween(1.0, 1.3),
    rotation: (type === 'fish' || type === 'sparrow' || type === 'clouds' || type === 'cloud' || type === 'catFood') ? 0 : randomBetween(0, 360),
    rotationSpeed: (type === 'fish' || type === 'sparrow' || type === 'clouds' || type === 'cloud' || type === 'catFood') ? 0 : randomBetween(-0.1, 0.1),
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
      const { w } = screenSize.current;
      const currentObjectSize = getResponsiveObjectSize(w);
      prev.forEach((obj, i) => {
        // We use the object's CURRENT position (from React state)
        // Note: For GSAP, we might need a way to get the actual visual position if we want perfect accuracy
        // but since we update state on collection, it's usually reasonable to use state.
        const cx = obj.x + currentObjectSize / 2;
        const cy = obj.y + currentObjectSize / 2;
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

      const { w: screenW, h: screenH } = screenSize.current;
      const newObj = createObject(playerLevel, screenW, screenH, prev, false, collected.moveIndex);

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
