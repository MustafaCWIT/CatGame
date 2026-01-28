import { useState, useCallback, useRef } from 'react';
import { LEVELS, MAX_OBJECTS, SPAWN_MARGIN, OBJECT_SIZE, OBJECT_POINTS, MIN_OBJECT_DISTANCE } from '../game/levels';

let objectIdCounter = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createObject(levelIndex, screenW, screenH, existingObjects = []) {
  const level = LEVELS[levelIndex];
  const type = level.objects[Math.floor(Math.random() * level.objects.length)];
  const color = level.objectColors[Math.floor(Math.random() * level.objectColors.length)];
  
  // Try to find a position that doesn't overlap with existing objects
  let attempts = 0;
  let x, y;
  let validPosition = false;
  
  while (attempts < 50 && !validPosition) {
    x = randomBetween(SPAWN_MARGIN, screenW - SPAWN_MARGIN - OBJECT_SIZE);
    y = randomBetween(SPAWN_MARGIN, screenH - SPAWN_MARGIN - OBJECT_SIZE);
    
    const centerX = x + OBJECT_SIZE / 2;
    const centerY = y + OBJECT_SIZE / 2;
    
    // Check distance from all existing objects
    validPosition = existingObjects.every(obj => {
      const objCenterX = obj.x + OBJECT_SIZE / 2;
      const objCenterY = obj.y + OBJECT_SIZE / 2;
      const distance = Math.hypot(centerX - objCenterX, centerY - objCenterY);
      return distance >= MIN_OBJECT_DISTANCE;
    });
    
    attempts++;
  }
  
  // If we couldn't find a good position after 50 attempts, use the last one anyway
  // (better than infinite loop)
  
  return {
    id: ++objectIdCounter,
    type,
    color,
    x,
    y,
    vx: randomBetween(-0.3, 0.3),
    vy: randomBetween(-0.3, 0.3),
    scale: randomBetween(0.8, 1.2),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-0.3, 0.3),
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

  const initObjects = useCallback((w, h) => {
    screenSize.current = { w, h };
    const objs = [];
    for (let i = 0; i < MAX_OBJECTS; i++) {
      objs.push(createObject(playerLevel, w, h, objs));
    }
    setObjects(objs);
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
        const cx = obj.x + OBJECT_SIZE / 2;
        const cy = obj.y + OBJECT_SIZE / 2;
        const d = Math.hypot(touchX - cx, touchY - cy);
        // Find nearest object (original behavior - always finds nearest for easy cat paw taps)
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
      const popupX = collected.x + OBJECT_SIZE / 2;
      const popupY = collected.y + OBJECT_SIZE / 2;

      // Update effects and score - use functional updates to ensure correct values
      setRipples(r => [...r, {
        id: Date.now() + Math.random(),
        x: popupX,
        y: popupY,
        color: collected.color,
      }]);

      // Add score exactly once - use functional update
      setScore(s => {
        // Double-check we haven't already processed this
        return s + pointsEarned;
      });

      // Show point popup
      setPointPopups(p => [...p, {
        id: Date.now() + Math.random(),
        x: popupX,
        y: popupY,
        points: pointsEarned,
        color: collected.color,
        type: collected.type,
      }]);

      // Spawn new object at the same fixed level, avoiding existing objects
      const { w, h } = screenSize.current;
      const newObj = createObject(playerLevel, w, h, prev);

      const next = [...prev];
      next[nearestIdx] = newObj;
      
      // Reset collection flag after a short delay
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
    isCollectingRef.current = false; // Reset collection flag
    lastCollectedIdRef.current = null; // Reset last collected ID
    const { w, h } = screenSize.current;
    const objs = [];
    for (let i = 0; i < MAX_OBJECTS; i++) {
      objs.push(createObject(playerLevel, w, h, objs));
    }
    setObjects(objs);
    setRipples([]);
    setPointPopups([]);
  }, [playerLevel]);

  return {
    score,
    playerLevel,
    objects,
    setObjects,
    ripples,
    pointPopups,
    initObjects,
    collectNearest,
    clearRipple,
    clearPointPopup,
    resetGame,
    updateScreenSize,
  };
}
