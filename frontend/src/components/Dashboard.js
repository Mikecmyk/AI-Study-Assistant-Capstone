// Dashboard.js (FULL CODE - WITH SCHEDULE CALENDAR INTEGRATION)

import React, { useState, useEffect } from 'react';
import api from '../api'; 
import StudyTools from './StudyTools';
import StudyTaskCard from './StudyTaskCard'; 
import ProductivityChart from './ProductivityChart'; 
// IMPORT THE NEW SCHEDULE/CALENDAR COMPONENT
import ScheduleCalendar from './ScheduleCalendar'; 
import './Dashboard.css'; 


// --- MOCK DATA FOR TASK CARDS ---
const MOCK_TASKS = [
    { id: 1, title: 'Review key Quantum Concepts', subject: 'Physics', difficulty: 'High', dueTime: 'Today, 5 PM', isCompleted: false },
    { id: 2, title: 'Practice Grammar Exercises', subject: 'English', difficulty: 'Mid', dueTime: 'Tomorrow, 10 AM', isCompleted: false },
    { id: 3, title: 'Read Chapter 4 Summary', subject: 'History', difficulty: 'Easy', dueTime: 'Sep 15', isCompleted: false },
    { id: 4, title: 'Start Python Project', subject: 'Programming', difficulty: 'High', dueTime: 'Sep 20', isCompleted: true },
];
// ---------------------------------


function Dashboard({ logout }) {
    const [topics, setTopics] = useState([]);
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [isLoading, setIsLoading] = useState(true);
    // 1. STATE VARIABLES FOR AI STUDY PLAN GENERATOR
    const [fetchError, setFetchError] = useState(null); 
    const [studyPlanError, setStudyPlanError] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [duration, setDuration] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await api.get('/topics/'); 
                setTopics(response.data);

                if (response.data.length > 0) {
                    setSelectedTopic(response.data[0].name);
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching topics:", err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload(); 
                }
                setFetchError("Failed to load study topics. Please log in again.");
                setIsLoading(false);
            }
        };

        fetchTopics();
    }, []);

    // 2. FUNCTION FOR AI STUDY PLAN GENERATOR (Used in form onSubmit)
    const handleGenerateSession = async (e) => {
        e.preventDefault();
        setGeneratedContent('');
        setStudyPlanError(null);
        setIsGenerating(true);

        try {
            const response = await api.post('/sessions/', {
                topic_name: selectedTopic,
                duration_input: duration,
            });

            setGeneratedContent(response.data.generated_content);
            alert(`Study session created successfully for ${response.data.topic_name}!`);
        } catch (err) {
            console.error(
                "Error generating session:",
                err.response ? err.response.data : err
            );
            setStudyPlanError("Failed to generate study plan. Check console for details.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleToggleComplete = (id) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };
    
    const handleViewDetails = (id) => {
        alert(`Navigating to details for Task ID: ${id}`);
    };


    if (isLoading) {
        return <div className="dashboard-container">Loading Dashboard...</div>;
    }

    // Display global fetch error if topics couldn't load after initial loading screen
    if (fetchError) {
        return <div className="dashboard-container error-message">{fetchError}</div>;
    }


    return (
        <div className="dashboard-container">
            
            {/* 3. LEFT SIDEBAR */}
            <aside className="sidebar">
                <h3 className="sidebar-header">Study Core</h3>
                
                <div className="sidebar-nav-links">
                    <a href="/" className="nav-link active">🏠 Dashboard</a>
                    <a href="/courses" className="nav-link">📚 My Courses</a>
                    <a href="/admin" className="nav-link">👑 Admin Tools</a>
                </div>

                <button 
                    onClick={logout} 
                    className="logout-button action-button" 
                    style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                    Log Out
                </button>
            </aside>

            {/* 4. MAIN CONTENT AREA */}
            <div className="main-content">

                {/* Study Plan Generator Form */}
                <div className="dashboard-card">
                    <h2>Start a New Study Session</h2>
                    
                    <form onSubmit={handleGenerateSession} className="study-form">
                        {studyPlanError && <p className="error-message">Error: {studyPlanError}</p>} 

                        <label>
                            Topic:
                            <select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                required
                            >
                                {topics.map((topic) => (
                                    <option key={topic.id} value={topic.name}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Duration (e.g., 3 days, 2 hours):
                            <input
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="e.g., 2 hours or 3 days"
                                required
                            />
                        </label>

                        <button type="submit" disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate AI Study Plan'}
                        </button>
                    </form>

                    {generatedContent && (
                        <div className="generated-content">
                            <h3>Generated Study Plan:</h3>
                            <pre>
                                {generatedContent}
                            </pre>
                        </div>
                    )}
                </div>
                
                {/* --- URGENT TASKS SECTION --- */}
                <div className="urgent-tasks dashboard-card">
                    <h3>Urgent Tasks ({tasks.filter(t => !t.isCompleted).length})</h3>
                    
                    <div className="task-cards-container">
                        {tasks.map(task => (
                            <StudyTaskCard
                                key={task.id}
                                {...task}
                                onToggleComplete={handleToggleComplete}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                </div>

                {/* AI Study Tools (Notes/Quiz) */}
                <div className="ai-study-tools dashboard-card">
                    <StudyTools topics={topics} /> 
                </div>

                {/* --- PRODUCTIVITY CHART --- */}
                <div className="productivity-chart dashboard-card">
                    <ProductivityChart /> 
                </div>
                
                <div className="study-history dashboard-card">
                    <h2>Recent Study History</h2>
                    <p>Your history will appear here.</p>
                </div>

            </div>
            
            {/* 5. RIGHT SCHEDULE/CALENDAR COLUMN - NEW COMPONENT INTEGRATED */}
            <aside className="right-schedule">
                <ScheduleCalendar />
            </aside>
        </div>
    );
}

export default Dashboard;