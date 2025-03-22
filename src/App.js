// 导入React和必要的钩子
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// 导入自定义组件
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import StoryDisplay from './components/StoryDisplay';
import OptionsContainer from './components/OptionsContainer';
import BattleScene from './components/BattleScene';
import CharacterSheet from './components/CharacterSheet';
import Inventory from './components/Inventory';
import CultivationPanel from './components/CultivationPanel';
import TreasuryOptions from './components/TreasuryOptions';
import SettingsPanel from './components/SettingsPanel';

// 导入游戏数据
import storyData from './data/story.json';
import skills from './data/skills.json';
import initialItems from './data/items.json';

// 导入工具函数
import { 
  applyEffects, 
  calculateLevels, 
  getTotalAttributePoints, 
  getAttributes 
} from './utils/gameUtils';

// 导入WebSocket实用工具
import { createWebSocket } from './utils/socketUtils';

// 应用主组件
function App() {
  // 状态管理
  const [player, setPlayer] = useState({
    体力: 100,  // Health
    灵力: 50,    // Spirit/Mana
    修为: 0,     // Cultivation Base
    道行: 0,     // Dao Insight
    智慧: 10,    // Intelligence
    力量: 10,    // Strength
    敏捷: 10,    // Agility
    体魄: 10,    // Constitution
    因果: 0,     // Karma
    声望: 0,     // Reputation/Fame
    金钱: 50,    // Money
    物品: initialItems,
    已解锁技能: [],
    装备: [],
    // 境界名称和等级的对应关系
    境界: {
      name: "凡人",
      level: 0
    }
  });

  const [currentChapter, setCurrentChapter] = useState(storyData.chapters.find(c => c.id === "chapter1"));
  const [storyHistory, setStoryHistory] = useState([]);
  const [inBattle, setInBattle] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [nextChapterId, setNextChapterId] = useState(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCultivation, setShowCultivation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [treasuryOptions, setTreasuryOptions] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // 初始化WebSocket连接
  useEffect(() => {
    const newSocket = createWebSocket();
    
    newSocket.onopen = () => {
      console.log('WebSocket连接已建立');
      // 发送初始化消息
      newSocket.send(JSON.stringify({
        type: 'init',
        userId: 'player1'
      }));
    };
    
    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch(message.type) {
        case 'chapterUpdate':
          handleChapterUpdate(message.data);
          break;
        case 'playerUpdate':
          handlePlayerUpdate(message.data);
          break;
        default:
          console.log('收到未知类型的消息:', message);
      }
    };
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);
  
  // 处理章节更新
  const handleChapterUpdate = (data) => {
    const newChapter = storyData.chapters.find(c => c.id === data.chapterId);
    if (newChapter) {
      setCurrentChapter(newChapter);
      addToStoryHistory(newChapter);
    }
  };
  
  // 处理玩家更新
  const handlePlayerUpdate = (data) => {
    setPlayer(prev => ({
      ...prev,
      ...data
    }));
  };
  
  // 添加到故事历史
  const addToStoryHistory = (chapter) => {
    setStoryHistory(prev => [...prev, {
      title: chapter.title,
      text: chapter.text
    }]);
  };

  // 处理选项选择
  const handleOptionSelect = useCallback((option) => {
    // 如果有效果，应用它们
    if (option.effects) {
      const updatedPlayer = applyEffects(player, option.effects);
      setPlayer(updatedPlayer);
      
      // 通过WebSocket发送玩家更新
      if (socket) {
        socket.send(JSON.stringify({
          type: 'playerUpdate',
          data: updatedPlayer
        }));
      }
    }

    // 将当前章节添加到历史记录中
    addToStoryHistory(currentChapter);

    // 如果选项触发战斗
    if (option.battle) {
      setInBattle(true);
      setCurrentEnemy(option.battle);
      setNextChapterId(option.nextIdOnVictory ? option.nextIdOnVictory : null);
    } 
    // 如果选项触发宝库选择
    else if (option.treasury) {
      setTreasuryOptions(option.treasury);
    }
    // 否则，跳转到下一个章节
    else if (option.nextId) {
      const nextChapter = storyData.chapters.find(c => c.id === option.nextId);
      if (nextChapter) {
        setCurrentChapter(nextChapter);
        
        // 通过WebSocket发送章节更新
        if (socket) {
          socket.send(JSON.stringify({
            type: 'chapterUpdate',
            data: { chapterId: nextChapter.id }
          }));
        }
      }
    }
  }, [currentChapter, player, socket]);

  // 处理战斗结束
  const handleBattleEnd = useCallback((result) => {
    setInBattle(false);
    setCurrentEnemy(null);

    if (result.victory && nextChapterId) {
      // 玩家胜利，跳转到胜利章节
      const victoryChapter = storyData.chapters.find(c => c.id === nextChapterId);
      if (victoryChapter) {
        setCurrentChapter(victoryChapter);
      }
    } else if (!result.victory && currentChapter.options) {
      // 玩家失败，寻找失败选项的nextIdOnDefeat
      const defeatOption = currentChapter.options.find(opt => opt.battle === currentEnemy);
      if (defeatOption && defeatOption.nextIdOnDefeat) {
        const defeatChapter = storyData.chapters.find(c => c.id === defeatOption.nextIdOnDefeat);
        if (defeatChapter) {
          setCurrentChapter(defeatChapter);
        }
      }
    }

    // 应用战斗结果对玩家的影响
    if (result.rewards) {
      const updatedPlayer = applyEffects(player, result.rewards);
      
      // 检查是否获得了新技能
      if (result.newSkills && result.newSkills.length > 0) {
        updatedPlayer.已解锁技能 = [...updatedPlayer.已解锁技能, ...result.newSkills];
      }
      
      setPlayer(updatedPlayer);
    }
  }, [nextChapterId, currentChapter, player, currentEnemy]);

  // 处理宝库选择
  const handleTreasurySelect = useCallback((selection) => {
    // 根据选择更新玩家状态
    if (selection.effect) {
      const updatedPlayer = applyEffects(player, selection.effect);
      setPlayer(updatedPlayer);
    }
    
    // 关闭宝库界面
    setTreasuryOptions(null);
    
    // 如果有下一章节ID，跳转到该章节
    if (selection.nextId) {
      const nextChapter = storyData.chapters.find(c => c.id === selection.nextId);
      if (nextChapter) {
        setCurrentChapter(nextChapter);
      }
    }
  }, [player]);

  // 切换角色面板
  const toggleCharacterSheet = useCallback(() => {
    setShowCharacterSheet(!showCharacterSheet);
    if (!showCharacterSheet) {
      setShowInventory(false);
      setShowCultivation(false);
      setShowSettings(false);
    }
  }, [showCharacterSheet]);

  // 切换物品栏
  const toggleInventory = useCallback(() => {
    setShowInventory(!showInventory);
    if (!showInventory) {
      setShowCharacterSheet(false);
      setShowCultivation(false);
      setShowSettings(false);
    }
  }, [showInventory]);

  // 切换修炼面板
  const toggleCultivation = useCallback(() => {
    setShowCultivation(!showCultivation);
    if (!showCultivation) {
      setShowCharacterSheet(false);
      setShowInventory(false);
      setShowSettings(false);
    }
  }, [showCultivation]);

  // 切换设置面板
  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
    if (!showSettings) {
      setShowCharacterSheet(false);
      setShowInventory(false);
      setShowCultivation(false);
    }
  }, [showSettings]);

  // 更新玩家属性
  const updatePlayer = useCallback((newAttributes) => {
    setPlayer(prev => ({
      ...prev,
      ...newAttributes
    }));
  }, []);

  // 使用道具
  const useItem = useCallback((itemId) => {
    const item = player.物品.find(i => i.id === itemId);
    if (!item) return;

    // 应用道具效果
    if (item.effects) {
      const updatedPlayer = applyEffects(player, item.effects);
      
      // 更新物品数量
      const updatedItems = updatedPlayer.物品.map(i => {
        if (i.id === itemId) {
          return { ...i, count: i.count - 1 };
        }
        return i;
      }).filter(i => i.count > 0);
      
      updatedPlayer.物品 = updatedItems;
      setPlayer(updatedPlayer);
    }
  }, [player]);

  // 计算玩家等级和属性
  useEffect(() => {
    // 根据修为计算境界等级
    const cultivationLevels = calculateLevels(player.修为);
    
    // 只有在境界等级变化时才更新
    if (player.境界.level !== cultivationLevels.level) {
      setPlayer(prev => ({
        ...prev,
        境界: cultivationLevels
      }));
    }
  }, [player.修为, player.境界.level]);

  // 渲染主应用界面
  return (
    <div className="App">
      <Header 
        toggleCharacterSheet={toggleCharacterSheet}
        toggleInventory={toggleInventory}
        toggleCultivation={toggleCultivation}
        toggleSettings={toggleSettings}
      />
      
      <div className="main-content">
        <StatusBar player={player} />
        
        {inBattle ? (
          <BattleScene 
            enemy={currentEnemy}
            player={player}
            onBattleEnd={handleBattleEnd}
            playerSkills={player.已解锁技能.map(skillId => 
              skills.find(s => s.id === skillId)
            ).filter(Boolean)}
          />
        ) : treasuryOptions ? (
          <TreasuryOptions 
            options={treasuryOptions} 
            onSelect={handleTreasurySelect} 
          />
        ) : (
          <>
            <StoryDisplay 
              title={currentChapter.title}
              text={currentChapter.text}
              history={storyHistory}
            />
            <OptionsContainer 
              options={currentChapter.options} 
              onSelect={handleOptionSelect}
              player={player}
            />
          </>
        )}
      </div>
      
      {showCharacterSheet && (
        <CharacterSheet 
          player={player} 
          onClose={toggleCharacterSheet}
          onUpdate={updatePlayer}
          totalPoints={getTotalAttributePoints(player)}
          attributes={getAttributes()}
        />
      )}
      
      {showInventory && (
        <Inventory 
          items={player.物品} 
          onUseItem={useItem}
          onClose={toggleInventory}
        />
      )}
      
      {showCultivation && (
        <CultivationPanel 
          player={player}
          onClose={toggleCultivation}
          onMeditate={() => {
            const updatedPlayer = { ...player, 修为: player.修为 + 10, 灵力: Math.min(player.灵力 + 5, 100) };
            setPlayer(updatedPlayer);
          }}
        />
      )}
      
      {showSettings && (
        <SettingsPanel 
          onClose={toggleSettings}
          onReset={() => {
            // 重置游戏状态
            setPlayer({
              体力: 100,
              灵力: 50,
              修为: 0,
              道行: 0,
              智慧: 10,
              力量: 10,
              敏捷: 10,
              体魄: 10,
              因果: 0,
              声望: 0,
              金钱: 50,
              物品: initialItems,
              已解锁技能: [],
              装备: [],
              境界: {
                name: "凡人",
                level: 0
              }
            });
            setCurrentChapter(storyData.chapters.find(c => c.id === "chapter1"));
            setStoryHistory([]);
            setInBattle(false);
            setCurrentEnemy(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
