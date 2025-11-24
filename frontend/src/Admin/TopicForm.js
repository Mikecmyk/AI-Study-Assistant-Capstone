// TopicForm.js (Handles Create and Update)

import React, { useState, useEffect } from 'react';
import api from '../api'; 

// Accepts topicId as a prop: if present, we are in Edit mode.
function TopicForm({ topicId, onSaveSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const isEditMode = !!topicId; // True if an ID is passed

    // --- 1. Fetch data if in Edit Mode (Update Operation) ---
    useEffect(() => {
        if (isEditMode) {
            const fetchTopic = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/admin/topics/${topicId}/`);
                    // Populate the form with existing data
                    setFormData(response.data);
                } catch (err) {
                    setError('Failed to load topic details for editing.');
                } finally {
                    setLoading(false);
                }
            };
            fetchTopic();
        }
    }, [topicId, isEditMode]);

    // --- 2. Handle Form Changes ---
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    // --- 3. Handle Submission (Create or Update) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            if (isEditMode) {
                // PUT/PATCH for Update
                await api.patch(`/admin/topics/${topicId}/`, formData);
            } else {
                // POST for Create
                await api.post('/admin/topics/', formData);
            }
            
            alert(`Topic successfully ${isEditMode ? 'updated' : 'created'}!`);
            onSaveSuccess(); // Call a function passed by the parent to refresh the list
            
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.name || 'Failed to save topic.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <p>Loading topic details...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>{isEditMode ? ' Edit Topic' : ' Create New Topic'}</h3>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Topic Name:</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Description:</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required 
                        style={{ ...inputStyle, height: '100px' }}
                    />
                </div>

                <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
                    <input 
                        type="checkbox" 
                        name="is_active" 
                        checked={formData.is_active} 
                        onChange={handleChange} 
                        style={{ marginRight: '10px' }}
                    />
                    <label style={{ margin: 0, fontWeight: 'normal' }}>Make Active (Visible to Learners)</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" onClick={onCancel} style={cancelButtonStyle}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Topic' : 'Create Topic')}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Basic Inline Styles
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const submitButtonStyle = (loading) => ({
    padding: '10px 20px',
    backgroundColor: loading ? '#aaa' : '#6c63ff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
});
const cancelButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#eee',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
};

export default TopicForm;