// StudyTaskCard.js
import React from 'react';
import './Dashboard.css'; // Use the same CSS file

const StudyTaskCard = ({ title, status, dueTime, color }) => {
    return (
        <div className="task-card" style={{ borderLeftColor: color || '#5a54e9' }}>
            <p className="task-title">{title}</p>
            <p className="task-detail">{status}</p>
            <span className="task-time">{dueTime}</span>
        </div>
    );
};

export default StudyTaskCard;