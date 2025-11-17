// AdminDashboard.js

import React, { useState } from 'react';
import AdminTopicList from './AdminTopicList'; // Assuming you put the component here
import AdminCourseList from './AdminCourseList';
import AdminUserList from './AdminUserList';

const AdminDashboard = () => {
    // State to track which view is currently active: 'topics', 'courses', or 'users'
    const [currentView, setCurrentView] = useState('topics'); 

    // Function to render the correct component based on state
    const renderContent = () => {
        switch (currentView) {
            case 'topics':
                return <AdminTopicList />;
            case 'courses':
                return <AdminCourseList />;
            case 'users':
                return <AdminUserList />;
            default:
                return <AdminTopicList />;
        }
    };

    return (
        <div style={adminDashboardStyle}>
            {/* Navigation Sidebar/Header */}
            <nav style={navBarStyle}>
                <h1 style={logoStyle}>Admin Panel</h1>
                <div style={navLinksStyle}>
                    <button onClick={() => setCurrentView('topics')} style={navLinkButtonStyle(currentView === 'topics')}>
                        Manage Topics
                    </button>
                    <button onClick={() => setCurrentView('courses')} style={navLinkButtonStyle(currentView === 'courses')}>
                        Manage Courses
                    </button>
                    <button onClick={() => setCurrentView('users')} style={navLinkButtonStyle(currentView === 'users')}>
                        Manage Users
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <div style={contentAreaStyle}>
                {renderContent()}
            </div>
        </div>
    );
};

// Basic Styling for the Admin Layout
const adminDashboardStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9' };
const navBarStyle = { width: '250px', backgroundColor: '#34495e', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' };
const logoStyle = { fontSize: '1.5em', marginBottom: '40px', borderBottom: '2px solid #5d6d7e', paddingBottom: '10px' };
const navLinksStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const navLinkButtonStyle = (isActive) => ({
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: isActive ? '#5d6d7e' : 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.2s',
});
const contentAreaStyle = { flexGrow: 1, padding: '30px', overflowY: 'auto' };

export default AdminDashboard;