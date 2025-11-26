// src/Admin/AdminAnalytics.js - COMPLETE WITH ALL STYLES

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

function AdminAnalytics() {
    const [analyticsData, setAnalyticsData] = useState({
        totalSessions: 0,
        activeLearners: 0,
        popularTopic: "Loading...",
        avgStudyDuration: "0 mins",
        completionRate: "0%",
        totalTopics: 0,
        totalCourses: 0,
        totalUsers: 0,
        recentUsers: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalyticsData = useCallback(async () => {
        try {
            const response = await api.get('/admin/analytics/');
            setAnalyticsData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data from server');
            // Fallback to localStorage data
            loadAnalyticsFromLocalStorage();
        }
    }, []);

    const fetchRecentActivities = useCallback(async () => {
        try {
            const response = await api.get('/admin/recent-activities/');
            setRecentActivities(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching recent activities:', err);
            // Fallback to localStorage data
            loadRecentActivitiesFromLocalStorage();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalyticsData();
        fetchRecentActivities();
    }, [fetchAnalyticsData, fetchRecentActivities]);

    const loadAnalyticsFromLocalStorage = () => {
        // Fallback to localStorage data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
        
        setAnalyticsData({
            totalSessions: studySessions.length,
            activeLearners: users.filter(user => !user.is_staff).length,
            popularTopic: "Mathematics: Calculus",
            avgStudyDuration: "45 mins",
            completionRate: "68%",
            totalTopics: 42,
            totalCourses: 15,
            totalUsers: users.length,
            recentUsers: 0
        });
    };

    const loadRecentActivitiesFromLocalStorage = () => {
        // Fallback to localStorage data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const activities = users.slice(-3).map(user => ({
            type: 'user_registered',
            message: `New user registered: ${user.username}`,
            timestamp: user.date_joined || new Date().toISOString(),
            user: user.username
        }));
        
        setRecentActivities(activities);
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={loadingStyle}>Loading analytics data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={errorStyle}>
                    {error}
                    <br />
                    <small>Showing fallback data</small>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2 style={titleStyle}>Learning Analytics Dashboard</h2>
                <p style={subtitleStyle}>Real-time platform analytics and user engagement</p>
            </header>

            <div style={metricsGridStyle}>
                <div style={metricCardStyle}>
                    <h3>Total Users</h3>
                    <p style={metricValueStyle}>{analyticsData.totalUsers}</p>
                    <p style={metricTrendStyle}>{analyticsData.recentUsers} new this week</p>
                </div>
                
                <div style={metricCardStyle}>
                    <h3>Active Learners</h3>
                    <p style={metricValueStyle}>{analyticsData.activeLearners}</p>
                    <p style={metricTrendStyle}>Currently learning</p>
                </div>
                
                <div style={metricCardStyle}>
                    <h3>Study Sessions</h3>
                    <p style={metricValueStyle}>{analyticsData.totalSessions}</p>
                    <p style={metricTrendStyle}>Total completed</p>
                </div>
                
                <div style={metricCardStyle}>
                    <h3>Avg Study Duration</h3>
                    <p style={metricValueStyle}>{analyticsData.avgStudyDuration}</p>
                    <p style={metricTrendStyle}>Per session</p>
                </div>
            </div>

            <div style={statsGridStyle}>
                <div style={statCardStyle}>
                    <h4>Completion Rate</h4>
                    <p style={statValueStyle}>{analyticsData.completionRate}</p>
                    <div style={progressBarStyle}>
                        <div style={{...progressFillStyle, width: analyticsData.completionRate}}></div>
                    </div>
                </div>
                
                <div style={statCardStyle}>
                    <h4>Available Topics</h4>
                    <p style={statValueStyle}>{analyticsData.totalTopics}</p>
                    <p style={statLabelStyle}>For study</p>
                </div>
                
                <div style={statCardStyle}>
                    <h4>Learning Courses</h4>
                    <p style={statValueStyle}>{analyticsData.totalCourses}</p>
                    <p style={statLabelStyle}>Structured paths</p>
                </div>
            </div>

            <div style={activitySectionStyle}>
                <h3>Recent Platform Activities</h3>
                <div style={activityListStyle}>
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div key={index} style={activityItemStyle}>
                                <span style={activityMessageStyle}>{activity.message}</span>
                                <span style={activityTimeStyle}>{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                        ))
                    ) : (
                        <div style={noActivitiesStyle}>
                            <p>No recent activities recorded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ========== ALL CSS STYLES ==========

const containerStyle = {
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const headerStyle = {
    marginBottom: '30px',
    borderBottom: '2px solid #f1f3f4',
    paddingBottom: '20px'
};

const titleStyle = {
    margin: 0,
    color: '#2c3e50',
    fontSize: '2em'
};

const subtitleStyle = {
    margin: '5px 0 0 0',
    color: '#7f8c8d',
    fontSize: '1.1em'
};

const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const metricCardStyle = {
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e1e8ed',
    transition: 'transform 0.3s, box-shadow 0.3s'
};

const metricValueStyle = {
    fontSize: '2.2em',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '10px 0'
};

const metricTrendStyle = {
    color: '#27ae60',
    fontSize: '0.9em',
    fontWeight: 'bold'
};

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const statCardStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e1e8ed',
    textAlign: 'center'
};

const statValueStyle = {
    fontSize: '1.8em',
    fontWeight: 'bold',
    color: '#3498db',
    margin: '10px 0'
};

const statLabelStyle = {
    color: '#7f8c8d',
    fontSize: '0.9em'
};

const progressBarStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
    marginTop: '10px',
    overflow: 'hidden'
};

const progressFillStyle = {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: '4px',
    transition: 'width 0.3s'
};

const activitySectionStyle = {
    marginTop: '30px'
};

const activityListStyle = {
    marginTop: '15px'
};

const activityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f8f9fa'
};

const activityMessageStyle = {
    flex: 1
};

const activityTimeStyle = {
    marginLeft: 'auto',
    color: '#7f8c8d',
    fontSize: '0.9em'
};

const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    fontSize: '1.2em',
    color: '#7f8c8d'
};

const errorStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ffeaa7',
    borderRadius: '8px',
    border: '1px solid #fdcb6e',
    marginBottom: '20px'
};

const noActivitiesStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    border: '2px dashed #e1e8ed',
    borderRadius: '8px'
};

export default AdminAnalytics;