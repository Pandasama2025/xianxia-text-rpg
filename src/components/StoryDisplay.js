import React from 'react';
import './StoryDisplay.css';
import '../styles/WaterInkTheme.css';

const StoryDisplay = ({ chapter }) => {
  if (!chapter) return <div className="loading water-ink-text">加载中...</div>;
  
  return (
    <div className="story-display water-ink-container">
      <h2 className="water-ink-title">{chapter.title}</h2>
      <div className="ink-scroll-area">
        <p className="water-ink-text">{chapter.text}</p>
      </div>
    </div>
  );
};

export default StoryDisplay; 