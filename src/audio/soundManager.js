import { Howl, Howler } from 'howler';

// Sound categories
const SOUND_TYPES = {
  BACKGROUND: 'background',
  UI: 'ui',
  EFFECT: 'effect',
};

// Paths to sound files (will add actual files later)
const SOUND_PATHS = {
  [SOUND_TYPES.BACKGROUND]: {
    main: '/sounds/background/main_theme.mp3',
    battle: '/sounds/background/battle_theme.mp3',
    meditation: '/sounds/background/meditation.mp3',
  },
  [SOUND_TYPES.UI]: {
    click: '/sounds/ui/click.mp3',
    hover: '/sounds/ui/hover.mp3',
    select: '/sounds/ui/select.mp3',
  },
  [SOUND_TYPES.EFFECT]: {
    levelUp: '/sounds/effects/level_up.mp3',
    achievement: '/sounds/effects/achievement.mp3',
    sword: '/sounds/effects/sword.mp3',
    magic: '/sounds/effects/magic.mp3',
  },
};

// Sound instances
const sounds = {};

// Initialize sounds
const initSounds = () => {
  // Initialize background sounds
  Object.entries(SOUND_PATHS[SOUND_TYPES.BACKGROUND]).forEach(([key, path]) => {
    sounds[key] = new Howl({
      src: [path],
      loop: true,
      volume: 0.5,
      preload: true,
    });
  });

  // Initialize UI sounds
  Object.entries(SOUND_PATHS[SOUND_TYPES.UI]).forEach(([key, path]) => {
    sounds[key] = new Howl({
      src: [path],
      volume: 0.3,
      preload: true,
    });
  });

  // Initialize effect sounds
  Object.entries(SOUND_PATHS[SOUND_TYPES.EFFECT]).forEach(([key, path]) => {
    sounds[key] = new Howl({
      src: [path],
      volume: 0.7,
      preload: true,
    });
  });

  console.log('Sound manager initialized');
};

// Play a background sound (loop)
const playBackgroundMusic = (key) => {
  // Stop any playing background music first
  stopBackgroundMusic();
  
  if (sounds[key]) {
    sounds[key].play();
    return true;
  }
  return false;
};

// Stop background music
const stopBackgroundMusic = () => {
  Object.entries(SOUND_PATHS[SOUND_TYPES.BACKGROUND]).forEach(([key]) => {
    if (sounds[key] && sounds[key].playing()) {
      sounds[key].stop();
    }
  });
};

// Play a UI sound
const playUISound = (key) => {
  if (sounds[key]) {
    sounds[key].play();
    return true;
  }
  return false;
};

// Play an effect sound
const playEffectSound = (key) => {
  if (sounds[key]) {
    sounds[key].play();
    return true;
  }
  return false;
};

// Set global volume
const setVolume = (volume) => {
  Howler.volume(volume);
};

// Mute/unmute all sounds
const setMute = (muted) => {
  Howler.mute(muted);
};

// Handle sound preloading
const preloadSounds = (callback) => {
  let loadedCount = 0;
  const totalSounds = Object.values(SOUND_PATHS).reduce(
    (acc, category) => acc + Object.keys(category).length,
    0
  );

  const onLoad = () => {
    loadedCount++;
    if (loadedCount === totalSounds && callback) {
      callback();
    }
  };

  // Initialize background sounds with load events
  Object.entries(SOUND_PATHS[SOUND_TYPES.BACKGROUND]).forEach(([key, path]) => {
    sounds[key] = new Howl({
      src: [path],
      loop: true,
      volume: 0.5,
      onload: onLoad,
    });
  });

  // Similar for other sound types
  Object.entries(SOUND_PATHS[SOUND_TYPES.UI]).forEach(([key, path]) => {
    sounds[key] = new Howl({
      src: [path],
      volume: 0.3,
      onload: onLoad,
    });
  });

  Object.entries(SOUND_PATHS[SOUND_TYPES.EFFECT]).forEach(([key, path]) => {
    sounds[key] = new Howl({
      src: [path],
      volume: 0.7,
      onload: onLoad,
    });
  });
};

// Export the sound manager
const soundManager = {
  init: initSounds,
  preload: preloadSounds,
  playBackgroundMusic,
  stopBackgroundMusic,
  playUISound,
  playEffectSound,
  setVolume,
  setMute,
  SOUND_TYPES,
};

export default soundManager;