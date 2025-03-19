import React from 'react';
import './StoryDisplay.css';
import '../styles/WaterInkTheme.css';

const StoryDisplay = ({ chapter, playerStatus }) => {
  if (!chapter) return <div className="loading water-ink-text">加载中...</div>;
  
  // Split the text into paragraphs for better readability
  const paragraphs = chapter.text.split('\n').filter(p => p.trim() !== '');
  
  // Determine if this is a significant chapter based on cause-effect values in options
  const hasSignificantChoice = chapter.options && chapter.options.some(
    option => option.effects && Math.abs(option.effects['因果值'] || 0) >= 10
  );
  
  // Render dialogue if present
  const renderDialogue = () => {
    if (!chapter.dialogue || !chapter.dialogue.length) return null;
    
    return (
      <div className="chapter-dialogue">
        {chapter.dialogue.map((dialog, index) => (
          <div key={index} className="dialogue-entry">
            <div className="dialogue-speaker">{dialog.name}</div>
            <div className="dialogue-text">{dialog.text}</div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="story-display water-ink-container">
      <h2 className="water-ink-title">{chapter.title}</h2>
      {chapter.name && (
        <h3 className="chapter-location">{chapter.name}</h3>
      )}
      
      <div className="ink-scroll-area">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="water-ink-text">
            {paragraph}
          </p>
        ))}
        
        {chapter.character && (
          <div className="character-info">
            <span className="character-label">人物：</span>
            <span className="character-name">{chapter.character}</span>
          </div>
        )}
        
        {renderDialogue()}
        
        {hasSignificantChoice && (
          <p className="cause-effect-warning water-ink-text">
            <span className="cause-effect-icon">⚠</span>
            你的选择将显著影响因果值
          </p>
        )}
        
        {chapter.assets && (
          <div className="scene-assets">
            {chapter.assets.bgm && (
              <div className="bgm-info">
                <span className="bgm-label">背景音乐：</span>
                <span className="bgm-name">{chapter.assets.bgm}</span>
              </div>
            )}
          </div>
        )}
        
        {playerStatus && playerStatus.因果值 !== undefined && (
          <div className="current-fate-path water-ink-text">
            <span className="fate-path-label">
              当前因果路径: 
              {playerStatus.因果值 > 30 ? ' 仙道正途' : 
               playerStatus.因果值 < -30 ? ' 魔道邪径' : 
               playerStatus.因果值 > 10 ? ' 善缘增长' : 
               playerStatus.因果值 < -10 ? ' 恶缘积累' : 
               ' 因果中庸'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay; 