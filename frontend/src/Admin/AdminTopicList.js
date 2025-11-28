// AdminTopicList.js - UPDATED WITH AUTO-REFRESH
import React, { useState, useEffect } from 'react';
import api from '../api';
import TopicForm from './TopicForm';

function AdminTopicList() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);

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

    const handleAddNew = () => {
        setEditingTopic(null);
        setShowForm(true);
    };

    const handleEdit = (topicId) => {
        setEditingTopic(topicId);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingTopic(null);
        fetchTopics();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTopic(null);
    };

    const handleDelete = async (topicId) => {
        if (!window.confirm("Are you sure you want to delete this topic? This action cannot be undone.")) return;

        try {
            await api.delete(`/admin/topics/${topicId}/`);
            setTopics(topics.filter(topic => topic.id !== topicId));
            alert('Topic deleted successfully!');
        } catch (err) {
            console.error('Error deleting topic:', err);
            alert('Failed to delete topic. It might be associated with existing courses.');
        }
    };

    if (showForm) {
        return (
            <div style={formContainerStyle}>
                <TopicForm 
                    topicId={editingTopic}
                    onSaveSuccess={handleFormSuccess}
                    onCancel={handleCancel}
                />
            </div>
        );
    }

    if (loading) return <div style={loadingStyle}>Loading Admin Topics...</div>;
    if (error) return <div style={errorStyle}>Error: {error}</div>;

    return (
        <div className="admin-topic-list-container" style={containerStyle}>
            
            <header style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>Topic Management</h2>
                    <p style={subtitleStyle}>Manage all learning topics in the system</p>
                </div>
                <button onClick={handleAddNew} style={addButtonStyle}>
                    Add New Topic via Form
                </button>
            </header>

            <div style={statsStyle}>
                <div style={statCardStyle}>
                    <h3>Total Topics</h3>
                    <p style={statNumberStyle}>{topics.length}</p>
                </div>
                <div style={statCardStyle}>
                    <h3>Active Topics</h3>
                    <p style={statNumberStyle}>{topics.filter(t => t.is_active).length}</p>
                </div>
                <div style={statCardStyle}>
                    <h3>Inactive Topics</h3>
                    <p style={statNumberStyle}>{topics.filter(t => !t.is_active).length}</p>
                </div>
            </div>

            <div className="topic-table-wrapper" style={tableWrapperStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={tableHeaderRowStyle}>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Description</th>
                            <th style={tableHeaderStyle}>Status</th>
                            <th style={tableHeaderStyle}>Created</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={noDataStyle}>
                                    No topics found. Create your first topic to get started!
                                </td>
                            </tr>
                        ) : (
                            topics.map((topic) => (
                                <tr key={topic.id} style={tableRowStyle}>
                                    <td style={tableCellStyle}>
                                        <strong>{topic.name}</strong>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {topic.description ? (
                                            <>
                                                {topic.description.substring(0, 60)}
                                                {topic.description.length > 60 ? '...' : ''}
                                            </>
                                        ) : (
                                            <em style={{ color: '#999' }}>No description</em>
                                        )}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={statusStyle(topic.is_active)}>
                                            {topic.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {new Date(topic.created_at || topic.date_created).toLocaleDateString()}
                                    </td>
                                    <td style={{ ...tableCellStyle, minWidth: '200px' }}>
                                        <button 
                                            onClick={() => handleEdit(topic.id)}
                                            style={actionButtonStyle('edit')}
                                            title="Edit this topic"
                                        >
                                            Edit
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleDelete(topic.id)}
                                            style={actionButtonStyle('delete')}
                                            title="Delete this topic"
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

const containerStyle = { 
    padding: '30px', 
    backgroundColor: 'white', 
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const headerStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
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

const addButtonStyle = { 
    padding: '12px 25px', 
    backgroundColor: '#3498db', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
};

const tableWrapperStyle = { 
    borderRadius: '8px', 
    overflow: 'hidden',
    border: '1px solid #e1e8ed'
};

const tableStyle = { 
    width: '100%', 
    borderCollapse: 'collapse'
};

const tableHeaderRowStyle = { 
    backgroundColor: '#34495e' 
};

const tableHeaderStyle = { 
    padding: '18px', 
    textAlign: 'left', 
    fontWeight: 'bold',
    color: 'white',
    fontSize: '1.1em'
};

const tableRowStyle = { 
    borderBottom: '1px solid #e1e8ed',
    transition: 'background-color 0.2s'
};

const tableCellStyle = { 
    padding: '16px', 
    textAlign: 'left',
    verticalAlign: 'top'
};

const noDataStyle = { 
    textAlign: 'center', 
    padding: '40px', 
    color: '#7f8c8d',
    fontSize: '1.2em'
};

const actionButtonStyle = (type) => ({
    padding: '8px 15px',
    margin: '0 5px',
    cursor: 'pointer',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.9em',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    backgroundColor: type === 'edit' ? '#3498db' : '#e74c3c',
    color: 'white',
    boxShadow: type === 'edit' ? '0 2px 4px rgba(52, 152, 219, 0.3)' : '0 2px 4px rgba(231, 76, 60, 0.3)',
});

const statusStyle = (isActive) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: 'bold',
    backgroundColor: isActive ? '#d5f4e6' : '#fadbd8',
    color: isActive ? '#27ae60' : '#e74c3c',
});

const loadingStyle = {
    padding: '40px',
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#3498db'
};

const errorStyle = {
    padding: '40px',
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#e74c3c',
    backgroundColor: '#fadbd8',
    borderRadius: '8px',
    margin: '20px'
};

const formContainerStyle = {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    margin: '20px 0'
};

const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const statCardStyle = {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e1e8ed'
};

const statNumberStyle = {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '10px 0 0 0'
};

export default AdminTopicList;