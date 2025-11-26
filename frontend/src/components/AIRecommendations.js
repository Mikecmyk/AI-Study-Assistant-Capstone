import React, { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';

const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return 'anonymous';
    
    try {
      const user = JSON.parse(userData);
      return user.id || user.user_id || 'anonymous';
    } catch (e) {
      return userData;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
};

const AIRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('suggestions');
    const [hasEnoughData, setHasEnoughData] = useState(false);

    const checkStudyData = () => {
        const userId = getCurrentUserId();
        const storageKey = `studyHistory_${userId}`;
        const studyHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const recentSessions = studyHistory.filter(session => {
            const sessionDate = new Date(session.timestamp);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return sessionDate > oneWeekAgo;
        });

        if (recentSessions.length >= 2) {
            setHasEnoughData(true);
            if (!isLoading) {
                generateRecommendations();
            }
        } else {
            setHasEnoughData(false);
            setError('Complete at least 2 study sessions to get AI recommendations');
        }
    };

    useEffect(() => {
        checkStudyData();
        
        // Listen for study session completion events
        const handleStudySessionCompleted = () => {
            setTimeout(() => {
                checkStudyData();
            }, 500);
        };

        window.addEventListener('studySessionCompleted', handleStudySessionCompleted);
        
        return () => {
            window.removeEventListener('studySessionCompleted', handleStudySessionCompleted);
        };
    }, []);

    const generateRecommendations = async () => {
        if (!hasEnoughData) return;
        
        setIsLoading(true);
        setError('');

        try {
            const userId = getCurrentUserId();
            const storageKey = `studyHistory_${userId}`;
            const studyHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentSessions = studyHistory.filter(session => 
                new Date(session.timestamp) > oneWeekAgo
            );

            const analysis = analyzeStudyPatterns(recentSessions, studyHistory);

            const aiRecommendations = await getAIRecommendations(analysis);
            
            setRecommendations(aiRecommendations);
        } catch (err) {
            console.error('Recommendation error:', err);
            setError('Failed to generate recommendations. Complete more study sessions for better suggestions.');
            setRecommendations(getFallbackRecommendations());
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeStudyPatterns = (recentSessions, allSessions) => {
        const subjectCount = {};
        const subjectTime = {};
        
        recentSessions.forEach(session => {
            const subject = extractSubject(session.topic);
            subjectCount[subject] = (subjectCount[subject] || 0) + 1;
            subjectTime[subject] = (subjectTime[subject] || 0) + (parseInt(session.duration) || 60);
        });

        const topSubjects = Object.entries(subjectCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([subject]) => subject);

        const allSubjects = [...new Set(allSessions.map(s => extractSubject(s.topic)))];
        const gapSubjects = allSubjects.filter(subject => 
            !topSubjects.includes(subject) && 
            (!subjectCount[subject] || subjectCount[subject] < 2)
        );

        return {
            topSubjects,
            gapSubjects,
            totalSessions: recentSessions.length,
            studyTime: Object.values(subjectTime).reduce((sum, time) => sum + time, 0),
            recentSessions,
            favoriteSubject: topSubjects[0] || 'General Studies'
        };
    };

    const extractSubject = (topic) => {
        if (topic.includes(':')) {
            return topic.split(':')[0].trim();
        }
        if (topic.includes('-')) {
            return topic.split('-')[0].trim();
        }
        return topic;
    };

    const getAIRecommendations = async (analysis) => {
        try {
            const prompt = `
            Based on this learning analysis, provide personalized study recommendations:
            
            Recent Activity:
            - Top subjects: ${analysis.topSubjects.join(', ')}
            - Potential gaps: ${analysis.gapSubjects.join(', ') || 'None identified'}
            - Total sessions: ${analysis.totalSessions}
            - Total study time: ${Math.round(analysis.studyTime / 60)} hours
            - Favorite subject: ${analysis.favoriteSubject}
            
            Please provide:
            1. 3 personalized study suggestions based on their current focus
            2. 2 areas they should review or gaps to fill
            3. 2 next learning steps to advance their knowledge
            
            Format as JSON with: suggestions, gaps, nextSteps arrays.
            Each item should have: title, description, reason, and priority (high/medium/low).
            `;

            const response = await api.post('/ai-recommendations/', {
                analysis: analysis,
                prompt: prompt
            });

            return response.data.recommendations;
        } catch (error) {
            console.warn('AI recommendations failed, using fallback:', error);
            return getFallbackRecommendations();
        }
    };

    const getFallbackRecommendations = () => {
        return {
            suggestions: [
                {
                    title: "Deepen Your Understanding",
                    description: "Review key concepts from your most studied topics and try to explain them in your own words.",
                    reason: "Based on your recent focus areas",
                    priority: "high"
                },
                {
                    title: "Practice Application",
                    description: "Solve practical problems related to your subjects to strengthen real-world application.",
                    reason: "Builds on your current knowledge",
                    priority: "medium"
                },
                {
                    title: "Explore Related Topics",
                    description: "Look into subjects that naturally extend from what you've been studying.",
                    reason: "Expands your knowledge network",
                    priority: "medium"
                }
            ],
            gaps: [
                {
                    title: "Fundamental Concepts Review",
                    description: "Spend 30 minutes reviewing basic principles to strengthen your foundation.",
                    reason: "Solid foundation improves advanced learning",
                    priority: "high"
                },
                {
                    title: "Cross-Subject Connections",
                    description: "Identify how your different subjects relate to each other.",
                    reason: "Builds integrated understanding",
                    priority: "low"
                }
            ],
            nextSteps: [
                {
                    title: "Advanced Topics",
                    description: "Move to more complex concepts in your primary subject area.",
                    reason: "You're ready for deeper challenges",
                    priority: "high"
                },
                {
                    title: "Skill Application Project",
                    description: "Start a small project that applies what you've learned.",
                    reason: "Practical application reinforces learning",
                    priority: "medium"
                }
            ]
        };
    };

    const handleApplyRecommendation = (rec) => {
        alert(`Applying: ${rec.title}\n\n${rec.description}\n\nThis will help you: ${rec.reason}`);
    };

    const handleScheduleStudy = (rec) => {
        alert(`Let's schedule study time for: ${rec.title}\n\nSwitch to Calendar tab to plan this session.`);
    };

    if (!hasEnoughData) {
        return (
            <div className="ai-recommendations">
                <h3>AI Study Recommendations</h3>
                <div className="insufficient-data">
                    <p>Complete at least 2 study sessions to unlock personalized AI recommendations</p>
                    <button className="start-studying-btn">
                        Start Studying Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-recommendations">
            <div className="recommendations-header">
                <h3>AI Study Recommendations</h3>
                <button 
                    onClick={generateRecommendations}
                    className="refresh-recommendations-btn"
                    title="Refresh recommendations"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="recommendation-error">
                    {error}
                </div>
            )}

            <div className="recommendation-tabs">
                <button 
                    className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suggestions')}
                >
                    Suggestions ({recommendations.suggestions?.length || 0})
                </button>
                <button 
                    className={`tab ${activeTab === 'gaps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gaps')}
                >
                    Knowledge Gaps ({recommendations.gaps?.length || 0})
                </button>
                <button 
                    className={`tab ${activeTab === 'next' ? 'active' : ''}`}
                    onClick={() => setActiveTab('next')}
                >
                    Next Steps ({recommendations.nextSteps?.length || 0})
                </button>
            </div>

            <div className="recommendations-content">
                {activeTab === 'suggestions' && (
                    <div className="recommendation-list">
                        <h4>Personalized Study Suggestions</h4>
                        <p className="section-description">Based on your recent learning activity and patterns</p>
                        
                        {recommendations.suggestions?.map((rec, index) => (
                            <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                                <div className="rec-header">
                                    <h5>{rec.title}</h5>
                                    <span className={`priority-badge ${rec.priority}`}>
                                        {rec.priority}
                                    </span>
                                </div>
                                <p className="rec-description">{rec.description}</p>
                                <div className="rec-reason">{rec.reason}</div>
                                <div className="rec-actions">
                                    <button 
                                        onClick={() => handleApplyRecommendation(rec)}
                                        className="apply-btn"
                                    >
                                        Apply This
                                    </button>
                                    <button 
                                        onClick={() => handleScheduleStudy(rec)}
                                        className="schedule-btn"
                                    >
                                        Schedule Study
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'gaps' && (
                    <div className="recommendation-list">
                        <h4>Knowledge Gap Analysis</h4>
                        <p className="section-description">Areas that need reinforcement based on your learning patterns</p>
                        
                        {recommendations.gaps?.map((rec, index) => (
                            <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                                <div className="rec-header">
                                    <h5>{rec.title}</h5>
                                    <span className={`priority-badge ${rec.priority}`}>
                                        {rec.priority}
                                    </span>
                                </div>
                                <p className="rec-description">{rec.description}</p>
                                <div className="rec-reason">{rec.reason}</div>
                                <div className="rec-actions">
                                    <button 
                                        onClick={() => handleApplyRecommendation(rec)}
                                        className="apply-btn"
                                    >
                                        Fill This Gap
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'next' && (
                    <div className="recommendation-list">
                        <h4>Next Learning Steps</h4>
                        <p className="section-description">Smart progression paths to advance your knowledge</p>
                        
                        {recommendations.nextSteps?.map((rec, index) => (
                            <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                                <div className="rec-header">
                                    <h5>{rec.title}</h5>
                                    <span className={`priority-badge ${rec.priority}`}>
                                        {rec.priority}
                                    </span>
                                </div>
                                <p className="rec-description">{rec.description}</p>
                                <div className="rec-reason">{rec.reason}</div>
                                <div className="rec-actions">
                                    <button 
                                        onClick={() => handleApplyRecommendation(rec)}
                                        className="apply-btn"
                                    >
                                        Start This
                                    </button>
                                    <button 
                                        onClick={() => handleScheduleStudy(rec)}
                                        className="schedule-btn"
                                    >
                                        Plan It
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="recommendation-stats">
                <div className="stat">
                    <span className="stat-number">{recommendations.suggestions?.length || 0}</span>
                    <span className="stat-label">Suggestions</span>
                </div>
                <div className="stat">
                    <span className="stat-number">{recommendations.gaps?.length || 0}</span>
                    <span className="stat-label">Gaps Identified</span>
                </div>
                <div className="stat">
                    <span className="stat-number">{recommendations.nextSteps?.length || 0}</span>
                    <span className="stat-label">Next Steps</span>
                </div>
            </div>
        </div>
    );
};

export default AIRecommendations;