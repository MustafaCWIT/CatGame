// Level definitions for Whiskus
// Each level has an XP threshold to unlock, background config, color palette, and object set.

export const LEVELS = [
  {
    name: 'Soft Sky',
    xpRequired: 0,       // unlocked from start
    background: ['#2d1b69', '#1a1040', '#3b2d80'],
    objects: ['fish', 'star', 'paw'],
    objectColors: ['#c4b5fd', '#a78bfa', '#7dd3fc', '#e0e7ff'],
    ambientParticles: 'sparkle',
  },
  {
    name: 'Cozy Bowl World',
    xpRequired: 200,
    background: ['#7c2d12', '#451a03', '#c2410c'],
    objects: ['fish', 'star', 'paw'],
    objectColors: ['#fdba74', '#fb923c', '#fbbf24', '#fde68a'],
    ambientParticles: 'glow',
  },
  {
    name: 'Starry Dream',
    xpRequired: 600,
    background: ['#0f172a', '#020617', '#1e1b4b'],
    objects: ['fish', 'star', 'paw'],
    objectColors: ['#c4b5fd', '#67e8f9', '#fde68a', '#a5f3fc'],
    ambientParticles: 'star',
  },
  {
    name: 'Garden Glow',
    xpRequired: 1400,
    background: ['#064e3b', '#022c22', '#065f46'],
    objects: ['fish', 'star', 'paw'],
    objectColors: ['#6ee7b7', '#a7f3d0', '#fde68a', '#fbcfe8'],
    ambientParticles: 'sparkle',
  },
  {
    name: 'Aurora Drift',
    xpRequired: 2800,
    background: ['#1e1b4b', '#312e81', '#4c1d95'],
    objects: ['fish', 'star', 'paw'],
    objectColors: ['#c084fc', '#a78bfa', '#67e8f9', '#f0abfc'],
    ambientParticles: 'star',
  },
];

// Given total XP, returns the highest level index unlocked
export function getLevelForXP(totalXP) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) return i;
  }
  return 0;
}

// Returns XP needed to reach the next level, or null if max
export function getNextLevelXP(currentLevelIndex) {
  if (currentLevelIndex >= LEVELS.length - 1) return null;
  return LEVELS[currentLevelIndex + 1].xpRequired;
}

// Object shape SVG paths for rendering
export const OBJECT_SHAPES = {
  cloud: 'M 25 60 Q 5 60 5 45 Q 5 30 20 28 Q 18 10 35 10 Q 52 10 50 28 Q 65 30 65 45 Q 65 60 45 60 Z',
  sparkle: 'M 35 5 L 40 25 L 60 30 L 40 35 L 35 55 L 30 35 L 10 30 L 30 25 Z',
  glowfish: 'M 10 35 Q 20 10 40 25 Q 55 15 60 35 Q 55 55 40 45 Q 20 60 10 35 Z',
  bowl: 'M 10 25 Q 10 55 35 55 Q 60 55 60 25 L 55 25 Q 55 50 35 50 Q 15 50 15 25 Z',
  treat: 'M 35 10 L 45 20 L 55 15 L 50 28 L 60 38 L 47 38 L 35 50 L 23 38 L 10 38 L 20 28 L 15 15 L 25 20 Z',
  paw: 'M 35 55 Q 20 55 15 42 Q 10 30 20 25 Q 25 20 30 25 L 35 20 L 40 25 Q 45 20 50 25 Q 60 30 55 42 Q 50 55 35 55 Z M 22 18 A 6 6 0 1 1 22 6 A 6 6 0 1 1 22 18 M 48 18 A 6 6 0 1 1 48 6 A 6 6 0 1 1 48 18 M 12 30 A 5 5 0 1 1 12 20 A 5 5 0 1 1 12 30 M 58 30 A 5 5 0 1 1 58 20 A 5 5 0 1 1 58 30',
  star: 'M 35 5 L 42 25 L 65 25 L 47 38 L 53 58 L 35 46 L 17 58 L 23 38 L 5 25 L 28 25 Z',
  fish: 'M 10 35 Q 25 10 45 25 Q 55 15 55 35 Q 55 55 45 45 Q 25 60 10 35 Z M 60 25 L 70 15 L 70 55 L 60 45 Z',
  orb: 'M 35 5 A 30 30 0 1 1 35 65 A 30 30 0 1 1 35 5 Z',
  leaf: 'M 35 5 Q 65 20 55 50 Q 45 65 35 65 Q 25 65 15 50 Q 5 20 35 5 Z M 35 15 L 35 55',
  butterfly: 'M 35 15 Q 10 5 10 30 Q 10 50 35 45 Q 60 50 60 30 Q 60 5 35 15 Z M 35 45 L 35 60 M 30 58 L 35 65 L 40 58',
  flower: 'M 35 20 A 12 12 0 1 1 50 35 A 12 12 0 1 1 35 50 A 12 12 0 1 1 20 35 A 12 12 0 1 1 35 20 Z M 35 28 A 7 7 0 1 1 35 42 A 7 7 0 1 1 35 28 Z',
  moon: 'M 40 5 A 30 30 0 1 1 40 65 A 22 22 0 1 0 40 5 Z',
  comet: 'M 50 30 A 10 10 0 1 1 50 40 L 5 55 L 15 35 L 5 15 Z',
  nebula: 'M 35 10 Q 55 10 55 25 Q 65 35 55 45 Q 55 60 35 55 Q 15 60 15 45 Q 5 35 15 25 Q 15 10 35 10 Z',
};

export const OBJECT_SIZE = 140; // Increased for cat paws (was 80)
export const MAX_OBJECTS = 6; // Reduced to allow more space
export const SPAWN_MARGIN = 140; // Increased margin (proportional to OBJECT_SIZE)
export const MIN_OBJECT_DISTANCE = 200; // Minimum distance between object centers (increased for larger objects)
export const TAP_RADIUS = 250; // Tap detection radius - very forgiving for cat paws (was unlimited, now generous limit)
export const OBJECT_SPEED = 0.3;

// Points for each object type
export const OBJECT_POINTS = {
  fish: 1,
  star: 2,
  paw: 3,
  // Fallback for any other types
  cloud: 1,
  sparkle: 1,
  glowfish: 1,
  bowl: 1,
  treat: 1,
  orb: 1,
  leaf: 1,
  butterfly: 1,
  flower: 1,
  moon: 1,
  comet: 1,
  nebula: 1,
};
