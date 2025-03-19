import React from 'react';
import './PlayerStatus.css';
import '../styles/WaterInkTheme.css';

const PlayerStatus = ({ status }) => {
  if (!status) return null;

  // Core attributes that should always be shown
  const coreAttributes = ['修为', '灵力', '体力', '道心'];
  
  // Special progression attributes
  const progressionAttributes = ['因果值', '执念值', '木樨剑意', '煞血剑意'];
  
  // Identity attributes
  const identityAttributes = ['剑意类型', '宗门立场'];
  
  // Flag attributes (boolean values)
  const flagAttributes = Object.entries(status)
    .filter(([key, value]) => 
      typeof value === 'boolean' && 
      !coreAttributes.includes(key) && 
      !progressionAttributes.includes(key) &&
      !identityAttributes.includes(key)
    )
    .map(([key]) => key);
  
  // Get color for a progress bar based on value and attribute type
  const getProgressColor = (attr, value) => {
    if (attr === '灵力' || attr === '体力') {
      if (value < 30) return '#e74c3c'; // Red for low
      if (value < 70) return '#f39c12'; // Orange for medium
      return '#27ae60'; // Green for high
    }
    
    if (attr === '因果值') {
      if (value < -30) return '#8e44ad'; // Purple for very negative
      if (value < 0) return '#e74c3c'; // Red for negative
      if (value > 30) return '#27ae60'; // Green for very positive
      if (value > 0) return '#3498db'; // Blue for positive
      return '#95a5a6'; // Gray for neutral
    }
    
    if (attr === '执念值') {
      if (value > 100) return '#8e44ad'; // Purple for high
      if (value > 50) return '#e67e22'; // Orange for medium
      return '#3498db'; // Blue for low
    }
    
    // Default color
    return '#3498db';
  };
  
  // Render a progress bar for numeric attributes
  const renderProgressBar = (attr, value, max = 100) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const color = getProgressColor(attr, value);
    
    return (
      <div className="status-progress-container">
        <div 
          className="status-progress-bar" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
        <span className="status-progress-text">{value}</span>
      </div>
    );
  };
  
  // Render boolean flags as badges
  const renderFlag = (attr, value) => {
    return (
      <span className={`flag-badge ${value ? 'flag-true' : 'flag-false'}`}>
        {value ? '✓' : '✗'}
      </span>
    );
  };
  
  // Render special identity information
  const renderIdentity = (attr, value) => {
    let badgeClass = 'identity-badge';
    
    if (attr === '宗门立场') {
      if (value === '凌尘剑宗') badgeClass += ' sect-sword';
      else if (value === '黄泉魔宗') badgeClass += ' sect-demon';
      else if (value === '散修') badgeClass += ' sect-independent';
    }
    
    if (attr === '剑意类型') {
      if (value === '木樨') badgeClass += ' sword-wood';
      else if (value === '煞血') badgeClass += ' sword-blood';
      else if (value === '问道') badgeClass += ' sword-dao';
    }
    
    return (
      <span className={badgeClass}>
        {value}
      </span>
    );
  };

  return (
    <div className="player-status water-ink-paper">
      <h3 className="status-title">修仙者状态</h3>
      
      <div className="status-section">
        <h4 className="section-title">核心属性</h4>
        {coreAttributes.map(attr => 
          status[attr] !== undefined && (
            <div key={attr} className="status-item">
              <div className="status-label">{attr}</div>
              {renderProgressBar(attr, status[attr])}
            </div>
          )
        )}
      </div>
      
      <div className="status-section">
        <h4 className="section-title">修行进度</h4>
        {progressionAttributes.map(attr => 
          status[attr] !== undefined && (
            <div key={attr} className="status-item">
              <div className="status-label">{attr}</div>
              {attr === '因果值' 
                ? renderProgressBar(attr, status[attr], 100) 
                : renderProgressBar(attr, status[attr])}
            </div>
          )
        )}
      </div>
      
      <div className="status-section identity-section">
        <h4 className="section-title">身份信息</h4>
        {identityAttributes.map(attr => 
          status[attr] !== undefined && (
            <div key={attr} className="status-item identity-item">
              <div className="status-label">{attr}</div>
              <div className="status-value">
                {renderIdentity(attr, status[attr])}
              </div>
            </div>
          )
        )}
      </div>
      
      {flagAttributes.length > 0 && (
        <div className="status-section flags-section">
          <h4 className="section-title">事件记录</h4>
          <div className="flags-container">
            {flagAttributes.map(attr => (
              <div key={attr} className="flag-item">
                {renderFlag(attr, status[attr])}
                <span className="flag-label">{attr}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {status['物品库存'] && status['物品库存'].length > 0 && (
        <div className="status-section">
          <h4 className="section-title">物品</h4>
          <div className="items-container">
            {status['物品库存'].map((item, index) => (
              <div key={index} className="item-entry">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatus; 