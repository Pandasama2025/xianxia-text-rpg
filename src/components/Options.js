import React from 'react';
import './Options.css';
import '../styles/WaterInkTheme.css';

const Options = ({ options, onSelect }) => {
  if (!options || options.length === 0) return null;
  
  return (
    <div className="options-container">
      {options.map((option, index) => (
        <button 
          key={index} 
          className="option-button ink-button"
          onClick={() => onSelect(option)}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

export default Options; 