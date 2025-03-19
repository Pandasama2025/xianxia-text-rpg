import React from 'react';
import './PlayerStatus.css';
import '../styles/WaterInkTheme.css';

const PlayerStatus = ({ status }) => {
  return (
    <div className="player-status ink-status-bar">
      <h3 className="water-ink-title status-header">角色状态</h3>
      <div className="status-grid">
        {Object.entries(status).map(([key, value]) => (
          <div key={key} className="status-item ink-status-item">
            <span className="status-label ink-status-label">{key}:</span>
            <span className="status-value ink-status-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus; 