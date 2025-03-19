import React, { useState, useEffect } from 'react';
import soundManager from '../audio/soundManager';
import './SoundControls.css';

const SoundControls = () => {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize sound system on component mount
  useEffect(() => {
    // Initialize sound manager
    soundManager.init();
    setInitialized(true);
  }, []);

  // Apply volume changes to Howler
  useEffect(() => {
    if (initialized) {
      soundManager.setVolume(volume);
    }
  }, [volume, initialized]);

  // Apply mute changes to Howler
  useEffect(() => {
    if (initialized) {
      soundManager.setMute(muted);
    }
  }, [muted, initialized]);

  // Handle volume slider change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Handle mute button click
  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  // Play a test sound when initializing
  const handleTestSound = () => {
    soundManager.playUISound('click');
  };

  return (
    <div className="sound-controls">
      <button 
        className={`mute-button ${muted ? 'muted' : ''}`}
        onClick={handleMuteToggle} 
        title={muted ? "音频已静音" : "静音"}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-slider"
        disabled={muted}
        title={`音量: ${Math.round(volume * 100)}%`}
      />
      
      <button 
        className="test-sound-button" 
        onClick={handleTestSound}
        disabled={muted}
        title="测试音效"
      >
        🔔
      </button>
    </div>
  );
};

export default SoundControls;
