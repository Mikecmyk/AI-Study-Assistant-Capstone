// AdminDashboard.js - UPDATED WITH LOGOUT BUTTON

import React, { useState } from 'react';
import AdminTopicList from './AdminTopicList';
import AdminCourseList from './AdminCourseList';
import AdminUserList from './AdminUserList';
import AdminAnalytics from './AdminAnalytics';
import AIConfigPanel from './AIConfigPanel';

const AdminDashboard = () => {
    const [currentView, setCurrentView] = useState('analytics'); 

    const renderContent = () => {
        switch (currentView) {
            case 'analytics':
                return <AdminAnalytics />;
            case 'topics':
                return <AdminTopicList />;
            case 'courses':
                return <AdminCourseList />;
            case 'users':
                return <AdminUserList />;
            case 'ai-config':
                return <AIConfigPanel />;
            default:
                return <AdminAnalytics />;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div style={adminDashboardStyle}>
            <nav style={navBarStyle}>
                <div style={navHeaderStyle}>
                    <h1 style={logoStyle}>Zonlus Admin</h1>
                    <button 
                        onClick={handleLogout}
                        style={logoutButtonStyle}
                    >
                        Log Out
                    </button>
                </div>
                <div style={navLinksStyle}>
                    <button onClick={() => setCurrentView('analytics')} style={navLinkButtonStyle(currentView === 'analytics')}>
                        Analytics
                    </button>
                    <button onClick={() => setCurrentView('topics')} style={navLinkButtonStyle(currentView === 'topics')}>
                        Manage Topics
                    </button>
                    <button onClick={() => setCurrentView('courses')} style={navLinkButtonStyle(currentView === 'courses')}>
                        Manage Courses
                    </button>
                    <button onClick={() => setCurrentView('users')} style={navLinkButtonStyle(currentView === 'users')}>
                        User Management
                    </button>
                    <button onClick={() => setCurrentView('ai-config')} style={navLinkButtonStyle(currentView === 'ai-config')}>
                        AI Configuration
                    </button>
                </div>
            </nav>

            <div style={contentAreaStyle}>
                {renderContent()}
            </div>
        </div>
    );
};

const adminDashboardStyle = { 
    display: 'flex', 
    minHeight: '100vh', 
    backgroundColor: '#f5f7fa',
    fontFamily: 'Arial, sans-serif'
};

const navBarStyle = { 
    width: '300px', 
    backgroundColor: '#2c3e50', 
    color: 'white', 
    padding: '25px', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
};

const navHeaderStyle = {
    marginBottom: '40px',
    borderBottom: '2px solid #34495e',
    paddingBottom: '15px'
};

const logoStyle = { 
    fontSize: '1.8em', 
    margin: '0 0 15px 0',
    textAlign: 'center',
    color: '#3498db'
};

const logoutButtonStyle = {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
};

const navLinksStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    flex: 1
};

const navLinkButtonStyle = (isActive) => ({
    padding: '15px 20px',
    textAlign: 'left',
    backgroundColor: isActive ? '#3498db' : 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'all 0.3s ease',
    fontWeight: isActive ? 'bold' : 'normal',
    boxShadow: isActive ? '0 4px 8px rgba(52, 152, 219, 0.3)' : 'none'
});

const contentAreaStyle = { 
    flexGrow: 1, 
    padding: '30px', 
    overflowY: 'auto',
    backgroundColor: '#ecf0f1'
};

export default AdminDashboard;