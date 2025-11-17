// AdminUserList.js

import React, { useState, useEffect } from 'react';
import api from '../api'; 

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching (Read Operation) ---
    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users/'); 
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching admin users:', err);
            // This endpoint requires IsAdminUser permission
            setError('Failed to load users. Check Admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- Status Update Operation (Patch) ---
    const handleStatusUpdate = async (userId, fieldName, currentValue) => {
        const newValue = !currentValue;
        const payload = { [fieldName]: newValue };

        try {
            await api.patch(`/admin/users/${userId}/`, payload);
            
            // Update the local state to reflect the change immediately
            setUsers(users.map(user => 
                user.id === userId ? { ...user, [fieldName]: newValue } : user
            ));
        } catch (err) {
            console.error(`Error updating user ${fieldName}:`, err);
            alert(`Failed to update user status.`);
        }
    };

    if (loading) return <p>Loading Admin Users...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="admin-user-list-container" style={userListContainerStyle}>
            <header style={headerStyle}>
                <h2>👥 User Management</h2>
            </header>

            {/* --- User Data Table --- */}
            <div className="user-table-wrapper" style={tableWrapperStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4' }}>
                            <th style={tableHeaderStyle}>Username</th>
                            <th style={tableHeaderStyle}>Email</th>
                            <th style={tableHeaderStyle}>Joined</th>
                            <th style={tableHeaderStyle}>Is Active</th>
                            <th style={tableHeaderStyle}>Is Staff</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tableCellStyle}>{user.username}</td>
                                <td style={tableCellStyle}>{user.email}</td>
                                <td style={tableCellStyle}>{new Date(user.date_joined).toLocaleDateString()}</td>
                                <td style={tableCellStyle}>
                                    {user.is_active ? '✅' : '🚫'}
                                </td>
                                <td style={tableCellStyle}>
                                    {user.is_staff ? '👑' : '👤'}
                                </td>
                                <td style={tableCellStyle}>
                                    {/* Toggle Active Button */}
                                    <button 
                                        onClick={() => handleStatusUpdate(user.id, 'is_active', user.is_active)}
                                        style={actionButtonStyle(user.is_active ? 'deactivate' : 'activate')}
                                    >
                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    
                                    {/* Toggle Staff Button */}
                                    <button 
                                        onClick={() => handleStatusUpdate(user.id, 'is_staff', user.is_staff)}
                                        style={actionButtonStyle('role')}
                                    >
                                        {user.is_staff ? 'Remove Admin' : 'Make Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Basic Inline Styles
const userListContainerStyle = { padding: '20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const tableWrapperStyle = { boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' };
const tableHeaderStyle = { padding: '15px', textAlign: 'left', fontWeight: 'bold' };
const tableCellStyle = { padding: '15px', textAlign: 'left' };
const actionButtonStyle = (type) => {
    let bgColor, color, borderColor;
    if (type === 'deactivate') {
        bgColor = '#ffcdd2'; // Light Red
        color = '#b71c1c';
        borderColor = '#ef9a9a';
    } else if (type === 'activate') {
        bgColor = '#c8e6c9'; // Light Green
        color = '#1b5e20';
        borderColor = '#a5d6a7';
    } else if (type === 'role') {
        bgColor = '#e0f7fa'; // Light Blue
        color = '#006064';
        borderColor = '#b2ebf2';
    }
    return {
        padding: '6px 10px',
        marginRight: '8px',
        cursor: 'pointer',
        borderRadius: '4px',
        border: '1px solid',
        backgroundColor: bgColor,
        color: color,
        borderColor: borderColor,
        fontSize: '0.9em'
    };
};

export default AdminUserList;