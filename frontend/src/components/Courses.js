// src/components/Courses.js
import React, { useState, useEffect, useMemo } from 'react';
import { recordStudyProgress } from './ProductivityChart';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [searchTerm, setSearchTerm] = useState('');

    const sampleCourses = useMemo(() => [
        {
            id: 1,
            title: 'Machine Learning Fundamentals',
            description: 'Learn the basics of machine learning, algorithms, and data preprocessing.',
            instructor: 'Dr. Sarah Chen',
            duration: '8 weeks',
            level: 'Beginner',
            category: 'Data Science',
            rating: 4.7,
            students: 1250,
            color: '#6c63ff',
            modules: 6,
            progress: 0
        },
        {
            id: 2,
            title: 'Web Development Bootcamp',
            description: 'Full-stack web development with React, Node.js, and MongoDB.',
            instructor: 'Prof. Mike Johnson',
            duration: '12 weeks',
            level: 'Intermediate',
            category: 'Programming',
            rating: 4.8,
            students: 890,
            color: '#ff6b6b',
            modules: 8,
            progress: 0
        },
        {
            id: 3,
            title: 'Quantum Physics Introduction',
            description: 'Understand quantum mechanics principles and their applications.',
            instructor: 'Dr. Emily Zhang',
            duration: '10 weeks',
            level: 'Advanced',
            category: 'Physics',
            rating: 4.9,
            students: 450,
            color: '#4ecdc4',
            modules: 7,
            progress: 0
        },
        {
            id: 4,
            title: 'Data Structures & Algorithms',
            description: 'Master essential data structures and algorithms for technical interviews.',
            instructor: 'Prof. David Kim',
            duration: '6 weeks',
            level: 'Intermediate',
            category: 'Computer Science',
            rating: 4.6,
            students: 2100,
            color: '#45b7d1',
            modules: 5,
            progress: 0
        },
        {
            id: 5,
            title: 'English Literature Masterclass',
            description: 'Explore classic and contemporary English literature.',
            instructor: 'Dr. Maria Garcia',
            duration: '8 weeks',
            level: 'Beginner',
            category: 'Literature',
            rating: 4.5,
            students: 670,
            color: '#96ceb4',
            modules: 6,
            progress: 0
        },
        {
            id: 6,
            title: 'Calculus for Engineers',
            description: 'Advanced calculus concepts with engineering applications.',
            instructor: 'Prof. Robert Brown',
            duration: '10 weeks',
            level: 'Advanced',
            category: 'Mathematics',
            rating: 4.7,
            students: 780,
            color: '#feca57',
            modules: 8,
            progress: 0
        }
    ], []);

    useEffect(() => {
        const savedCourses = localStorage.getItem('availableCourses');
        const savedEnrolled = localStorage.getItem('enrolledCourses');

        if (savedCourses) {
            setCourses(JSON.parse(savedCourses));
        } else {
            setCourses(sampleCourses);
            localStorage.setItem('availableCourses', JSON.stringify(sampleCourses));
        }

        if (savedEnrolled) {
            setEnrolledCourses(JSON.parse(savedEnrolled));
        }
    }, [sampleCourses]);

    useEffect(() => {
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }, [enrolledCourses]);

    const enrollInCourse = (courseId) => {
        const courseToEnroll = courses.find(course => course.id === courseId);
        if (courseToEnroll && !enrolledCourses.find(course => course.id === courseId)) {
            const enrolledCourse = {
                ...courseToEnroll,
                enrolledDate: new Date().toISOString(),
                currentModule: 1,
                completedModules: 0,
                progress: 0
            };
            setEnrolledCourses([...enrolledCourses, enrolledCourse]);
            alert(`Successfully enrolled in ${courseToEnroll.title}!`);
        }
    };

    const unenrollFromCourse = (courseId) => {
        if (window.confirm('Are you sure you want to unenroll from this course?')) {
            setEnrolledCourses(enrolledCourses.filter(course => course.id !== courseId));
        }
    };

    const completeModule = (courseId) => {
        setEnrolledCourses(prevCourses => 
            prevCourses.map(course => {
                if (course.id === courseId) {
                    const newCompletedModules = course.completedModules + 1;
                    const newProgress = (newCompletedModules / course.modules) * 100;
                    const newCurrentModule = course.currentModule + 1;
                    
                    if (newCompletedModules <= course.modules) {
                        recordStudyProgress(course.title, 'session');
                    }

                    return {
                        ...course,
                        completedModules: newCompletedModules,
                        progress: newProgress,
                        currentModule: newCurrentModule
                    };
                }
                return course;
            })
        );
    };

    const filteredAvailableCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEnrolledCourses = enrolledCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CourseCard = ({ course, isEnrolled, onEnroll, onUnenroll, onCompleteModule }) => (
        <div className="course-card">
            <div className="course-header" style={{ backgroundColor: course.color }}>
                <div className="course-meta">
                    <span className="course-level">{course.level}</span>
                    <span className="course-category">{course.category}</span>
                </div>
            </div>
            
            <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-info">
                    <div className="info-item">
                        <span className="info-label">Instructor:</span>
                        <span className="info-value">{course.instructor}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Duration:</span>
                        <span className="info-value">{course.duration}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Rating:</span>
                        <span className="info-value">{course.rating} ({course.students} students)</span>
                    </div>
                </div>

                {isEnrolled ? (
                    <div className="enrolled-course-actions">
                        <div className="progress-section">
                            <div className="progress-header">
                                <span>Progress: {Math.round(course.progress)}%</span>
                                <span>Module {course.currentModule} of {course.modules}</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${course.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="action-buttons">
                            <button 
                                onClick={() => onCompleteModule(course.id)}
                                disabled={course.completedModules >= course.modules}
                                className="complete-module-btn"
                            >
                                {course.completedModules >= course.modules ? 'Course Completed!' : 'Complete Module'}
                            </button>
                            <button 
                                onClick={() => onUnenroll(course.id)}
                                className="unenroll-btn"
                            >
                                Unenroll
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => onEnroll(course.id)}
                        className="enroll-btn"
                    >
                        Enroll Now
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="courses-container">
            <div className="courses-header">
                <h1>My Courses</h1>
                <p>Discover and manage your learning journey</p>
            </div>

            <div className="courses-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="tab-buttons">
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
                    >
                        Available Courses ({filteredAvailableCourses.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('enrolled')}
                        className={`tab-button ${activeTab === 'enrolled' ? 'active' : ''}`}
                    >
                        My Enrolled Courses ({enrolledCourses.length})
                    </button>
                </div>
            </div>

            <div className="courses-grid">
                {activeTab === 'available' ? (
                    filteredAvailableCourses.length > 0 ? (
                        filteredAvailableCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={false}
                                onEnroll={enrollInCourse}
                                onUnenroll={unenrollFromCourse}
                                onCompleteModule={completeModule}
                            />
                        ))
                    ) : (
                        <div className="no-courses">
                            <h3>No courses found</h3>
                            <p>Try adjusting your search terms</p>
                        </div>
                    )
                ) : (
                    filteredEnrolledCourses.length > 0 ? (
                        filteredEnrolledCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={true}
                                onEnroll={enrollInCourse}
                                onUnenroll={unenrollFromCourse}
                                onCompleteModule={completeModule}
                            />
                        ))
                    ) : (
                        <div className="no-courses">
                            <h3>No enrolled courses</h3>
                            <p>Enroll in courses to start your learning journey!</p>
                        </div>
                    )
                )}
            </div>

            {enrolledCourses.length > 0 && (
                <div className="courses-stats">
                    <div className="stat-card">
                        <div className="stat-number">{enrolledCourses.length}</div>
                        <div className="stat-label">Courses Enrolled</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {enrolledCourses.reduce((sum, course) => sum + course.completedModules, 0)}
                        </div>
                        <div className="stat-label">Modules Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length) : 0}%
                        </div>
                        <div className="stat-label">Average Progress</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;