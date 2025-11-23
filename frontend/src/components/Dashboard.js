// Dashboard.js - OPTIMIZED USER FLOW + CALENDAR-TASKS INTEGRATION + SMART REMINDERS + AI RECOMMENDATIONS
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; 
import StudyTools from './StudyTools';
import StudyTaskCard from './StudyTaskCard'; 
import ProductivityChart from './ProductivityChart'; 
import ScheduleCalendar from './ScheduleCalendar'; 
import TopicManager from './TopicManager';
import StudyHistory from './StudyHistory';
import DocumentUpload from './DocumentUpload';
import AITutor from './AITutor';
import AIRecommendations from './AIRecommendations'; // ADD AI RECOMMENDATIONS IMPORT
import { recordStudyProgress } from './ProductivityChart';
import './Dashboard.css'; 
import { Link } from 'react-router-dom';

const MOCK_TASKS = [
    { id: 1, title: 'Review key Quantum Concepts', subject: 'Physics', difficulty: 'High', dueTime: 'Today, 5 PM', isCompleted: false },
    { id: 2, title: 'Practice Grammar Exercises', subject: 'English', difficulty: 'Mid', dueTime: 'Tomorrow, 10 AM', isCompleted: false },
    { id: 3, title: 'Read Chapter 4 Summary', subject: 'History', difficulty: 'Easy', dueTime: 'Sep 15', isCompleted: false },
    { id: 4, title: 'Start Python Project', subject: 'Programming', difficulty: 'High', dueTime: 'Sep 20', isCompleted: true },
];

