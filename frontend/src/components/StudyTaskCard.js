// StudyTaskCard.js - UPDATED WITH TASK TYPE SUPPORT
import React from 'react';

const StudyTaskCard = ({ 
    id, 
    title, 
    subject, 
    difficulty, 
    dueTime, 
    isCompleted, 
    onToggleComplete, 
    onViewDetails, 
    taskType,
    description 
}) => {
    
    // Determine the border color based on difficulty
    let color;
    switch (difficulty.toLowerCase()) {
        case 'high':
            color = '#e74c3c';
            break;
        case 'mid':
            color = '#f1c40f';
            break;
        case 'easy':
        default:
            color = '#2ecc71';
            break;
    }

    // Determine task type styling
    const getTaskTypeClass = () => {
        switch (taskType) {
            case 'review_task': return 'review-task';
            case 'practice_task': return 'practice-task';
            case 'quiz_task': return 'quiz-task';
            case 'calendar_task': return 'calendar-task';
            default: return 'regular-task';
        }
    };

    const getTaskTypeLabel = () => {
        switch (taskType) {
            case 'review_task': return 'Review';
            case 'practice_task': return 'Practice';
            case 'quiz_task': return 'Assessment';
            case 'calendar_task': return 'Scheduled';
            default: return 'Task';
        }
    };

    const statusText = isCompleted ? 'Completed' : `Due ${dueTime}`;

    return (
        <div 
            className={`task-card ${isCompleted ? 'completed' : ''} ${getTaskTypeClass()}`}
            style={{ borderLeftColor: color }}
        >
            <div className="task-header">
                <div className="task-type-badge">
                    {getTaskTypeLabel()}
                </div>
                
                <p className="task-title" onClick={() => onViewDetails(id)}>
                    {title}
                </p>
                
                {description && (
                    <p className="task-description">
                        {description}
                    </p>
                )}
                
                <div className="task-tags">
                    <span className="tag subject-tag">{subject}</span>
                    <span className={`tag difficulty-tag tag-${difficulty.toLowerCase()}`}>
                        {difficulty}
                    </span>
                </div>
            </div>

            <div className="task-footer">
                <span className="task-status">{statusText}</span>

                <button 
                    onClick={() => onToggleComplete(id)}
                    className={`toggle-button ${isCompleted ? 'completed' : 'pending'}`}
                >
                    {isCompleted ? 'Undo' : 'Complete'}
                </button>
            </div>
        </div>
    );
};

export default StudyTaskCard;