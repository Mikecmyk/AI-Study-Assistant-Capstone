import React from 'react';

const Achievements = ({ studyHistory = [], tasks = [] }) => {
    const calculateAchievements = () => {
        const totalSessions = studyHistory.length;
        const completedTasks = tasks.filter(task => task.isCompleted).length;
        const totalStudyTime = studyHistory.reduce((total, session) => {
            const duration = parseInt(session.duration) || 0;
            return total + duration;
        }, 0);

        const achievements = [
            {
                id: 1,
                name: "First Steps",
                description: "Complete your first study session",
                earned: totalSessions > 0,
                progress: totalSessions > 0 ? 100 : 0,
                target: 1
            },
            {
                id: 2,
                name: "Task Master",
                description: "Complete 5 tasks",
                earned: completedTasks >= 5,
                progress: Math.min((completedTasks / 5) * 100, 100),
                target: 5
            },
            {
                id: 3,
                name: "Dedicated Learner",
                description: "Study for 10+ hours total",
                earned: totalStudyTime >= 600,
                progress: Math.min((totalStudyTime / 600) * 100, 100),
                target: 600
            },
            {
                id: 4,
                name: "Consistent Scholar",
                description: "Study for 7 consecutive days",
                earned: false,
                progress: 0,
                target: 7
            },
            {
                id: 5,
                name: "Quick Starter",
                description: "Generate study plan within 1 minute of login",
                earned: false,
                progress: 0,
                target: 1
            },
            {
                id: 6,
                name: "Multi-Topic Explorer",
                description: "Study 3 different subjects",
                earned: new Set(studyHistory.map(s => s.topic)).size >= 3,
                progress: Math.min((new Set(studyHistory.map(s => s.topic)).size / 3) * 100, 100),
                target: 3
            }
        ];

        return achievements;
    };

    const achievements = calculateAchievements();
    const earnedCount = achievements.filter(a => a.earned).length;

    return (
        <div className="achievements-container">
            <div className="achievements-header">
                <h3>Achievements & Badges</h3>
                <div className="progress-ring">
                    <span className="progress-count">{earnedCount}/{achievements.length}</span>
                </div>
            </div>
            
            <div className="achievements-grid">
                {achievements.map(achievement => (
                    <div 
                        key={achievement.id} 
                        className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                    >
                        <div className="achievement-icon">
                            {achievement.earned ? '✓' : '○'}
                        </div>
                        <div className="achievement-info">
                            <h4>{achievement.name}</h4>
                            <p>{achievement.description}</p>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${achievement.progress}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">
                                {achievement.earned ? 'Completed!' : `${Math.round(achievement.progress)}%`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Achievements;