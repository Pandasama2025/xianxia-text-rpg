import React, { useState, useEffect } from 'react';
import './App.css';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import PlayerStatus from './components/PlayerStatus';
import storyData from './data/story.json';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [playerStatus, setPlayerStatus] = useState({
    '修为': 0,
    '灵力': 100,
    '因果值': 0,
    '道心': 50
  });
  
  useEffect(() => {
    // 初始化时加载第一个章节
    setCurrentChapter(storyData.chapters[0]);
  }, []);
  
  // 处理选项选择
  const handleOptionSelect = (option) => {
    // 应用选项效果到玩家状态
    if (option.effects && Object.keys(option.effects).length > 0) {
      setPlayerStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        
        // 遍历所有效果并应用
        Object.entries(option.effects).forEach(([stat, value]) => {
          // 如果状态已存在，则累加值；否则新建状态
          if (newStatus.hasOwnProperty(stat)) {
            newStatus[stat] += value;
          } else {
            newStatus[stat] = value;
          }
        });
        
        return newStatus;
      });
    }
    
    // 查找下一个章节
    const nextChapter = storyData.chapters.find(
      chapter => chapter.id === option.nextId
    );
    
    if (nextChapter) {
      setCurrentChapter(nextChapter);
    } else {
      console.error('找不到章节:', option.nextId);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
      </header>
      <main>
        <PlayerStatus status={playerStatus} />
        <StoryDisplay chapter={currentChapter} />
        {currentChapter && (
          <Options 
            options={currentChapter.options} 
            onSelect={handleOptionSelect}
          />
        )}
      </main>
    </div>
  );
}

export default App;
