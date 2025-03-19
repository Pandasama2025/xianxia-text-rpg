import React, { useState, useEffect } from 'react';
import './App.css';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import PlayerStatus from './components/PlayerStatus';
import SaveLoadScreen from './components/SaveLoadScreen';
import SoundControls from './components/SoundControls';
import Cultivation from './components/Cultivation';
import soundManager from './audio/soundManager';
import storyData from './data/story.json';
import './styles/WaterInkTheme.css';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerStatus, setPlayerStatus] = useState({
    '修为': 0,
    '灵力': 100,
    '体力': 100,
    '道心': 50,
    '因果值': 0,
    '执念值': 0,
    '剑意类型': "无",
    '宗门立场': "无"
  });
  const [showSaveLoadScreen, setShowSaveLoadScreen] = useState(false);
  const [showCultivation, setShowCultivation] = useState(false);
  
  useEffect(() => {
    // 初始化时加载第一个章节
    setCurrentChapter(storyData.chapters[0]);
    
    // 初始化玩家数据，合并默认数据和故事中的变量
    if (storyData.variables) {
      setPlayerStatus(prevStatus => ({
        ...prevStatus,
        ...storyData.variables
      }));
    }
    
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
  
  // 获取当前对话选项，可以来自章节本身或角色对话
  const getCurrentOptions = () => {
    // 检查是否有角色对话选项
    if (currentChapter.dialogue && currentChapter.dialogue.length > 0) {
      const lastDialogue = currentChapter.dialogue[currentChapter.dialogue.length - 1];
      if (lastDialogue.options) {
        return lastDialogue.options;
      }
    }
    
    // 否则返回章节选项
    return currentChapter.options || [];
  };
  
  // 重置游戏状态到初始值
  const handleResetGame = () => {
    // 合并基础状态和故事变量
    const initialStatus = {
      '修为': 0,
      '灵力': 100,
      '体力': 100,
      '道心': 50
    };
    
    if (storyData.variables) {
      setPlayerStatus({
        ...initialStatus,
        ...storyData.variables
      });
    } else {
      setPlayerStatus(initialStatus);
    }
    
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
          // 处理不同类型的效果
          if (typeof value === 'number') {
            // 数值类效果
            if (newStatus.hasOwnProperty(stat)) {
              newStatus[stat] += value;
            } else {
              newStatus[stat] = value;
            }
            
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
            if (stat === '体力' && newStatus[stat] > 100) {
              newStatus[stat] = 100;
            }
          } else if (typeof value === 'boolean') {
            // 布尔类效果
            newStatus[stat] = value;
          } else if (typeof value === 'string') {
            // 字符串类效果，如获得物品或技能
            if (stat === '物品') {
              // 物品系统
              const inventory = newStatus['物品库存'] || [];
              inventory.push(value);
              newStatus['物品库存'] = inventory;
            } else {
              // 其他字符串效果
              newStatus[stat] = value;
            }
          }
        });
        
        return newStatus;
      });
      
      // 如果修为提升，播放特殊音效
      if (hadCultivationImprovement) {
        soundManager.playEffectSound('levelUp');
      }
    }
    
    // 处理成功或失败结果
    if (option.success) {
      // TODO: 处理小游戏成功
      console.log('小游戏成功');
    } else if (option.fail) {
      // TODO: 处理小游戏失败
      console.log('小游戏失败');
    }
    
    // 查找下一个章节
    if (option.nextId) {
      const nextChapter = storyData.chapters.find(
        chapter => chapter.id === option.nextId
      );
      
      if (nextChapter) {
        setCurrentChapter(nextChapter);
        
        // 播放背景音乐
        if (nextChapter.assets && nextChapter.assets.bgm) {
          soundManager.playBackgroundMusic(nextChapter.assets.bgm);
        }
      } else {
        console.error('找不到章节:', option.nextId);
      }
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
      
      // 播放背景音乐
      if (chapter.assets && chapter.assets.bgm) {
        soundManager.playBackgroundMusic(chapter.assets.bgm);
      } else {
        soundManager.playBackgroundMusic('main');
      }
    } else {
      console.error('加载游戏时找不到章节:', chapterId);
    }
    
    setIsLoading(false);
  };

  // 打开/关闭存档界面
  const toggleSaveLoadScreen = () => {
    setShowSaveLoadScreen(!showSaveLoadScreen);
    soundManager.playUISound('click');
  };

  // 打开/关闭修炼界面
  const toggleCultivation = () => {
    setShowCultivation(!showCultivation);
    soundManager.playUISound('click');
  };

  // 处理修炼状态更新
  const handleCultivationUpdate = (effects) => {
    setPlayerStatus(prevStatus => {
      const newStatus = { ...prevStatus };
      
      // 处理修炼效果
      Object.entries(effects).forEach(([stat, value]) => {
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
          if (stat === '体力' && newStatus[stat] > 100) {
            newStatus[stat] = 100;
          }
        }
      });
      
      return newStatus;
    });
  };

  return (
    <div className="App water-ink-container">
      <header className="App-header">
        <h1 className="water-ink-title">仙侠文字RPG</h1>
        <SoundControls />
      </header>
      <main>
        {isLoading ? (
          <div className="loading-container water-ink-text">加载中...</div>
        ) : (
          <>
            <div className="game-controls">
              <PlayerStatus status={playerStatus} />
              <div className="game-buttons">
                <button 
                  className="save-load-button ink-button"
                  onClick={toggleSaveLoadScreen}
                >
                  存档/读档
                </button>
                <button 
                  className="cultivation-button ink-button"
                  onClick={toggleCultivation}
                >
                  修炼
                </button>
                <button 
                  className="reset-button ink-button" 
                  onClick={handleResetGame}
                >
                  重新开始
                </button>
              </div>
            </div>
            
            {showSaveLoadScreen ? (
              <SaveLoadScreen 
                currentChapterId={currentChapter.id}
                playerStatus={playerStatus}
                onLoad={handleLoadGame}
                onClose={() => setShowSaveLoadScreen(false)}
              />
            ) : showCultivation ? (
              <Cultivation 
                playerStatus={playerStatus} 
                onStatusUpdate={handleCultivationUpdate} 
                onClose={() => setShowCultivation(false)} 
              />
            ) : (
              <>
                <StoryDisplay chapter={currentChapter} />
                <Options 
                  options={getCurrentOptions()} 
                  onSelect={handleOptionSelect}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
