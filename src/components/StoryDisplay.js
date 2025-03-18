import React from 'react';
import './StoryDisplay.css';

const StoryDisplay = ({ chapter }) => {
  if (!chapter) return <div className="loading">加载中...</div>;
  
  return (
    <div className="story-display">
      <h2>{chapter.title}</h2>
      <p>{chapter.text}</p>
    </div>
  );
};

export default StoryDisplay; 