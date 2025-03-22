/**
 * 战斗系统组件
 * 
 * 功能说明：
 * 1. 提供文字描述的战斗场景
 * 2. 支持基础攻击、防御和技能使用
 * 3. 战斗结果会影响玩家状态（修为、灵力等）
 * 4. 支持音效和动画效果
 * 
 * 与剧情整合：
 * - 在story.json中，选项可以使用battle字段触发战斗
 * - 例如：{ "text": "拔剑应战", "battle": "山贼" }
 * - 战斗胜利或失败后，可以跳转到不同的章节（通过battle.nextChapterOnVictory和battle.nextChapterOnDefeat字段）
 * 
 * 敌人类型：
 * - 山贼：基础敌人，低攻击力和防御力
 * - 炼气修士：中等难度，平衡的攻防属性
 * - 黑煞狼：高攻击，低防御的敌人
 * - 邪修者：高级敌人，高攻高防
 * 
 * 技能系统：
 * - 技能根据玩家修为自动解锁
 * - 使用技能消耗灵力，但造成更高伤害
 */

import React, { useState, useEffect } from 'react';
import './BattleScene.css';
import '../styles/WaterInkTheme.css';
import soundManager from '../audio/soundManager';

// 敌人数据定义
const enemies = {
  "山贼": {
    name: "山贼",
    health: 50,
    attack: 5,
    defense: 2,
    description: "手持短刀的山中盗匪，欲劫走你的灵石。",
    rewards: { 
      '修为': 15,
      '因果': -5
    }
  },
  "炼气修士": {
    name: "炼气修士",
    health: 80,
    attack: 8,
    defense: 5,
    description: "身着灰色道袍的修士，正在试炼中想要击败你。",
    rewards: { 
      '修为': 30,
      '因果': 0
    }
  },
  "黑煞狼": {
    name: "黑煞狼",
    health: 100,
    attack: 12,
    defense: 3,
    description: "身形巨大的灵兽，闪烁着冷幽的双眼。",
    rewards: { 
      '修为': 40,
      '因果': 0
    }
  },
  "邪修者": {
    name: "邪修者",
    health: 120,
    attack: 15,
    defense: 10,
    description: "身着黑袍，气息不祥的修士，修炼的是禁忌功法。",
    rewards: { 
      '修为': 50,
      '因果': -10
    }
  }
};

