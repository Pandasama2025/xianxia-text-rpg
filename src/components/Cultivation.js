import React, { useState, useEffect, useRef } from 'react';
import './Cultivation.css';
import soundManager from '../audio/soundManager';

// 定义修炼境界（移到组件外部避免重复创建）
const cultivationRealms = [
  { name: "练气期", threshold: 0 },
  { name: "筑基期", threshold: 100 },
  { name: "结丹期", threshold: 500 },
  { name: "元婴期", threshold: 1000 },
  { name: "化神期", threshold: 2000 },
  { name: "炼虚期", threshold: 5000 },
  { name: "合体期", threshold: 10000 },
  { name: "大乘期", threshold: 20000 },
  { name: "渡劫期", threshold: 50000 },
];

// 定义技能（移到组件外部避免重复创建）
const skills = [
  { id: "基础剑法", name: "基础剑法", description: "练习基本剑势，增强身体协调性", unlockThreshold: 0, effect: { "修为": 2 } },
  { id: "御气术", name: "御气术", description: "操控体内灵气在经脉中流转", unlockThreshold: 50, effect: { "修为": 3, "灵力": 5 } },
  { id: "凝神诀", name: "凝神诀", description: "提高心神集中，增强修炼效率", unlockThreshold: 150, effect: { "修为": 4, "道心": 2 } },
  { id: "剑气化形", name: "剑气化形", description: "将剑气实体化，可远程攻击", unlockThreshold: 300, effect: { "修为": 6, "灵力": -10 } },
  { id: "小周天", name: "小周天", description: "灵气在体内小周天循环，强化体魄", unlockThreshold: 600, effect: { "修为": 8, "体力": 5 } },
  { id: "大周天", name: "大周天", description: "灵气在体内大周天循环，强化灵力", unlockThreshold: 1200, effect: { "修为": 12, "灵力": 10 } },
  { id: "驭剑术", name: "驭剑术", description: "操控飞剑远程攻击敌人", unlockThreshold: 2500, effect: { "修为": 15, "灵力": -20 } },
  { id: "剑气长虹", name: "剑气长虹", description: "剑气贯穿长空，威力巨大", unlockThreshold: 6000, effect: { "修为": 25, "灵力": -30 } },
  { id: "无相剑意", name: "无相剑意", description: "参悟剑的本质，心剑合一", unlockThreshold: 15000, effect: { "修为": 40, "道心": 10 } },
];

