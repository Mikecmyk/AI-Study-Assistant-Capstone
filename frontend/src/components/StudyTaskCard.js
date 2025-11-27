// StudyTaskCard.js - UPDATED WITH UNDO FUNCTIONALITY
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
    
    // Determine task type label
    const getTaskTypeLabel = () => {
        switch (taskType) {
            case 'review_task': return 'Review';
            case 'practice_task': return 'Practice';
            case 'quiz_task': return 'Assessment';
            case 'calendar_task': return 'Scheduled';
            default: return 'Task';
        }
    };

    // Get difficulty class
    const getDifficultyClass = () => {
        switch (difficulty?.toLowerCase()) {
            case 'high': return 'difficulty-high';
            case 'mid': return 'difficulty-medium';
            case 'medium': return 'difficulty-medium';
            case 'easy': return 'difficulty-easy';
            case 'low': return 'difficulty-low';
            default: return 'difficulty-medium';
        }
    };

    return (
        <div className={`task-row ${isCompleted ? 'completed-task' : ''}`}>
            {/* Task Type Column */}
            <div className="task-type">
                {getTaskTypeLabel()}
            </div>
            
            {/* Title & Description Column */}
            <div className="task-main-info">
                <div className="task-title" onClick={() => onViewDetails(id)}>
                    {title}
                </div>
                {description && (
                    <div className="task-description">
                        {description}
                    </div>
                )}
            </div>
            
            {/* Subject Column */}
            <div className="task-subject">
                {subject}
            </div>
            
            {/* Difficulty Column */}
            <div className={`task-difficulty ${getDifficultyClass()}`}>
                {difficulty || 'Medium'}
            </div>
            
            {/* Actions Column - Aligned Complete/Undo Button */}
            <div className="task-actions">
                <button 
                    className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                    onClick={() => onToggleComplete(id)}
                >
                    {isCompleted ? 'Undo' : 'Complete'}
                </button>
            </div>
        </div>
    );
};

export default StudyTaskCard;