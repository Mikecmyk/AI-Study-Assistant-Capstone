// AdminCourseList.js

import React, { useState, useEffect } from 'react';
import api from '../api'; // Your authenticated API client

function AdminCourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching (Read Operation) ---
    const fetchCourses = async () => {
        try {
            const response = await api.get('/admin/courses/'); // Hitting the new endpoint
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching admin courses:', err);
            setError('Failed to load courses for administration.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // --- Delete Operation ---
    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        try {
            await api.delete(`/admin/courses/${courseId}/`);
            // Optimistically update the UI
            setCourses(courses.filter(course => course.id !== courseId));
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Failed to delete course.');
        }
    };

    if (loading) return <p>Loading Admin Courses...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="admin-course-list-container" style={{ padding: '20px' }}>
            
            <header style={headerStyle}>
                <h2>🎓 Course Management</h2>
                {/* This button navigates to the CourseForm component for the Create operation */}
                <button 
                    onClick={() => console.log("Navigate to Add Course Form")} 
                    style={addButtonStyles}
                >
                    + Add New Course
                </button>
            </header>

            {/* --- Data Table --- */}
            <div className="course-table-wrapper" style={tableWrapperStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4' }}>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Topics</th>
                            <th style={tableHeaderStyle}>Duration (hrs)</th>
                            <th style={tableHeaderStyle}>Published</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>
                                    No courses found. Please add a new course.
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tableCellStyle}>{course.name}</td>
                                    {/* Display the count of associated topics */}
                                    <td style={tableCellStyle}>{course.topics ? course.topics.length : 0}</td> 
                                    <td style={tableCellStyle}>{course.duration_hours}</td>
                                    <td style={tableCellStyle}>{course.is_published ? '✅ Yes' : '❌ No'}</td>
                                    <td style={tableCellStyle}>
                                        {/* Edit Button */}
                                        <button 
                                            onClick={() => console.log(`Maps to Edit Form for ID: ${course.id}`)}
                                            style={actionButtonStyle('edit')}
                                        >
                                            Edit
                                        </button>
                                        
                                        {/* Delete Button */}
                                        <button 
                                            onClick={() => handleDelete(course.id)}
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

// Basic Styles (reused from Topic List for consistent design)
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const addButtonStyles = { padding: '10px 20px', backgroundColor: '#6c63ff', color: 'white', border: 'none', borderRadius: '5px' };
const tableWrapperStyle = { boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' };
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

export default AdminCourseList;