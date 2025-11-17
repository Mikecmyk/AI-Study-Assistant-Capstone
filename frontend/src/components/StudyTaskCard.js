// src/components/StudyTaskCard.js

import React from 'react';

// NOTE: Ensure Dashboard.css is imported in a parent component (like Dashboard.js) 
// or import it here if you want this component to be fully self-contained.

const StudyTaskCard = ({ id, title, subject, difficulty, dueTime, isCompleted, onToggleComplete, onViewDetails }) => {
    
    // Determine the border color based on difficulty (matches common color coding)
    let color;
    switch (difficulty.toLowerCase()) {
        case 'high':
            color = '#e74c3c'; // Red
            break;
        case 'mid':
            color = '#f1c40f'; // Yellow/Orange
            break;
        case 'easy':
        default:
            color = '#2ecc71'; // Green
            break;
    }

    const statusText = isCompleted ? '✅ Completed' : `Due ${dueTime}`;

    return (
        <div 
            className={`task-card ${isCompleted ? 'completed' : ''}`}
            // Apply the color via inline style to control the left border
            style={{ borderLeftColor: color }}
        >
            <div className="task-header">
                {/* Task Title */}
                <p className="task-title" onClick={() => onViewDetails(id)}>
                    {title}
                </p>
                
                {/* Tags for Subject and Difficulty */}
                <div className="task-tags">
                    <span className="tag subject-tag">{subject}</span>
                    <span className={`tag difficulty-tag tag-${difficulty.toLowerCase()}`}>{difficulty}</span>
                </div>
            </div>

            <div className="task-footer">
                <span className="task-status">{statusText}</span>

                {/* Completion Toggle */}
                <button 
                    onClick={() => onToggleComplete(id)}
                    className={`toggle-button ${isCompleted ? 'completed' : 'pending'}`}
                >
                    {isCompleted ? 'Undo' : 'Done'}
                </button>
            </div>
        </div>
    );
};

export default StudyTaskCard;