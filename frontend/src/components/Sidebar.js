// Sidebar.js (New Component)

import React from 'react';
// Assume icons are imported from a library like react-icons (e.g., import { FaHome, FaGraduationCap } from 'react-icons/fa';)

const Sidebar = ({ activePath, onNavigate }) => {
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '' },
        { name: 'My Courses', path: '/courses', icon: '' },
        { name: 'Progress', path: '/progress', icon: '' },
    ];
    
    // Assume isAdmin prop or context exists
    const isAdmin = true; 

    return (
        <aside className="sidebar">
            <h1 className="sidebar-header">Study Core</h1>
            
            <div className="sidebar-nav-links">
                {navItems.map(item => (
                    <a 
                        key={item.path}
                        href={item.path} // In a real app, use React Router <Link>
                        onClick={(e) => { e.preventDefault(); onNavigate(item.path); }}
                        className={`nav-link ${activePath === item.path ? 'active' : ''}`}
                    >
                        <span className="link-icon">{item.icon}</span>
                        {item.name}
                    </a>
                ))}
            </div>
            
            {isAdmin && (
                <div className="admin-link">
                    <a 
                        href="/admin" 
                        className={`nav-link ${activePath === '/admin' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate('/admin'); }}
                    >
                        <span className="link-icon">👑</span>
                        Admin Tools
                    </a>
                </div>
            )}
        </aside>
    );
};
// You would then import and use <Sidebar activePath={'/dashboard'} onNavigate={...} /> in Dashboard.js