// STUDY HISTORY TRACKING FUNCTION
const saveToStudyHistory = (topic, duration, content, type = 'study_plan') => {
    const studySession = {
        id: Date.now(),
        topic: topic,
        duration: duration,
        content: content.substring(0, 200) + '...',
        type: type,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    const existingHistory = localStorage.getItem('studyHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    const updatedHistory = [studySession, ...history].slice(0, 50);
    localStorage.setItem('studyHistory', JSON.stringify(updatedHistory));
};

function Dashboard({ logout }) {
    const [topics, setTopics] = useState([]);
    const [tasks, setTasks] = useState([]); // Start with empty array - will be populated with combined tasks
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null); 
    const [studyPlanError, setStudyPlanError] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedSubtopics, setSelectedSubtopics] = useState([]);
    const [duration, setDuration] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [refreshTopics, setRefreshTopics] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [activeSection, setActiveSection] = useState('productivity');
    const [notificationPermission, setNotificationPermission] = useState('default');

    // Enhanced topic added handler - automatically switches to study section
    const handleTopicAdded = (newTopic) => {
        console.log('🎯 New topic added:', newTopic);
        setRefreshTopics(prev => !prev);
        
        // Auto-select the new topic and switch to study section
        const topicName = newTopic.name || newTopic;
        setSelectedTopic(topicName);
        setActiveSection('study');
        
        // Show success message with guidance
        setTimeout(() => {
            alert(`✅ Topic "${topicName}" added! Now generate your study plan.`);
        }, 300);
    };

    // Load tasks from both MOCK_TASKS and calendar events
    const loadAllTasks = useCallback(() => {
        // Get calendar tasks
        const calendarTasks = JSON.parse(localStorage.getItem('calendarTasks') || '[]');
        
        // Combine with mock tasks (filter out duplicates)
        const mockTasks = MOCK_TASKS.filter(mockTask => 
            !calendarTasks.some(calTask => calTask.title === mockTask.title)
        );
        
        const allTasks = [...calendarTasks, ...mockTasks];
        setTasks(allTasks);
    }, []);

    // Initialize tasks and notification permission
    useEffect(() => {
        loadAllTasks();
        
        // Set up interval to refresh tasks (in case calendar events change)
        const interval = setInterval(loadAllTasks, 30000); // Check every 30 seconds
        
        // Check notification permission
        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);
        }
        
        return () => clearInterval(interval);
    }, [loadAllTasks]);

    // Request notification permission
    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
                if (permission === "granted") {
                    console.log("✅ Notification permission granted");
                    alert("🔔 Notifications enabled! You'll get reminders 30 minutes before study sessions.");
                }
            });
        }
    };

    // COPY TO CLIPBOARD FUNCTION
    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedContent);
            setCopySuccess('✅ Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setCopySuccess('❌ Failed to copy');
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };

    // DOWNLOAD AS TXT FILE FUNCTION
    const handleDownloadTxt = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        const topicName = selectedTopic.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        element.download = `Zonlus_Study_Notes_${topicName}_${date}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setCopySuccess('📥 Downloaded as text file!');
        setTimeout(() => setCopySuccess(''), 3000);
    };

    // DOWNLOAD AS PDF FUNCTION
    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        const topicName = selectedTopic || 'Study Notes';
        const date = new Date().toLocaleDateString();
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Zonlus Study Notes - ${topicName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                        .header { text-align: center; border-bottom: 2px solid #4361ee; padding-bottom: 20px; margin-bottom: 30px; }
                        .topic { color: #4361ee; font-size: 24px; margin-bottom: 10px; }
                        .date { color: #666; font-size: 14px; }
                        .content { white-space: pre-wrap; font-size: 14px; }
                        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
                        @media print { body { margin: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="topic">${topicName}</div>
                        <div class="date">Generated on ${date} via Zonlus AI</div>
                    </div>
                    <div class="content">${generatedContent}</div>
                    <div class="footer">
                        Created with Zonlus - Your AI Exam Partner
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        setCopySuccess('🖨️ Opening print dialog for PDF...');
        setTimeout(() => setCopySuccess(''), 3000);
    };

    // FIXED: Improved topic fetching
    const fetchTopics = useCallback(async () => {
        try {
            let apiTopics = [];
            
            try {
                const response = await api.get('/topics/'); 
                if (response.data && Array.isArray(response.data)) {
                    apiTopics = response.data;
                } else if (response.data && response.data.topics && Array.isArray(response.data.topics)) {
                    apiTopics = response.data.topics;
                } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
                    apiTopics = response.data.results;
                }
            } catch (apiError) {
                console.warn('⚠️ API fetch failed, using localStorage only:', apiError);
            }
            
            const storedTempTopics = localStorage.getItem('temporaryTopics');
            const tempTopics = storedTempTopics ? JSON.parse(storedTempTopics) : [];
            const allTopics = [...apiTopics, ...tempTopics];
            
            setTopics(allTopics);

            if (allTopics.length > 0 && !selectedTopic) {
                const firstTopic = allTopics[0].name || allTopics[0];
                setSelectedTopic(firstTopic);
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
    }, [selectedTopic]);

    useEffect(() => {
        console.log('🔄 Fetching topics...');
        fetchTopics();
    }, [fetchTopics, refreshTopics]);

    // Extract subtopics from selected topic
    const getAvailableSubtopics = () => {
        if (!selectedTopic) return [];
        
        const topicObj = topics.find(t => (t.name || t) === selectedTopic);
        if (topicObj && topicObj.subtopics) {
            return topicObj.subtopics;
        }
        
        if (selectedTopic.includes(': ')) {
            const [mainSubject, specificArea] = selectedTopic.split(': ');
            return [specificArea];
        }
        
        return [selectedTopic];
    };

    const handleSubtopicToggle = (subtopic) => {
        setSelectedSubtopics(prev => 
            prev.includes(subtopic) 
                ? prev.filter(s => s !== subtopic)
                : [...prev, subtopic]
        );
    };

    const handleGenerateSession = async (e) => {
        e.preventDefault();
        setGeneratedContent('');
        setStudyPlanError(null);
        setCopySuccess('');
        setIsGenerating(true);

        try {
            const topicParts = selectedTopic.split(': ');
            const mainSubject = topicParts[0];
            const specificArea = topicParts[1] || topicParts[0];
            const finalSubtopics = selectedSubtopics.length > 0 ? selectedSubtopics : [specificArea];

            console.log('🚀 Generating study plan for:', { topic: selectedTopic, mainSubject, specificArea, subtopics: finalSubtopics, duration });

            const response = await api.post('/sessions/', {
                topic_name: selectedTopic,
                duration_input: duration,
                main_subject: mainSubject,
                specific_area: specificArea,
                subtopics: finalSubtopics,
                prompt_type: 'focused_study_plan'
            });

            const generatedContentText = response.data.generated_content;
            setGeneratedContent(generatedContentText);
            
            recordStudyProgress(specificArea, 'study_plan');
            saveToStudyHistory(selectedTopic, duration, generatedContentText, 'study_plan');
            
            // Auto-scroll to generated content
            setTimeout(() => {
                document.querySelector('.generated-content')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
            
        } catch (err) {
            console.error("❌ Error generating session:", err.response ? err.response.data : err);
            setStudyPlanError(
                err.response?.data?.error || 
                "Failed to generate study plan. Please try a more specific topic."
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // Enhanced task completion handler
    const handleToggleComplete = (id) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
        
        // If it's a calendar task, also update the original event completion
        const task = tasks.find(t => t.id === id);
        if (task && task.eventId) {
            console.log(`📅 Calendar task "${task.title}" marked as ${task.isCompleted ? 'incomplete' : 'completed'}`);
            
            // You could update the calendar event status here
            const events = JSON.parse(localStorage.getItem('studyEvents') || '[]');
            const updatedEvents = events.map(event => 
                event.id === task.eventId 
                    ? { ...event, completed: !task.isCompleted }
                    : event
            );
            localStorage.setItem('studyEvents', JSON.stringify(updatedEvents));
        }
    };

    // Enhanced task details handler
    const handleViewDetails = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task && task.eventId) {
            // For calendar tasks, show event details
            const events = JSON.parse(localStorage.getItem('studyEvents') || '[]');
            const event = events.find(e => e.id === task.eventId);
            
            if (event) {
                alert(`📅 Study Session Details:\n\n📚 Topic: ${event.topic || event.title}\n🗓️ Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n⏰ Time: ${event.time}\n⏱️ Duration: ${event.duration}\n🎯 Priority: ${event.priority}\n📝 Description: ${event.description || 'No description'}`);
            } else {
                alert(`📅 Study Session: ${task.title}\n📚 Subject: ${task.subject}\n⏰ Due: ${task.dueTime}`);
            }
        } else {
            // For regular tasks
            alert(`Navigating to details for Task ID: ${id}`);
        }
    };

    const clearOldTopics = () => {
        localStorage.removeItem('temporaryTopics');
        setRefreshTopics(prev => !prev);
        alert('🗑️ Old topics cleared! Refreshing topics list...');
    };

    if (isLoading) {
        return <div className="dashboard-container">Loading Dashboard...</div>;
    }

    if (fetchError) {
        return <div className="dashboard-container error-message">{fetchError}</div>;
    }

    const availableSubtopics = getAvailableSubtopics();
    const incompleteTasksCount = tasks.filter(t => !t.isCompleted).length;

    return (
        <div className="dashboard-container">
            
            <aside className="sidebar">
                <h3 className="sidebar-header">Zonlus</h3>
                
                <div className="sidebar-nav-links">
                    <Link to="/dashboard" className="nav-link active">🏠 Dashboard</Link>
                    <Link to="/courses" className="nav-link">📚 My Courses</Link>
                    <Link to="/admin" className="nav-link">👑 Admin Tools</Link>
                </div>

                <button 
                    onClick={logout} 
                    className="logout-button action-button" 
                    style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                    Log Out
                </button>
            </aside>

            <div className="main-content">
                {/* 🎯 DASHBOARD NAVIGATION TABS */}
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-button ${activeSection === 'productivity' ? 'active' : ''}`}
                        onClick={() => setActiveSection('productivity')}
                    >
                        📊 Productivity Overview
                    </button>
                    <button 
                        className={`tab-button ${activeSection === 'study' ? 'active' : ''}`}
                        onClick={() => setActiveSection('study')}
                    >
                        🎯 Study Session
                    </button>
                    <button 
                        className={`tab-button ${activeSection === 'tools' ? 'active' : ''}`}
                        onClick={() => setActiveSection('tools')}
                    >
                        🛠️ Study Tools
                    </button>
                </div>

                {/* Notification Permission Banner */}
                {notificationPermission !== 'granted' && (
                    <div className="notification-permission-banner">
                        🔔 Enable notifications to get reminders 30 minutes before study sessions
                        <button onClick={requestNotificationPermission}>
                            Enable Notifications
                        </button>
                    </div>
                )}

                {/* 📊 PRODUCTIVITY OVERVIEW SECTION (DEFAULT VIEW) */}
                {activeSection === 'productivity' && (
                    <div className="section-content">
                        {/* AI RECOMMENDATIONS - FIRST THING USERS SEE */}
                        <div className="dashboard-card">
                            <AIRecommendations />
                        </div>

                        <div className="productivity-chart dashboard-card">
                            <ProductivityChart /> 
                        </div>
                        
                        <div className="urgent-tasks dashboard-card">
                            <div className="tasks-header">
                                <h3>📋 Urgent Tasks ({incompleteTasksCount})</h3>
                                <small>Includes calendar study sessions + regular tasks</small>
                            </div>
                            <div className="task-cards-container">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <StudyTaskCard
                                            key={task.id}
                                            {...task}
                                            onToggleComplete={handleToggleComplete}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))
                                ) : (
                                    <div className="no-tasks">
                                        <p>🎉 No urgent tasks! Add study sessions to your calendar or create new tasks.</p>
                                        <button 
                                            onClick={() => setActiveSection('study')}
                                            className="add-tasks-btn"
                                        >
                                            📅 Plan Study Session
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="study-history dashboard-card">
                            <StudyHistory />
                        </div>

                        <div className="right-schedule">
                            <ScheduleCalendar />
                        </div>
                    </div>
                )}

                {/* 🎯 STUDY SESSION SECTION */}
                {activeSection === 'study' && (
                    <div className="section-content">
                        {/* QUICK TOPIC ADDITION */}
                        <div className="dashboard-card">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                <h3>🎯 Step 1: Add Learning Topic</h3>
                                <button onClick={clearOldTopics} className="clear-topics-btn">
                                    🗑️ Clear Old Topics
                                </button>
                            </div>
                            <TopicManager onTopicAdded={handleTopicAdded} />
                        </div>

                        {/* STUDY SESSION GENERATOR */}
                        <div className="dashboard-card">
                            <div className="session-header">
                                <h2>🚀 Step 2: Start Your Study Session</h2>
                                <p className="session-instruction">Select your topic and generate a personalized study plan</p>
                            </div>
                            
                            <div className="topic-selection-guide">
                                <div className="guide-item">
                                    <span className="guide-number">1</span>
                                    <span>Add a topic above or select existing one</span>
                                </div>
                                <div className="guide-item">
                                    <span className="guide-number">2</span>
                                    <span>Choose specific areas to focus on</span>
                                </div>
                                <div className="guide-item">
                                    <span className="guide-number">3</span>
                                    <span>Set your study duration</span>
                                </div>
                                <div className="guide-item">
                                    <span className="guide-number">4</span>
                                    <span>Generate AI-powered study plan</span>
                                </div>
                            </div>
                            
                            <form onSubmit={handleGenerateSession} className="study-form">
                                {studyPlanError && <p className="error-message">Error: {studyPlanError}</p>} 

                                <div className="form-group">
                                    <label>
                                        📚 Selected Topic:
                                        <select
                                            value={selectedTopic}
                                            onChange={(e) => {
                                                setSelectedTopic(e.target.value);
                                                setSelectedSubtopics([]);
                                            }}
                                            required
                                            className="topic-select"
                                        >
                                            <option value="">Select a topic...</option>
                                            {topics.map((topic, index) => (
                                                <option key={topic.id || index} value={topic.name || topic}>
                                                    {topic.name || topic}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <small>Current topic: <strong>{selectedTopic || 'None selected'}</strong></small>
                                </div>

                                {/* SUBTOPIC SELECTION */}
                                {availableSubtopics.length > 0 && (
                                    <div className="form-group">
                                        <label>🎯 Select Specific Areas (Optional):</label>
                                        <div className="subtopics-container">
                                            {availableSubtopics.map((subtopic, index) => (
                                                <label key={index} className="subtopic-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubtopics.includes(subtopic)}
                                                        onChange={() => handleSubtopicToggle(subtopic)}
                                                    />
                                                    {subtopic}
                                                </label>
                                            ))}
                                        </div>
                                        <small>Select specific areas to focus your study plan</small>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>
                                        ⏰ Study Duration:
                                        <input
                                            type="text"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            placeholder="e.g., 2 hours or 3 days"
                                            required
                                            className="duration-input"
                                        />
                                    </label>
                                </div>

                                <button type="submit" disabled={isGenerating} className="generate-plan-btn">
                                    {isGenerating ? '🔄 Generating...' : '🚀 Generate AI Study Plan'}
                                </button>
                            </form>

                            {generatedContent && (
                                <div className="generated-content">
                                    <div className="content-header">
                                        <h3>✅ Your Personalized Study Plan:</h3>
                                        <div className="content-actions">
                                            <button onClick={handleCopyToClipboard} className="action-btn copy-btn">
                                                📋 Copy
                                            </button>
                                            <button onClick={handleDownloadTxt} className="action-btn download-btn">
                                                📥 Download TXT
                                            </button>
                                            <button onClick={handleDownloadPDF} className="action-btn pdf-btn">
                                                📄 Save as PDF
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {copySuccess && (
                                        <div className="copy-success-message">
                                            {copySuccess}
                                        </div>
                                    )}
                                    
                                    <div className="study-plan-output">
                                        {generatedContent}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 🛠️ STUDY TOOLS SECTION */}
                {activeSection === 'tools' && (
                    <div className="section-content">
                        {/* AI TUTOR - ALWAYS AVAILABLE FOR HELP */}
                        <div className="dashboard-card">
                            <AITutor />
                        </div>

                        {/* DOCUMENT UPLOAD */}
                        <div className="dashboard-card">
                            <DocumentUpload onSummaryGenerated={(data) => {
                                console.log('Summary generated:', data);
                            }} />
                        </div>

                        {/* STUDY TOOLS */}
                        <div className="ai-study-tools dashboard-card">
                            <StudyTools topics={topics} selectedSubtopics={selectedSubtopics} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;