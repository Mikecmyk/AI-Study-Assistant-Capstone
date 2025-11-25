import React, { useState, useEffect } from 'react';

// Get current user ID for data isolation - FIXED VERSION
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return 'anonymous';
    
    // Try to parse as JSON first
    try {
      const user = JSON.parse(userData);
      return user.id || user.user_id || 'anonymous';
    } catch (e) {
      // If it's not JSON, return the string directly or a hash of it
      return userData;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
};

const StudyHistory = () => {
    const [studySessions, setStudySessions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStudyHistory();
    }, []);

    const loadStudyHistory = () => {
        try {
            setLoading(true);
            const userId = getCurrentUserId();
            const storageKey = `studyHistory_${userId}`;
            const storedHistory = localStorage.getItem(storageKey);
            const history = storedHistory ? JSON.parse(storedHistory) : [];
            
            const sortedHistory = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setStudySessions(sortedHistory);
        } catch (error) {
            console.error('Error loading study history:', error);
            setStudySessions([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredSessions = () => {
        const now = new Date();
        
        return studySessions.filter(session => {
            const sessionDate = new Date(session.timestamp);
            
            switch (filter) {
                case 'today':
                    return sessionDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return sessionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return sessionDate >= monthAgo;
                default:
                    return true;
            }
        });
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all study history?')) {
            const userId = getCurrentUserId();
            const storageKey = `studyHistory_${userId}`;
            localStorage.removeItem(storageKey);
            setStudySessions([]);
        }
    };

    const refreshHistory = () => {
        loadStudyHistory();
    };

    const getSessionType = (type) => {
        const types = {
            'study_plan': 'Study Plan',
            'notes': 'AI Notes',
            'quiz': 'AI Quiz'
        };
        return types[type] || 'Study Session';
    };

    const formatDuration = (duration) => {
        if (!duration) return 'Not specified';
        return duration;
    };

    const filteredSessions = getFilteredSessions();

    return (
        <div className="study-history">
            <div className="history-header">
                <h3>Study History</h3>
                <div className="history-controls">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="history-filter"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    
                    <button 
                        onClick={refreshHistory}
                        className="refresh-history-btn"
                        title="Refresh history"
                    >
                        Refresh
                    </button>
                    
                    {studySessions.length > 0 && (
                        <button 
                            onClick={clearHistory}
                            className="clear-history-btn"
                            title="Clear all history"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading your study history...</div>
            ) : studySessions.length === 0 ? (
                <div className="empty-history">
                    <p>No study sessions yet</p>
                    <small>Your study plans, notes, and quizzes will appear here</small>
                </div>
            ) : (
                <>
                    <div className="history-stats">
                        <div className="stat">
                            <span className="stat-number">{filteredSessions.length}</span>
                            <span className="stat-label">sessions</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">
                                {new Set(filteredSessions.map(s => s.topic)).size}
                            </span>
                            <span className="stat-label">topics</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">
                                {new Set(filteredSessions.map(s => s.type)).size}
                            </span>
                            <span className="stat-label">types</span>
                        </div>
                    </div>

                    <div className="sessions-list">
                        {filteredSessions.map((session) => (
                            <div key={session.id} className="session-card">
                                <div className="session-header">
                                    <div className="session-type">
                                        <span className="session-type-text">
                                            {getSessionType(session.type)}
                                        </span>
                                    </div>
                                    <div className="session-time">
                                        {session.time}
                                    </div>
                                </div>
                                
                                <div className="session-topic">
                                    {session.topic}
                                </div>
                                
                                <div className="session-details">
                                    <div className="session-duration">
                                        <strong>Duration:</strong> {formatDuration(session.duration)}
                                    </div>
                                    <div className="session-date">
                                        {session.date}
                                    </div>
                                </div>
                                
                                <div className="session-preview">
                                    {session.content}
                                </div>
                                
                                <div className="session-actions">
                                    <button 
                                        className="view-session-btn"
                                        onClick={() => alert(`Full content:\n\n${session.content}`)}
                                    >
                                        View Full Content
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredSessions.length === 0 && studySessions.length > 0 && (
                        <div className="no-sessions-message">
                            No sessions found for the selected period.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudyHistory;