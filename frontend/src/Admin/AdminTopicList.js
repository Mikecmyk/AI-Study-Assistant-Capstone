// AdminTopicList.js

import React, { useState, useEffect } from 'react';
import api from '../api'; // Your authenticated API client

function AdminTopicList() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching (Read Operation) ---
    const fetchTopics = async () => {
        try {
            const response = await api.get('/admin/topics/');
            setTopics(response.data);
        } catch (err) {
            console.error('Error fetching admin topics:', err);
            setError('Failed to load topics for administration.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    // --- Delete Operation ---
    const handleDelete = async (topicId) => {
        if (!window.confirm("Are you sure you want to delete this topic?")) return;

        try {
            await api.delete(`/admin/topics/${topicId}/`);
            // Remove the topic from the local state list immediately after successful deletion
            setTopics(topics.filter(topic => topic.id !== topicId));
        } catch (err) {
            console.error('Error deleting topic:', err);
            alert('Failed to delete topic. Check console for details.');
        }
    };

    if (loading) return <p>Loading Admin Topics...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="admin-topic-list-container" style={{ padding: '20px' }}>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📚 Topic Management</h2>
                {/* This button navigates to the TopicForm component for the Create operation */}
                <button 
                    onClick={() => console.log("Navigate to Add Topic Form")} 
                    style={{ padding: '10px 20px', backgroundColor: '#6c63ff', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    + Add New Topic
                </button>
            </header>

            {/* --- Data Table --- */}
            <div className="topic-table-wrapper" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4' }}>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Description</th>
                            <th style={tableHeaderStyle}>Active</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '15px' }}>
                                    No topics found. Please add a new topic.
                                </td>
                            </tr>
                        ) : (
                            topics.map((topic) => (
                                <tr key={topic.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tableCellStyle}>{topic.name}</td>
                                    <td style={tableCellStyle}>{topic.description.substring(0, 50)}...</td>
                                    <td style={tableCellStyle}>{topic.is_active ? '✅ Yes' : '❌ No'}</td>
                                    <td style={tableCellStyle}>
                                        {/* Edit Button */}
                                        <button 
                                            onClick={() => console.log(`Maps to Edit Form for ID: ${topic.id}`)}
                                            style={actionButtonStyle('edit')}
                                        >
                                            Edit
                                        </button>
                                        
                                        {/* Delete Button */}
                                        <button 
                                            onClick={() => handleDelete(topic.id)}
                                            style={actionButtonStyle('delete')}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Basic Inline Styles for clarity (replace with CSS classes later)
const tableHeaderStyle = { padding: '15px', textAlign: 'left', fontWeight: 'bold' };
const tableCellStyle = { padding: '15px', textAlign: 'left' };
const actionButtonStyle = (type) => ({
    padding: '5px 10px',
    marginRight: '5px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: '1px solid',
    backgroundColor: type === 'edit' ? '#fff' : '#f8d7da',
    color: type === 'edit' ? '#6c63ff' : '#721c24',
    borderColor: type === 'edit' ? '#6c63ff' : '#f5c6cb',
});

export default AdminTopicList;