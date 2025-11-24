// AdminCourseList.js - FULLY FUNCTIONAL WITH FORM INTEGRATION

import React, { useState, useEffect } from 'react';
import api from '../api';
import CourseForm from './CourseForm';

function AdminCourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/admin/courses/');
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

    const handleAddNew = () => {
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleEdit = (courseId) => {
        setEditingCourse(courseId);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingCourse(null);
        fetchCourses();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCourse(null);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? All associated data will be lost.")) return;

        try {
            await api.delete(`/admin/courses/${courseId}/`);
            setCourses(courses.filter(course => course.id !== courseId));
            alert('Course deleted successfully!');
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Failed to delete course. It might have active enrollments.');
        }
    };

    if (showForm) {
        return (
            <div style={formContainerStyle}>
                <CourseForm 
                    courseId={editingCourse}
                    onSaveSuccess={handleFormSuccess}
                    onCancel={handleCancel}
                />
            </div>
        );
    }

    if (loading) return <div style={loadingStyle}>Loading Admin Courses...</div>;
    if (error) return <div style={errorStyle}>Error: {error}</div>;

    return (
        <div className="admin-course-list-container" style={containerStyle}>
            
            <header style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>Course Management</h2>
                    <p style={subtitleStyle}>Organize topics into structured learning courses</p>
                </div>
                <button onClick={handleAddNew} style={addButtonStyle}>
                    Add New Course
                </button>
            </header>

            <div style={statsStyle}>
                <div style={statCardStyle}>
                    <h3>Total Courses</h3>
                    <p style={statNumberStyle}>{courses.length}</p>
                </div>
                <div style={statCardStyle}>
                    <h3>Published</h3>
                    <p style={statNumberStyle}>{courses.filter(c => c.is_published).length}</p>
                </div>
                <div style={statCardStyle}>
                    <h3>Draft</h3>
                    <p style={statNumberStyle}>{courses.filter(c => !c.is_published).length}</p>
                </div>
            </div>

            <div className="course-table-wrapper" style={tableWrapperStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={tableHeaderRowStyle}>
                            <th style={tableHeaderStyle}>Course Name</th>
                            <th style={tableHeaderStyle}>Description</th>
                            <th style={tableHeaderStyle}>Topics</th>
                            <th style={tableHeaderStyle}>Duration</th>
                            <th style={tableHeaderStyle}>Status</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={noDataStyle}>
                                    No courses found. Create your first course to organize topics!
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} style={tableRowStyle}>
                                    <td style={tableCellStyle}>
                                        <strong>{course.name}</strong>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {course.description ? (
                                            <>
                                                {course.description.substring(0, 50)}
                                                {course.description.length > 50 ? '...' : ''}
                                            </>
                                        ) : (
                                            <em style={{ color: '#999' }}>No description</em>
                                        )}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={topicCountStyle}>
                                            {course.topics ? course.topics.length : 0} topics
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {course.duration_hours} hours
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={statusStyle(course.is_published)}>
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ ...tableCellStyle, minWidth: '180px' }}>
                                        <button 
                                            onClick={() => handleEdit(course.id)}
                                            style={actionButtonStyle('edit')}
                                            title="Edit this course"
                                        >
                                            Edit
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleDelete(course.id)}
                                            style={actionButtonStyle('delete')}
                                            title="Delete this course"
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
    backgroundColor: '#27ae60', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    boxShadow: '0 2px 4px rgba(39, 174, 96, 0.3)'
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

const statusStyle = (isPublished) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: 'bold',
    backgroundColor: isPublished ? '#d5f4e6' : '#fef9e7',
    color: isPublished ? '#27ae60' : '#f39c12',
});

const topicCountStyle = {
    padding: '4px 10px',
    backgroundColor: '#e8f4fd',
    color: '#2980b9',
    borderRadius: '12px',
    fontSize: '0.9em',
    fontWeight: 'bold'
};

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

export default AdminCourseList;