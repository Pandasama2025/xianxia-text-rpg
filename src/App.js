import React, { useState, useEffect } from 'react';
import './App.css';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import PlayerStatus from './components/PlayerStatus';
import SaveGameManager from './components/SaveGameManager';
import SoundControls from './components/SoundControls';
import soundManager from './audio/soundManager';
import storyData from './data/story.json';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerStatus, setPlayerStatus] = useState({
    '修为': 0,
    '灵力': 100,
    '因果值': 0,
    '道心': 50
  });
  
  useEffect(() => {
    // 初始化时加载第一个章节
    setCurrentChapter(storyData.chapters[0]);
    setIsLoading(false);
    
    // 初始化音频
    soundManager.init();
    
    // 播放背景音乐
    soundManager.playBackgroundMusic('main');
    
    // 清理函数
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);
  
  // 重置游戏状态到初始值
  const handleResetGame = () => {
    setPlayerStatus({
      '修为': 0,
      '灵力': 100,
      '因果值': 0,
      '道心': 50
    });
    setCurrentChapter(storyData.chapters[0]);
    
    // 播放重置音效
    soundManager.playUISound('select');
  };
  
  // 处理选项选择
  const handleOptionSelect = (option) => {
    // 播放选择音效
    soundManager.playUISound('click');
    
    // 应用选项效果到玩家状态
    if (option.effects && Object.keys(option.effects).length > 0) {
      // 检查是否有修为提升
      const hadCultivationImprovement = option.effects['修为'] && option.effects['修为'] > 0;
      
      setPlayerStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        
        // 遍历所有效果并应用
        Object.entries(option.effects).forEach(([stat, value]) => {
          // 如果状态已存在，则累加值；否则新建状态
          if (newStatus.hasOwnProperty(stat)) {
            newStatus[stat] += value;
            
            // 验证属性值不低于0
            if (newStatus[stat] < 0) {
              newStatus[stat] = 0;
            }
            
            // 对于特定属性，确保不超过最大值
            if (stat === '灵力' && newStatus[stat] > 100) {
              newStatus[stat] = 100;
            }
            if (stat === '道心' && newStatus[stat] > 100) {
              newStatus[stat] = 100;
            }
          } else {
            newStatus[stat] = Math.max(0, value); // 确保新属性不会是负值
          }
        });
        
        return newStatus;
      });
      
      // 如果修为提升，播放特殊音效
      if (hadCultivationImprovement) {
        soundManager.playEffectSound('levelUp');
      }
    }
    
    // 查找下一个章节
    const nextChapter = storyData.chapters.find(
      chapter => chapter.id === option.nextId
    );
    
    if (nextChapter) {
      setCurrentChapter(nextChapter);
      
      // 根据章节类型播放不同背景音乐
      if (nextChapter.id === 'chapter2') {
        soundManager.playBackgroundMusic('meditation');
      } else if (nextChapter.id === 'chapter6') {
        soundManager.playBackgroundMusic('battle');
      }
    } else {
      console.error('找不到章节:', option.nextId);
    }
  };

  // 处理游戏加载
  const handleLoadGame = (chapterId, loadedPlayerStatus) => {
    setIsLoading(true);
    
    // 播放加载音效
    soundManager.playUISound('select');
    
    // 加载玩家状态
    setPlayerStatus(loadedPlayerStatus);
    
    // 加载章节
    const chapter = storyData.chapters.find(
      chapter => chapter.id === chapterId
    );
    
    if (chapter) {
      setCurrentChapter(chapter);
      
      // 根据章节类型播放不同背景音乐
      if (chapter.id === 'chapter2') {
        soundManager.playBackgroundMusic('meditation');
      } else if (chapter.id === 'chapter6') {
        soundManager.playBackgroundMusic('battle');
      } else {
        soundManager.playBackgroundMusic('main');
      }
    } else {
      console.error('加载游戏时找不到章节:', chapterId);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
        <SoundControls />
      </header>
      <main>
        {isLoading ? (
          <div className="loading-container">加载中...</div>
        ) : (
          <>
            <div className="game-controls">
              <PlayerStatus status={playerStatus} />
              {currentChapter && (
                <SaveGameManager 
                  currentChapter={currentChapter}
                  playerStatus={playerStatus}
                  onLoad={handleLoadGame}
                />
              )}
              <button 
                className="reset-button" 
                onClick={handleResetGame}
              >
                重新开始
              </button>
            </div>
            <StoryDisplay chapter={currentChapter} />
            {currentChapter && (
              <Options 
                options={currentChapter.options} 
                onSelect={handleOptionSelect}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
