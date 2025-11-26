// AdminLearnerProgress.js - NEW COMPONENT
import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminLearnerProgress() {
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLearner, setSelectedLearner] = useState(null);

    useEffect(() => {
        fetchLearnerProgress();
    }, []);

    const fetchLearnerProgress = async () => {
        try {
            // This would be your API endpoint to get learner progress
            const response = await api.get('/admin/learner-progress/');
            setLearners(response.data);
        } catch (err) {
            console.error('Error fetching learner progress:', err);
            // For demo, using mock data
            setLearners(mockLearners);
        } finally {
            setLoading(false);
        }
    };

    const mockLearners = [
        {
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            totalSessions: 15,
            completedTasks: 23,
            avgStudyTime: '45 mins',
            favoriteSubject: 'Mathematics',
            lastActive: '2024-01-15',
            progress: 68
        },
        {
            id: 2,
            username: 'jane_smith',
            email: 'jane@example.com',
            totalSessions: 8,
            completedTasks: 12,
            avgStudyTime: '32 mins',
            favoriteSubject: 'Physics',
            lastActive: '2024-01-14',
            progress: 45
        },
        {
            id: 3,
            username: 'mike_wilson',
            email: 'mike@example.com',
            totalSessions: 22,
            completedTasks: 35,
            avgStudyTime: '58 mins',
            favoriteSubject: 'Computer Science',
            lastActive: '2024-01-15',
            progress: 82
        }
    ];

    if (loading) return <div style={loadingStyle}>Loading learner progress...</div>;

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2>Learner Progress Monitoring</h2>
                <p>Track and monitor learner engagement and progress</p>
            </header>

            <div style={contentStyle}>
                <div style={learnersListStyle}>
                    <h3>Active Learners ({learners.length})</h3>
                    <div style={listStyle}>
                        {learners.map(learner => (
                            <div 
                                key={learner.id}
                                style={learnerCardStyle(selectedLearner?.id === learner.id)}
                                onClick={() => setSelectedLearner(learner)}
                            >
                                <div style={learnerHeaderStyle}>
                                    <h4>{learner.username}</h4>
                                    <span style={progressBadgeStyle}>{learner.progress}%</span>
                                </div>
                                <p style={emailStyle}>{learner.email}</p>
                                <div style={statsStyle}>
                                    <span>Sessions: {learner.totalSessions}</span>
                                    <span>Tasks: {learner.completedTasks}</span>
                                    <span>Avg: {learner.avgStudyTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={detailsStyle}>
                    {selectedLearner ? (
                        <div style={detailCardStyle}>
                            <h3>Detailed Progress: {selectedLearner.username}</h3>
                            <div style={detailGridStyle}>
                                <div style={detailItemStyle}>
                                    <label>Total Study Sessions</label>
                                    <span>{selectedLearner.totalSessions}</span>
                                </div>
                                <div style={detailItemStyle}>
                                    <label>Completed Tasks</label>
                                    <span>{selectedLearner.completedTasks}</span>
                                </div>
                                <div style={detailItemStyle}>
                                    <label>Average Study Time</label>
                                    <span>{selectedLearner.avgStudyTime}</span>
                                </div>
                                <div style={detailItemStyle}>
                                    <label>Favorite Subject</label>
                                    <span>{selectedLearner.favoriteSubject}</span>
                                </div>
                                <div style={detailItemStyle}>
                                    <label>Overall Progress</label>
                                    <div style={progressContainerStyle}>
                                        <div style={progressBarStyle}>
                                            <div 
                                                style={{
                                                    ...progressFillStyle, 
                                                    width: `${selectedLearner.progress}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span>{selectedLearner.progress}%</span>
                                    </div>
                                </div>
                                <div style={detailItemStyle}>
                                    <label>Last Active</label>
                                    <span>{selectedLearner.lastActive}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={placeholderStyle}>
                            <p>Select a learner to view detailed progress</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Styles
const containerStyle = {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const headerStyle = {
    marginBottom: '30px',
    borderBottom: '2px solid #f1f3f4',
    paddingBottom: '20px'
};

const contentStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
    height: '600px'
};

const learnersListStyle = {
    borderRight: '2px solid #f1f3f4',
    paddingRight: '20px'
};

const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxHeight: '500px',
    overflowY: 'auto'
};

const learnerCardStyle = (isSelected) => ({
    padding: '15px',
    border: `2px solid ${isSelected ? '#3498db' : '#e1e8ed'}`,
    borderRadius: '8px',
    backgroundColor: isSelected ? '#f8f9fa' : 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
});

const learnerHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
};

const progressBadgeStyle = {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8em',
    fontWeight: 'bold'
};

const emailStyle = {
    color: '#7f8c8d',
    fontSize: '0.9em',
    marginBottom: '10px'
};

const statsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8em',
    color: '#5a6c7d'
};

const detailsStyle = {
    padding: '20px'
};

const detailCardStyle = {
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #e1e8ed'
};

const detailGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '20px'
};

const detailItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const progressContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
};

const progressBarStyle = {
    flex: 1,
    height: '8px',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
    overflow: 'hidden'
};

const progressFillStyle = {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
};

const placeholderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#7f8c8d',
    fontSize: '1.1em'
};

const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    fontSize: '1.2em'
};

export default AdminLearnerProgress;