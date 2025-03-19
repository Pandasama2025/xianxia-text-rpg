import React, { useState } from 'react';
import './Options.css';
import '../styles/WaterInkTheme.css';

const Options = ({ options, onSelect, playerStatus }) => {
  const [hoveredOption, setHoveredOption] = useState(null);
  
  if (!options || options.length === 0) return null;
  
  // Helper function to render effect with an icon
  const renderEffect = (stat, value) => {
    let icon = '';
    let className = 'effect-neutral';
    
    if (value > 0) {
      icon = '↑ ';
      className = 'effect-positive';
    } else if (value < 0) {
      icon = '↓ ';
      className = 'effect-negative';
    }
    
    return (
      <div key={stat} className={`option-effect ${className}`}>
        {icon}{stat}: {value > 0 ? '+' : ''}{value}
      </div>
    );
  };
  
  // Check if an option should be disabled based on conditions
  const isOptionDisabled = (option) => {
    if (!option.conditions || !playerStatus) return false;
    
    return Object.entries(option.conditions).some(([stat, value]) => {
      // If player doesn't have the required item
      if (stat === '物品' && !playerStatus[value]) {
        return true;
      }
      
      // If player doesn't meet the stat requirement
      if (playerStatus[stat] === undefined || playerStatus[stat] < value) {
        return true;
      }
      
      return false;
    });
  };
  
  // Render all effects including items and skills
  const renderAllEffects = (option) => {
    if (!option.effects) return null;
    
    return (
      <div className="tooltip-effects">
        {Object.entries(option.effects).map(([stat, value]) => {
          // Handle numeric effects
          if (typeof value === 'number') {
            return renderEffect(stat, value);
          }
          
          // Handle special effects like items or skills
          if (typeof value === 'string' || typeof value === 'boolean') {
            const isPositive = value === true || (typeof value === 'string' && !value.includes('-'));
            const className = isPositive ? 'effect-positive' : 'effect-negative';
            const icon = isPositive ? '+ ' : '- ';
            
            return (
              <div key={stat} className={`option-effect ${className}`}>
                {icon}{stat}: {typeof value === 'boolean' ? (value ? '获得' : '失去') : value}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  return (
    <div className="options-container">
      {options.map((option, index) => {
        const disabled = isOptionDisabled(option);
        
        return (
          <div 
            key={index}
            className={`option-wrapper ${disabled ? 'option-disabled' : ''}`}
            onMouseEnter={() => setHoveredOption(index)}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <button 
              className={`option-button ink-button ${disabled ? 'disabled-button' : ''}`}
              onClick={() => !disabled && onSelect(option)}
              disabled={disabled}
            >
              {option.text}
              {option.conditions && (
                <span className="option-condition-indicator">⚡</span>
              )}
            </button>
            
            {hoveredOption === index && (
              <div className="option-effects-tooltip">
                <div className="tooltip-title">选择影响</div>
                
                {option.conditions && (
                  <div className="tooltip-conditions">
                    <div className="conditions-title">需要条件</div>
                    {Object.entries(option.conditions).map(([stat, value]) => (
                      <div 
                        key={stat}
                        className={`condition-item ${
                          playerStatus && playerStatus[stat] >= value ? 'condition-met' : 'condition-not-met'
                        }`}
                      >
                        {stat}: {value}
                      </div>
                    ))}
                  </div>
                )}
                
                {renderAllEffects(option)}
                
                {option.notes && (
                  <div className="option-notes">
                    <div className="notes-title">备注</div>
                    <div className="notes-text">{option.notes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Options; 