const BattleScene = ({ player, onBattleEnd, enemy, playerSkills = [] }) => {
  // 战斗状态
  const [playerHealth, setPlayerHealth] = useState(player.体力);
  const [playerEnergy, setPlayerEnergy] = useState(player.灵力);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [enemyData, setEnemyData] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [showSkills, setShowSkills] = useState(false);
  const [turn, setTurn] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [skillCastEffect, setSkillCastEffect] = useState(null);

  // 初始化战斗
  useEffect(() => {
    if (enemy && enemies[enemy]) {
      const currentEnemy = enemies[enemy];
      setEnemyData(currentEnemy);
      setEnemyHealth(currentEnemy.health);
      setBattleLog([`你遇到了${currentEnemy.name}！${currentEnemy.description}`]);
      
      // 播放战斗音效
      try {
        soundManager.playEffectSound('battle_start');
      } catch (error) {
        console.error("无法播放音效:", error);
      }
    }
  }, [enemy]);

  // 检查战斗结束条件
  useEffect(() => {
    if (!enemyData || battleEnded) return;
    
    // 玩家胜利
    if (enemyHealth <= 0) {
      setBattleEnded(true);
      setBattleResult('victory');
      setBattleLog(prevLog => [...prevLog, `你击败了${enemyData.name}！`]);
      
      // 播放胜利音效
      try {
        soundManager.playEffectSound('victory');
      } catch (error) {
        console.error("无法播放音效:", error);
      }
      
      // 延迟结束战斗，展示战斗结果
      setTimeout(() => {
        onBattleEnd({ 
          victory: true, 
          rewards: enemyData.rewards
        });
      }, 2000);
    }
    
    // 玩家失败
    if (playerHealth <= 0) {
      setBattleEnded(true);
      setBattleResult('defeat');
      setBattleLog(prevLog => [...prevLog, `你被${enemyData.name}击败了...`]);
      
      // 播放失败音效
      try {
        soundManager.playEffectSound('defeat');
      } catch (error) {
        console.error("无法播放音效:", error);
      }
      
      // 延迟结束战斗，展示战斗结果
      setTimeout(() => {
        onBattleEnd({ 
          victory: false 
        });
      }, 2000);
    }
  }, [enemyHealth, playerHealth, enemyData, onBattleEnd, battleEnded]);

  // 敌人行动
  const enemyTurn = () => {
    if (battleEnded || !enemyData) return;
    
    // 计算伤害
    const attackStrength = Math.random() > 0.8 ? 'critical' : 'normal';
    const baseDamage = enemyData.attack;
    const damage = attackStrength === 'critical' 
      ? Math.floor(baseDamage * 1.5) 
      : baseDamage;
    
    // 应用防御减伤
    const finalDamage = Math.max(1, damage - (player.体魄 / 10));
    
    // 更新玩家生命值
    setPlayerHealth(prevHealth => Math.max(0, prevHealth - finalDamage));
    
    // 更新战斗日志
    const message = attackStrength === 'critical'
      ? `${enemyData.name}发动了猛烈攻击，造成${finalDamage}点伤害！`
      : `${enemyData.name}攻击了你，造成${finalDamage}点伤害！`;
    setBattleLog(prevLog => [...prevLog, message]);
    
    // 播放受击音效
    try {
      soundManager.playEffectSound('hit');
    } catch (error) {
      console.error("无法播放音效:", error);
    }
  };

  // 普通攻击
  const handleAttack = () => {
    if (cooldown || battleEnded) return;
    
    // 设置冷却
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);
    
    // 计算玩家伤害
    const playerBaseDamage = 5 + Math.floor(player.力量 / 2);
    const critChance = player.敏捷 / 100; // 敏捷影响暴击概率
    const isCritical = Math.random() < critChance;
    
    let damage = playerBaseDamage;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }
    
    // 应用敌人防御
    const finalDamage = Math.max(1, damage - enemyData.defense);
    
    // 更新敌人生命值
    setEnemyHealth(prevHealth => Math.max(0, prevHealth - finalDamage));
    
    // 更新战斗日志
    const message = isCritical
      ? `你发动会心一击，对${enemyData.name}造成${finalDamage}点伤害！`
      : `你攻击了${enemyData.name}，造成${finalDamage}点伤害！`;
    setBattleLog(prevLog => [...prevLog, message]);
    
    // 播放攻击音效
    try {
      soundManager.playEffectSound('attack');
    } catch (error) {
      console.error("无法播放音效:", error);
    }
    
    // 如果敌人没死，轮到敌人行动
    if (enemyHealth - finalDamage > 0) {
      setTimeout(() => {
        enemyTurn();
      }, 1000);
    }
    
    // 更新回合数
    setTurn(prevTurn => prevTurn + 1);
  };

  // 防御
  const handleDefend = () => {
    if (cooldown || battleEnded) return;
    
    // 设置冷却
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);
    
    // 临时增加防御并恢复一些生命值
    const healAmount = Math.floor(player.体魄 / 5);
    setPlayerHealth(prevHealth => Math.min(player.体力, prevHealth + healAmount));
    setPlayerEnergy(prevEnergy => Math.min(player.灵力, prevEnergy + 5));
    
    // 更新战斗日志
    setBattleLog(prevLog => [...prevLog, `你采取防御姿态，恢复了${healAmount}点生命和5点灵力。`]);
    
    // 播放防御音效
    try {
      soundManager.playEffectSound('defend');
    } catch (error) {
      console.error("无法播放音效:", error);
    }
    
    // 轮到敌人行动，但伤害减半
    const originalAttack = enemyData.attack;
    enemyData.attack = Math.floor(originalAttack / 2);
    
    setTimeout(() => {
      enemyTurn();
      enemyData.attack = originalAttack; // 恢复原始攻击力
    }, 1000);
    
    // 更新回合数
    setTurn(prevTurn => prevTurn + 1);
  };

  // 使用技能
  const handleUseSkill = (skill) => {
    if (cooldown || battleEnded || !skill) return;
    
    // 检查灵力是否足够
    if (playerEnergy < skill.cost) {
      setBattleLog(prevLog => [...prevLog, `灵力不足，无法使用${skill.name}！`]);
      return;
    }
    
    // 设置冷却
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1200);
    
    // 消耗灵力
    setPlayerEnergy(prevEnergy => Math.max(0, prevEnergy - skill.cost));
    
    // 计算技能伤害
    const baseDamage = skill.baseDamage + Math.floor(player.修为 / 10);
    const damageMultiplier = 1 + (player.智慧 / 100); // 智慧增加技能伤害
    const finalDamage = Math.max(1, Math.floor((baseDamage * damageMultiplier) - enemyData.defense / 2));
    
    // 更新敌人生命值
    setEnemyHealth(prevHealth => Math.max(0, prevHealth - finalDamage));
    
    // 技能特效
    setSkillCastEffect(skill.name);
    setTimeout(() => setSkillCastEffect(null), 800);
    
    // 更新战斗日志
    setBattleLog(prevLog => [...prevLog, `你使用了${skill.name}，对${enemyData.name}造成${finalDamage}点伤害！`]);
    
    // 播放技能音效
    try {
      soundManager.playEffectSound('skill');
    } catch (error) {
      console.error("无法播放音效:", error);
    }
    
    // 如果敌人没死，轮到敌人行动
    if (enemyHealth - finalDamage > 0) {
      setTimeout(() => {
        enemyTurn();
      }, 1500);
    }
    
    // 关闭技能菜单
    setShowSkills(false);
    
    // 更新回合数
    setTurn(prevTurn => prevTurn + 1);
  };

  // 计算生命条百分比
  const playerHealthPercent = (playerHealth / player.体力) * 100;
  const playerEnergyPercent = (playerEnergy / player.灵力) * 100;
  const enemyHealthPercent = enemyData ? (enemyHealth / enemyData.health) * 100 : 0;

  // 渲染战斗界面
  return (
    <div className="battle-scene">
      <div className="battle-header">
        <h2>战斗：{enemyData ? enemyData.name : '未知敌人'}</h2>
      </div>
      
      <div className="battle-status">
        <div className="player-status">
          <div className="status-name">你的状态</div>
          <div className="health-bar">
            <div className="health-bar-label">生命: {playerHealth}/{player.体力}</div>
            <div className="health-bar-outer">
              <div className="health-bar-inner" style={{width: `${playerHealthPercent}%`}}></div>
            </div>
          </div>
          <div className="energy-bar">
            <div className="energy-bar-label">灵力: {playerEnergy}/{player.灵力}</div>
            <div className="energy-bar-outer">
              <div className="energy-bar-inner" style={{width: `${playerEnergyPercent}%`}}></div>
            </div>
          </div>
        </div>
        
        <div className="enemy-status">
          <div className="status-name">{enemyData ? enemyData.name : '敌人'}</div>
          <div className="health-bar">
            <div className="health-bar-label">生命: {enemyHealth}/{enemyData ? enemyData.health : '?'}</div>
            <div className="health-bar-outer">
              <div className="health-bar-inner enemy" style={{width: `${enemyHealthPercent}%`}}></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="battle-log">
        {battleLog.map((log, index) => (
          <div key={index} className="battle-log-entry">
            {log}
          </div>
        ))}
      </div>
      
      {skillCastEffect && (
        <div className="skill-cast-effect">
          {skillCastEffect}
        </div>
      )}
      
      <div className="battle-actions">
        {!battleEnded ? (
          <>
            <button 
              className="action-button attack" 
              onClick={handleAttack}
              disabled={cooldown}
            >
              攻击
            </button>
            <button 
              className="action-button defend" 
              onClick={handleDefend}
              disabled={cooldown}
            >
              防御
            </button>
            <button 
              className="action-button skills" 
              onClick={() => setShowSkills(!showSkills)}
              disabled={cooldown || playerSkills.length === 0}
            >
              技能
            </button>
            
            {showSkills && (
              <div className="skill-menu">
                {playerSkills.map((skill, index) => (
                  <button 
                    key={index}
                    className="skill-button"
                    disabled={playerEnergy < skill.cost || cooldown}
                    onClick={() => handleUseSkill(skill)}
                  >
                    {skill.name} (灵力: {skill.cost})
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="battle-result">
            <div className={`result-message ${battleResult}`}>
              {battleResult === 'victory' ? '战斗胜利！' : '战斗失败！'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleScene;