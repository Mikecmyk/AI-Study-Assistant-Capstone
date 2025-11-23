// Dashboard.js - WITH STUDY HISTORY TRACKING + DOCUMENT UPLOAD
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; 
import StudyTools from './StudyTools';
import StudyTaskCard from './StudyTaskCard'; 
import ProductivityChart from './ProductivityChart'; 
import ScheduleCalendar from './ScheduleCalendar'; 
import TopicManager from './TopicManager';
import StudyHistory from './StudyHistory';
import DocumentUpload from './DocumentUpload'; // ADD THIS IMPORT
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
        content: content.substring(0, 200) + '...', // Store preview
        type: type,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    // Get existing history
    const existingHistory = localStorage.getItem('studyHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Add new session to beginning of array
    const updatedHistory = [studySession, ...history].slice(0, 50); // Keep last 50 sessions
    
    // Save back to localStorage
    localStorage.setItem('studyHistory', JSON.stringify(updatedHistory));
    
    console.log('📚 Saved to study history:', studySession);
};

function Dashboard({ logout }) {
    const [topics, setTopics] = useState([]);
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null); 
    const [studyPlanError, setStudyPlanError] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedSubtopics, setSelectedSubtopics] = useState([]);
    const [duration, setDuration] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [refreshTopics, setRefreshTopics] = useState(false);
    const [copySuccess, setCopySuccess] = useState(''); // For copy feedback

    const handleTopicAdded = (newTopic) => {
        console.log('🎯 New topic added:', newTopic);
        setRefreshTopics(prev => !prev);
    };

    // COPY TO CLIPBOARD FUNCTION
    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedContent);
            setCopySuccess('✅ Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
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
        
        // Create filename from topic and date
        const topicName = selectedTopic.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        element.download = `Zonlus_Study_Notes_${topicName}_${date}.txt`;
        
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        setCopySuccess('📥 Downloaded as text file!');
        setTimeout(() => setCopySuccess(''), 3000);
    };

    // DOWNLOAD AS PDF FUNCTION (Simple version)
    const handleDownloadPDF = () => {
        // For a more advanced PDF, you might want to use a library like jsPDF
        // This creates a simple printable version
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
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            // printWindow.close(); // Uncomment if you want to auto-close after print
        }, 500);
        
        setCopySuccess('🖨️ Opening print dialog for PDF...');
        setTimeout(() => setCopySuccess(''), 3000);
    };

    // FIXED: Improved topic fetching with better localStorage handling
    const fetchTopics = useCallback(async () => {
        try {
            let apiTopics = [];
            
            // Try to fetch from API first
            try {
                const response = await api.get('/topics/'); 
                
                if (response.data && Array.isArray(response.data)) {
                    apiTopics = response.data;
                    console.log('📚 API returned direct array:', apiTopics);
                } else if (response.data && response.data.topics && Array.isArray(response.data.topics)) {
                    apiTopics = response.data.topics;
                    console.log('📚 API returned object with topics:', apiTopics);
                } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
                    apiTopics = response.data.results;
                    console.log('📚 API returned object with results:', apiTopics);
                }
            } catch (apiError) {
                console.warn('⚠️ API fetch failed, using localStorage only:', apiError);
            }
            
            // Get topics from localStorage
            const storedTempTopics = localStorage.getItem('temporaryTopics');
            const tempTopics = storedTempTopics ? JSON.parse(storedTempTopics) : [];
            
            console.log('💾 Stored topics from localStorage:', tempTopics);
            
            // Combine API topics and localStorage topics
            const allTopics = [...apiTopics, ...tempTopics];
            
            console.log('📚 All combined topics:', allTopics);
            
            setTopics(allTopics);

            // Auto-select first topic if none selected
            if (allTopics.length > 0 && !selectedTopic) {
                const firstTopic = allTopics[0].name || allTopics[0];
                setSelectedTopic(firstTopic);
                console.log('🎯 Auto-selected topic:', firstTopic);
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
        
        // Find the topic object
        const topicObj = topics.find(t => (t.name || t) === selectedTopic);
        
        if (topicObj && topicObj.subtopics) {
            return topicObj.subtopics;
        }
        
        // For hierarchical topics like "Physics: Quantum Mechanics"
        if (selectedTopic.includes(': ')) {
            const [mainSubject, specificArea] = selectedTopic.split(': ');
            console.log(`🎯 Selected: ${mainSubject} - ${specificArea}`);
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
        setCopySuccess(''); // Clear any previous copy messages
        setIsGenerating(true);

        try {
            // Parse the topic to get main subject and specific area
            const topicParts = selectedTopic.split(': ');
            const mainSubject = topicParts[0];
            const specificArea = topicParts[1] || topicParts[0];

            // Use selected subtopics or fallback to the specific area
            const finalSubtopics = selectedSubtopics.length > 0 ? selectedSubtopics : [specificArea];

            console.log('🚀 Generating study plan for:', {
                topic: selectedTopic,
                mainSubject,
                specificArea,
                subtopics: finalSubtopics,
                duration
            });

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
            
            // TRACK PROGRESS
            recordStudyProgress(specificArea, 'study_plan');
            
            // ✅ SAVE TO STUDY HISTORY
            saveToStudyHistory(selectedTopic, duration, generatedContentText, 'study_plan');
            
            alert(`✅ Study session created successfully for ${specificArea}!`);
        } catch (err) {
            console.error(
                "❌ Error generating session:",
                err.response ? err.response.data : err
            );
            setStudyPlanError(
                err.response?.data?.error || 
                "Failed to generate study plan. Please try a more specific topic."
            );
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

    // Clear old topics function
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

                <div className="dashboard-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                        <h3>Add Learning Topics</h3>
                        <button onClick={clearOldTopics} className="clear-topics-btn">
                            🗑️ Clear Old Topics
                        </button>
                    </div>
                    <TopicManager onTopicAdded={handleTopicAdded} />
                </div>

                {/* ADD DOCUMENT UPLOAD COMPONENT HERE */}
                <div className="dashboard-card">
                    <DocumentUpload onSummaryGenerated={(data) => {
                        console.log('Summary generated:', data);
                        // You can handle the summary data here if needed
                    }} />
                </div>

                <div className="dashboard-card">
                    <h2>Start a New Study Session</h2>
                    <p className="session-instruction">Select a specific topic for better study plans</p>
                    
                    {/* Debug info - you can remove this later */}
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                        Available topics: {topics.length} | Selected: {selectedTopic || 'None'}
                    </div>
                    
                    <form onSubmit={handleGenerateSession} className="study-form">
                        {studyPlanError && <p className="error-message">Error: {studyPlanError}</p>} 

                        <div className="form-group">
                            <label>
                                Topic:
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => {
                                        setSelectedTopic(e.target.value);
                                        setSelectedSubtopics([]); // Reset subtopics when topic changes
                                        console.log('🎯 Topic selected:', e.target.value);
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
                        </div>

                        {/* SUBTOPIC SELECTION */}
                        {availableSubtopics.length > 0 && (
                            <div className="form-group">
                                <label>Select Specific Areas (Optional):</label>
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
                                Duration (e.g., 3 days, 2 hours):
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
                            {isGenerating ? 'Generating...' : 'Generate AI Study Plan'}
                        </button>
                    </form>

                    {generatedContent && (
                        <div className="generated-content">
                            <div className="content-header">
                                <h3>Generated Study Plan:</h3>
                                <div className="content-actions">
                                    {/* COPY BUTTON */}
                                    <button 
                                        onClick={handleCopyToClipboard}
                                        className="action-btn copy-btn"
                                        title="Copy to clipboard"
                                    >
                                        📋 Copy
                                    </button>
                                    
                                    {/* DOWNLOAD TXT BUTTON */}
                                    <button 
                                        onClick={handleDownloadTxt}
                                        className="action-btn download-btn"
                                        title="Download as text file"
                                    >
                                        📥 Download TXT
                                    </button>
                                    
                                    {/* DOWNLOAD PDF BUTTON */}
                                    <button 
                                        onClick={handleDownloadPDF}
                                        className="action-btn pdf-btn"
                                        title="Save as PDF"
                                    >
                                        📄 Save as PDF
                                    </button>
                                </div>
                            </div>
                            
                            {/* COPY SUCCESS MESSAGE */}
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

                <div className="ai-study-tools dashboard-card">
                    <StudyTools topics={topics} selectedSubtopics={selectedSubtopics} />
                </div>

                <div className="productivity-chart dashboard-card">
                    <ProductivityChart /> 
                </div>
                
                <div className="study-history dashboard-card">
                    <StudyHistory />
                </div>

            </div>
            
            <aside className="right-schedule">
                <ScheduleCalendar />
            </aside>
        </div>
    );
}

export default Dashboard;