// AdminAnalytics.js - NEW COMPONENT
import React from 'react';

function AdminAnalytics() {
    const analyticsData = {
        totalSessions: 1247,
        activeLearners: 89,
        popularTopic: "Mathematics: Calculus",
        avgStudyDuration: "45 mins",
        completionRate: "68%",
        totalTopics: 42,
        totalCourses: 15
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2 style={titleStyle}>Learning Analytics Dashboard</h2>
                <p style={subtitleStyle}>Monitor learning progress and platform engagement</p>
            </header>

            <div style={metricsGridStyle}>
                <div style={metricCardStyle}>
                    <h3>Total Study Sessions</h3>
                    <p style={metricValueStyle}>{analyticsData.totalSessions}</p>
                    <p style={metricTrendStyle}>12% this month</p>
                </div>
                
                <div style={metricCardStyle}>
                    <h3>Active Learners</h3>
                    <p style={metricValueStyle}>{analyticsData.activeLearners}</p>
                    <p style={metricTrendStyle}>8% this week</p>
                </div>
                
                <div style={metricCardStyle}>
                    <h3>Most Popular Topic</h3>
                    <p style={metricValueStyle}>{analyticsData.popularTopic}</p>
                    <p style={metricTrendStyle}>Mathematics</p>
                </div>
                
                <div style={metricCardStyle}>
                    <h3>Avg Study Duration</h3>
                    <p style={metricValueStyle}>{analyticsData.avgStudyDuration}</p>
                    <p style={metricTrendStyle}>Consistent engagement</p>
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
                    <h4>Total Topics</h4>
                    <p style={statValueStyle}>{analyticsData.totalTopics}</p>
                    <p style={statLabelStyle}>Available for study</p>
                </div>
                
                <div style={statCardStyle}>
                    <h4>Total Courses</h4>
                    <p style={statValueStyle}>{analyticsData.totalCourses}</p>
                    <p style={statLabelStyle}>Structured learning paths</p>
                </div>
            </div>

            <div style={activitySectionStyle}>
                <h3>Recent Activity</h3>
                <div style={activityListStyle}>
                    <div style={activityItemStyle}>
                        <span>User "JohnDoe" completed "Physics: Quantum Mechanics"</span>
                        <span style={activityTimeStyle}>2 hours ago</span>
                    </div>
                    <div style={activityItemStyle}>
                        <span>New topic "Computer Science: Machine Learning" was added</span>
                        <span style={activityTimeStyle}>5 hours ago</span>
                    </div>
                    <div style={activityItemStyle}>
                        <span>User "JaneSmith" was promoted to Admin</span>
                        <span style={activityTimeStyle}>1 day ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

const activityTimeStyle = {
    marginLeft: 'auto',
    color: '#7f8c8d',
    fontSize: '0.9em'
};

export default AdminAnalytics;