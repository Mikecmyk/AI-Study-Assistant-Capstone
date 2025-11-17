// CourseForm.js (Handles Create and Update for Courses)

import React, { useState, useEffect } from 'react';
import api from '../api'; 

function CourseForm({ courseId, onSaveSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration_hours: 10, // Default value
        is_published: false,
    });
    const [allTopics, setAllTopics] = useState([]);
    const [selectedTopicIds, setSelectedTopicIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const isEditMode = !!courseId; 

    // --- 1. Fetch All Topics and Existing Course Data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch ALL Topics for the multi-select dropdown
                const topicsResponse = await api.get('/admin/topics/?format=json'); 
                setAllTopics(topicsResponse.data);

                // If in Edit Mode, fetch existing course data
                if (isEditMode) {
                    const courseResponse = await api.get(`/admin/courses/${courseId}/`);
                    const courseData = courseResponse.data;
                    
                    setFormData({
                        name: courseData.name,
                        description: courseData.description,
                        duration_hours: courseData.duration_hours,
                        is_published: courseData.is_published,
                    });
                    
                    // Extract IDs of existing topics for pre-selection
                    const existingTopicIds = courseData.topics.map(topic => topic.id);
                    setSelectedTopicIds(existingTopicIds);
                }
            } catch (err) {
                setError('Failed to load necessary data (Topics or Course).');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, isEditMode]);

    // --- 2. Handle Form Changes ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // --- 3. Handle Multi-Select Topics Change ---
    const handleTopicChange = (e) => {
        // Convert NodeList of selected options to an array of values (IDs)
        const options = Array.from(e.target.options);
        const values = options.filter(opt => opt.selected).map(opt => parseInt(opt.value));
        setSelectedTopicIds(values);
    };

    // --- 4. Handle Submission (Create or Update) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Prepare data to send: combine formData with the topic IDs
        const dataToSend = {
            ...formData,
            topics: selectedTopicIds, // Send only the IDs for M2M relationship
        };

        try {
            if (isEditMode) {
                // PATCH for Update
                await api.patch(`/admin/courses/${courseId}/`, dataToSend);
            } else {
                // POST for Create
                await api.post('/admin/courses/', dataToSend);
            }
            
            alert(`Course successfully ${isEditMode ? 'updated' : 'created'}!`);
            onSaveSuccess(); 
            
        } catch (err) {
            console.error('Submission error:', err.response?.data);
            setError(err.response?.data?.name || 'Failed to save course.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading Course form...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div style={formContainerStyle}>
            <h3>{isEditMode ? '✍️ Edit Course' : '✨ Create New Course'}</h3>
            
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Course Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
                </div>

                {/* Description */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Description:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required style={{ ...inputStyle, height: '80px' }} />
                </div>

                {/* Duration */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Duration (Estimated Hours):</label>
                    <input type="number" name="duration_hours" value={formData.duration_hours} onChange={handleChange} required min="1" style={inputStyle} />
                </div>

                {/* Topics (Multi-Select) */}
                <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Select Topics:</label>
                    <select 
                        multiple={true}
                        name="topics" 
                        value={selectedTopicIds.map(String)} // Convert numbers to strings for select value
                        onChange={handleTopicChange} 
                        style={selectMultipleStyle}
                        required={false} // Allow courses with no topics initially
                    >
                        {allTopics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                    <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>Hold Ctrl/Cmd to select multiple topics.</p>
                </div>

                {/* Published Status */}
                <div style={{ ...fieldGroupStyle, display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} style={{ marginRight: '10px' }} />
                    <label style={{ margin: 0, fontWeight: 'normal' }}>Publish Course (Visible to Learners)</label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <button type="button" onClick={onCancel} style={cancelButtonStyle}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course')}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Basic Inline Styles
const formContainerStyle = { padding: '20px', maxWidth: '700px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const fieldGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const selectMultipleStyle = { ...inputStyle, height: '150px' };
const submitButtonStyle = (loading) => ({
    padding: '10px 20px', backgroundColor: loading ? '#aaa' : '#6c63ff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
});
const cancelButtonStyle = { padding: '10px 20px', backgroundColor: '#eee', color: '#333', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', };

export default CourseForm;