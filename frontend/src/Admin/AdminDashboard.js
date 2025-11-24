// AdminDashboard.js - UPDATED WITH ALL SECTIONS

import React, { useState } from 'react';
import AdminTopicList from './AdminTopicList';
import AdminCourseList from './AdminCourseList';
import AdminUserList from './AdminUserList';
import AdminAnalytics from './AdminAnalytics';
import AIConfigPanel from './AIConfigPanel';

const AdminDashboard = () => {
    const [currentView, setCurrentView] = useState('topics'); 

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
                return <AdminTopicList />;
        }
    };

    return (
        <div style={adminDashboardStyle}>
            <nav style={navBarStyle}>
                <h1 style={logoStyle}>Admin Panel</h1>
                <div style={navLinksStyle}>
                    <button onClick={() => setCurrentView('analytics')} style={navLinkButtonStyle(currentView === 'analytics')}>
                        Analytics
                    </button>
                    <button onClick={() => setCurrentView('topics')} style={navLinkButtonStyle(currentView === 'topics')}>
                        Topics
                    </button>
                    <button onClick={() => setCurrentView('courses')} style={navLinkButtonStyle(currentView === 'courses')}>
                        Courses
                    </button>
                    <button onClick={() => setCurrentView('users')} style={navLinkButtonStyle(currentView === 'users')}>
                        Users
                    </button>
                    <button onClick={() => setCurrentView('ai-config')} style={navLinkButtonStyle(currentView === 'ai-config')}>
                        AI Config
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
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif'
};

const navBarStyle = { 
    width: '280px', 
    backgroundColor: '#2c3e50', 
    color: 'white', 
    padding: '25px', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
};

const logoStyle = { 
    fontSize: '1.8em', 
    marginBottom: '40px', 
    borderBottom: '2px solid #34495e', 
    paddingBottom: '15px',
    textAlign: 'center'
};

const navLinksStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
};

const navLinkButtonStyle = (isActive) => ({
    padding: '15px 20px',
    textAlign: 'left',
    backgroundColor: isActive ? '#3498db' : 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    transition: 'all 0.3s ease',
    fontWeight: isActive ? 'bold' : 'normal',
    boxShadow: isActive ? '0 4px 8px rgba(52, 152, 219, 0.3)' : 'none',
});

const contentAreaStyle = { 
    flexGrow: 1, 
    padding: '30px', 
    overflowY: 'auto',
    backgroundColor: '#ecf0f1'
};

export default AdminDashboard;