const Cultivation = ({ playerStatus, onStatusUpdate, onClose }) => {
  const [cooldown, setCooldown] = useState(false);
  const [dailyCultivationCount, setDailyCultivationCount] = useState(0);
  const [unlockedSkills, setUnlockedSkills] = useState([]);
  const [showSkillDetails, setShowSkillDetails] = useState(null);
  const [showBreakthroughEffect, setShowBreakthroughEffect] = useState(false);
  const [newUnlockedSkill, setNewUnlockedSkill] = useState(null);
  const [previousRealm, setPreviousRealm] = useState(null);
  
  // 使用ref来存储上一次的修为值，避免无限循环
  const prevCultivationLevel = useRef(playerStatus['修为']);
  // 使用ref来存储上一次的解锁技能，避免无限循环
  const prevUnlockedSkills = useRef([]);

  // 获取当前境界
  const getCurrentRealm = () => {
    for (let i = cultivationRealms.length - 1; i >= 0; i--) {
      if (playerStatus['修为'] >= cultivationRealms[i].threshold) {
        return cultivationRealms[i];
      }
    }
    return cultivationRealms[0];
  };

  // 获取下一境界
  const getNextRealm = () => {
    for (let i = 0; i < cultivationRealms.length; i++) {
      if (playerStatus['修为'] < cultivationRealms[i].threshold) {
        return cultivationRealms[i];
      }
    }
    return null; // 已达最高境界
  };

  // 计算到下一境界的进度
  const getProgress = () => {
    const currentRealm = getCurrentRealm();
    const nextRealm = getNextRealm();
    
    if (!nextRealm) return 100; // 已达最高境界
    
    const currentThreshold = currentRealm.threshold;
    const nextThreshold = nextRealm.threshold;
    const progress = ((playerStatus['修为'] - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  // 初始化和境界变化检测
  useEffect(() => {
    const currentRealm = getCurrentRealm();
    
    // 第一次加载时初始化上一个境界
    if (previousRealm === null) {
      setPreviousRealm(currentRealm);
    } 
    // 检测境界突破
    else if (previousRealm.name !== currentRealm.name) {
      // 播放突破音效
      soundManager.playEffectSound('realmBreakthrough');
      
      // 显示突破效果
      setShowBreakthroughEffect(true);
      
      // 3秒后关闭突破效果
      setTimeout(() => {
        setShowBreakthroughEffect(false);
      }, 3000);
      
      // 更新上一个境界
      setPreviousRealm(currentRealm);
    }
  }, [playerStatus['修为'], previousRealm]);

  // 检查可解锁的技能 - 修复无限循环问题
  useEffect(() => {
    // 如果修为没有变化，不需要重新计算
    if (prevCultivationLevel.current === playerStatus['修为']) {
      return;
    }
    
    // 更新ref中的修为值
    prevCultivationLevel.current = playerStatus['修为'];
    
    // 获取当前可解锁的技能
    const currentUnlocked = skills.filter(skill => 
      playerStatus['修为'] >= skill.unlockThreshold
    ).map(skill => skill.id);
    
    // 检查是否有新解锁的技能，与上次的比较
    const previousUnlocked = prevUnlockedSkills.current;
    if (previousUnlocked.length > 0) {
      const newUnlocked = currentUnlocked.filter(
        skillId => !previousUnlocked.includes(skillId)
      );
      
      if (newUnlocked.length > 0) {
        // 播放技能解锁音效
        soundManager.playEffectSound('skillUnlock');
        
        // 设置新解锁技能，用于显示通知
        const skill = skills.find(s => s.id === newUnlocked[0]);
        setNewUnlockedSkill(skill);
        
        // 3秒后关闭通知
        setTimeout(() => {
          setNewUnlockedSkill(null);
        }, 3000);
      }
    }
    
    // 更新ref和状态中的解锁技能列表
    prevUnlockedSkills.current = currentUnlocked;
    setUnlockedSkills(currentUnlocked);
  }, [playerStatus['修为']]); // 只依赖修为变化

  // 初始化技能
  useEffect(() => {
    // 只在组件首次挂载时进行初始化
    const initialUnlocked = skills.filter(skill => 
      playerStatus['修为'] >= skill.unlockThreshold
    ).map(skill => skill.id);
    
    prevUnlockedSkills.current = initialUnlocked;
    setUnlockedSkills(initialUnlocked);
  }, []); // 空依赖数组，仅组件挂载时执行一次

  // 基础修炼
  const handleBasicCultivation = () => {
    if (cooldown) return;
    
    // 播放修炼音效
    soundManager.playEffectSound('cultivate');
    
    // 基础修炼效果
    const baseIncrease = 10;
    let actualIncrease = baseIncrease;
    
    // 根据道心增加修炼效果
    if (playerStatus['道心'] > 70) {
      actualIncrease += 5;
    }
    
    // 如果灵力过低，减少修炼效果
    if (playerStatus['灵力'] < 30) {
      actualIncrease = Math.max(5, actualIncrease - 5);
    }
    
    // 更新状态
    onStatusUpdate({
      '修为': actualIncrease,
      '灵力': -5,
      '体力': -3
    });
    
    // 设置冷却
    setCooldown(true);
    setDailyCultivationCount(prev => prev + 1);
    
    setTimeout(() => {
      setCooldown(false);
    }, 3000);
  };

  // 使用技能
  const handleUseSkill = (skill) => {
    if (cooldown) return;
    
    // 播放技能音效
    soundManager.playEffectSound('skill');
    
    // 应用技能效果
    onStatusUpdate(skill.effect);
    
    // 设置冷却
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 5000);
  };

  // 显示技能详情
  const toggleSkillDetails = (skillId) => {
    if (showSkillDetails === skillId) {
      setShowSkillDetails(null);
    } else {
      setShowSkillDetails(skillId);
      soundManager.playUISound('click');
    }
  };

  // 专注修炼（消耗更多灵力和体力，但获得更多修为）
  const handleIntensiveCultivation = () => {
    if (cooldown) return;
    
    // 检查灵力和体力是否足够
    if (playerStatus['灵力'] < 20 || playerStatus['体力'] < 15) {
      alert('灵力或体力不足，无法进行专注修炼！');
      return;
    }
    
    // 播放修炼音效
    soundManager.playEffectSound('cultivate');
    
    // 专注修炼效果
    const baseIncrease = 25;
    let actualIncrease = baseIncrease;
    
    // 根据道心增加修炼效果
    if (playerStatus['道心'] > 70) {
      actualIncrease += 10;
    }
    
    // 更新状态
    onStatusUpdate({
      '修为': actualIncrease,
      '灵力': -20,
      '体力': -15,
      '道心': -2
    });
    
    // 设置冷却
    setCooldown(true);
    setDailyCultivationCount(prev => prev + 1);
    
    setTimeout(() => {
      setCooldown(false);
    }, 5000);
  };

  const currentRealm = getCurrentRealm();
  const nextRealm = getNextRealm();
  const progress = getProgress();

  return (
    <div className="cultivation-container water-ink-container">
      {showBreakthroughEffect && (
        <div className="breakthrough-effect">
          <div className="breakthrough-content">
            <h3>突破！</h3>
            <p>恭喜你突破到了 <span>{currentRealm.name}</span></p>
          </div>
        </div>
      )}
      
      {newUnlockedSkill && (
        <div className="skill-unlock-notification">
          <div className="notification-content">
            <h3>技能解锁！</h3>
            <p>你已解锁新技能： <span>{newUnlockedSkill.name}</span></p>
          </div>
        </div>
      )}
      
      <div className="cultivation-header">
        <h2 className="water-ink-title">修炼室</h2>
        <button className="close-button ink-button" onClick={onClose}>返回</button>
      </div>
      
      <div className="cultivation-status">
        <div className="realm-info">
          <div className="current-realm">当前境界: <span>{currentRealm.name}</span></div>
          {nextRealm && (
            <div className="next-realm">下一境界: <span>{nextRealm.name}</span> (需要 {nextRealm.threshold} 修为)</div>
          )}
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">{progress.toFixed(1)}%</div>
        </div>
        
        <div className="player-attributes">
          <div className="attribute">修为: <span>{playerStatus['修为']}</span></div>
          <div className="attribute">灵力: <span>{playerStatus['灵力']}</span></div>
          <div className="attribute">体力: <span>{playerStatus['体力']}</span></div>
          <div className="attribute">道心: <span>{playerStatus['道心']}</span></div>
        </div>
      </div>
      
      <div className="cultivation-actions">
        <div className="cultivation-buttons">
          <button 
            className={`cultivation-button ink-button ${cooldown ? 'disabled' : ''}`}
            onClick={handleBasicCultivation}
            disabled={cooldown}
          >
            {cooldown ? '调息中...' : '日常修炼'}
          </button>
          
          <button 
            className={`intensive-button ink-button ${cooldown ? 'disabled' : ''}`}
            onClick={handleIntensiveCultivation}
            disabled={cooldown || playerStatus['灵力'] < 20 || playerStatus['体力'] < 15}
          >
            专注修炼 (灵力-20, 体力-15)
          </button>
        </div>
        <div className="cultivation-count">今日修炼次数: {dailyCultivationCount}</div>
      </div>
      
      <div className="skills-section">
        <h3 className="water-ink-title">修炼技能</h3>
        <div className="skills-list">
          {skills.map(skill => {
            const isUnlocked = unlockedSkills.includes(skill.id);
            return (
              <div 
                key={skill.id} 
                className={`skill-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => isUnlocked && toggleSkillDetails(skill.id)}
              >
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  {!isUnlocked && (
                    <span className="skill-unlock-info">
                      需要 {skill.unlockThreshold} 修为解锁
                    </span>
                  )}
                </div>
                
                {showSkillDetails === skill.id && (
                  <div className="skill-details">
                    <p className="skill-description">{skill.description}</p>
                    <div className="skill-effects">
                      {Object.entries(skill.effect).map(([stat, value]) => (
                        <div key={stat} className="skill-effect">
                          {stat}: {value > 0 ? '+' : ''}{value}
                        </div>
                      ))}
                    </div>
                    <button 
                      className={`use-skill-button ink-button ${cooldown ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseSkill(skill);
                      }}
                      disabled={cooldown}
                    >
                      {cooldown ? '冷却中...' : '使用技能'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Cultivation; 