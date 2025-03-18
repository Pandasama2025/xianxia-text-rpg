import React from 'react';
import './PlayerStatus.css';

const PlayerStatus = ({ status }) => {
  return (
    <div className="player-status">
      <h3>角色状态</h3>
      <div className="status-grid">
        {Object.entries(status).map(([key, value]) => (
          <div key={key} className="status-item">
            <span className="status-label">{key}:</span>
            <span className="status-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus; 