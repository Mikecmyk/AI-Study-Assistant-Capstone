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
import AIRecommendations from './AIRecommendations';
import Achievements from './Achievements';
import { recordStudyProgress } from './ProductivityChart';
import './Dashboard.css'; 
import { Link, useNavigate } from 'react-router-dom';

const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return 'anonymous';
    
    try {
      const user = JSON.parse(userData);
      return user.id || user.user_id || 'anonymous';
    } catch (e) {
      return userData;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
};

const safeJSONParse = (data, defaultValue = []) => {
  try {
    if (!data || data === 'null' || data === 'undefined') {
      return defaultValue;
    }
    const parsed = JSON.parse(data);
    return parsed || defaultValue;
  } catch (error) {
    console.warn('JSON parse error, returning default:', error);
    return defaultValue;
  }
};

const saveToStudyHistory = (topic, duration, content, type = 'study_plan') => {
    const userId = getCurrentUserId();
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
    
    const storageKey = `studyHistory_${userId}`;
    const existingHistory = safeJSONParse(localStorage.getItem(storageKey), []);
    const updatedHistory = [studySession, ...existingHistory].slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
};

const generateTasksFromStudyHistory = () => {
    const userId = getCurrentUserId();
    const storageKey = `studyHistory_${userId}`;
    const studyHistory = safeJSONParse(localStorage.getItem(storageKey), []);
    
    if (studyHistory.length === 0) {
        return [];
    }
    
    const recentSessions = studyHistory.slice(0, 10);
    
    const generatedTasks = recentSessions.map(session => {
        const baseTopic = session.topic.split(':')[0];
        const daysAgo = Math.floor((new Date() - new Date(session.timestamp)) / (1000 * 60 * 60 * 24));
        
        return {
            id: `review-${session.id}`,
            title: `Review: ${session.topic}`,
            subject: baseTopic,
            difficulty: daysAgo > 7 ? 'High' : daysAgo > 3 ? 'Mid' : 'Easy',
            dueTime: getReviewDueDate(daysAgo),
            isCompleted: false,
            type: 'review_task',
            originalSessionId: session.id,
            priority: calculateReviewPriority(session, daysAgo)
        };
    });
    
    return generatedTasks;
};

const getReviewDueDate = (daysAgo) => {
    if (daysAgo > 7) return 'ASAP';
    if (daysAgo > 3) return 'Next 2 days';
    return 'This week';
};

const calculateReviewPriority = (session, daysAgo) => {
    const duration = parseInt(session.duration) || 0;
    const contentLength = session.content?.length || 0;
    
    let priority = daysAgo * 2;
    priority += duration > 60 ? 3 : 1;
    priority += contentLength > 500 ? 2 : 0;
    
    return Math.min(priority, 10);
};

const generateFollowUpTasks = (topic, duration, content) => {
    return [
        {
            id: `practice-${Date.now()}`,
            title: `Practice Exercises: ${topic}`,
            subject: topic.split(':')[0],
            difficulty: 'Mid',
            dueTime: 'Tomorrow',
            isCompleted: false,
            type: 'practice_task',
            description: `Apply concepts from your ${duration} study session`
        },
        {
            id: `quiz-${Date.now() + 1}`,
            title: `Self Assessment: ${topic}`,
            subject: topic.split(':')[0],
            difficulty: 'Mid',
            dueTime: 'In 2 days',
            isCompleted: false,
            type: 'quiz_task',
            description: 'Test your understanding of key concepts'
        }
    ];
};

function Dashboard({ logout }) {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [tasks, setTasks] = useState([]);
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
    const [activeTaskFilter, setActiveTaskFilter] = useState('all');
    const [hasStudyHistory, setHasStudyHistory] = useState(false);
    const [showStudyToolsRedirect, setShowStudyToolsRedirect] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleTopicAdded = (newTopic) => {
        console.log('New topic added:', newTopic);
        setRefreshTopics(prev => !prev);
        
        const topicName = newTopic.name || newTopic;
        setSelectedTopic(topicName);
        setActiveSection('study');
        
        setTimeout(() => {
            const studySection = document.querySelector('.study-form');
            if (studySection) {
                studySection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    };

    const checkStudyHistory = useCallback(() => {
        const userId = getCurrentUserId();
        const storageKey = `studyHistory_${userId}`;
        const studyHistory = safeJSONParse(localStorage.getItem(storageKey), []);
        return studyHistory.length > 0;
    }, []);

    const loadAllTasks = useCallback(() => {
        const userId = getCurrentUserId();
        
        const calendarStorageKey = `calendarTasks_${userId}`;
        const calendarTasks = safeJSONParse(localStorage.getItem(calendarStorageKey), []);
        
        const eventsStorageKey = `studyEvents_${userId}`;
        const studyEvents = safeJSONParse(localStorage.getItem(eventsStorageKey), []);
        
        const eventTasks = studyEvents.map(event => ({
            id: `event-${event.id}`,
            title: event.title || `Study: ${event.topic}`,
            subject: event.topic || 'General',
            difficulty: event.priority === 'high' ? 'High' : event.priority === 'medium' ? 'Mid' : 'Easy',
            dueTime: new Date(event.date).toLocaleDateString(),
            isCompleted: event.completed || false,
            type: 'calendar_task',
            eventId: event.id,
            description: event.description,
            date: event.date,
            time: event.time,
            duration: event.duration
        }));
        
        let studyBasedTasks = [];
        const userHasHistory = checkStudyHistory();
        if (userHasHistory) {
            studyBasedTasks = generateTasksFromStudyHistory();
        }
        
        const allTasks = [...calendarTasks, ...eventTasks, ...studyBasedTasks]
            .filter((task, index, self) => 
                index === self.findIndex(t => t.id === task.id)
            )
            .sort((a, b) => {
                if (a.isCompleted !== b.isCompleted) {
                    return a.isCompleted ? 1 : -1;
                }
                return (b.priority || 0) - (a.priority || 0);
            });
        
        setTasks(allTasks);
    }, [checkStudyHistory]);

    useEffect(() => {
        const userHasHistory = checkStudyHistory();
        setHasStudyHistory(userHasHistory);
        loadAllTasks();
        
        const interval = setInterval(loadAllTasks, 30000);
        
        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);
        }
        
        return () => {
            clearInterval(interval);
            setTasks([]);
        };
    }, [loadAllTasks, checkStudyHistory]);

    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
                if (permission === "granted") {
                    console.log("Notification permission granted");
                    alert("Notifications enabled! You will get reminders 30 minutes before study sessions.");
                }
            });
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedContent);
            setCopySuccess('Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };

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
        setCopySuccess('Downloaded as text file!');
        setTimeout(() => setCopySuccess(''), 3000);
    };

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
        
        setCopySuccess('Opening print dialog for PDF...');
        setTimeout(() => setCopySuccess(''), 3000);
    };

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
                console.warn('API fetch failed, using localStorage only:', apiError);
            }
            
            const userId = getCurrentUserId();
            const storageKey = `temporaryTopics_${userId}`;
            const tempTopics = safeJSONParse(localStorage.getItem(storageKey), []);
            const allTopics = [...apiTopics, ...tempTopics];
            
            console.log('Loaded topics:', {
                fromApi: apiTopics.length,
                fromLocal: tempTopics.length,
                total: allTopics.length
            });
            
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
        console.log('Fetching topics...');
        fetchTopics();
    }, [fetchTopics, refreshTopics]);

    const getAvailableSubtopics = () => {
        if (!selectedTopic) return [];
        
        const topicObj = topics.find(t => (t.name || t) === selectedTopic);
        if (topicObj && topicObj.subtopics) {
            return topicObj.subtopics;
        }
        
        if (selectedTopic.includes(': ')) {
            const [mainSubject] = selectedTopic.split(': ');
            return [mainSubject];
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
            const specificArea = topicParts[1] || topicParts[0];
            const finalSubtopics = selectedSubtopics.length > 0 ? selectedSubtopics : [specificArea];

            console.log('Generating study plan for:', { 
                topic: selectedTopic, 
                specificArea, 
                subtopics: finalSubtopics, 
                duration 
            });

            const response = await api.post('/sessions/', {
                topic_name: selectedTopic,
                duration_input: duration,
                main_subject: topicParts[0],
                specific_area: specificArea,
                subtopics: finalSubtopics,
                prompt_type: 'focused_study_plan'
            });

            const generatedContentText = response.data.generated_content;
            setGeneratedContent(generatedContentText);
            
            recordStudyProgress(specificArea, 'study_plan');
            saveToStudyHistory(selectedTopic, duration, generatedContentText, 'study_plan');
            
            setHasStudyHistory(true);
            
            const followUpTasks = generateFollowUpTasks(selectedTopic, duration, generatedContentText);
            setTasks(prevTasks => {
                const newTasks = [...followUpTasks, ...prevTasks];
                return newTasks.filter((task, index, self) => 
                    index === self.findIndex(t => t.id === task.id)
                );
            });
            
            setShowStudyToolsRedirect(true);
            
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('studySessionCompleted'));
            }, 1000);
            
            setTimeout(() => {
                document.querySelector('.generated-content')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);

            setTimeout(() => {
                setActiveSection('tools');
                setShowStudyToolsRedirect(false);
                
                setTimeout(() => {
                    const studyToolsSection = document.querySelector('.ai-study-tools');
                    if (studyToolsSection) {
                        studyToolsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            }, 5000);
            
        } catch (err) {
            console.error("Error generating session:", err.response ? err.response.data : err);
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
        
        const task = tasks.find(t => t.id === id);
        if (task) {
            const userId = getCurrentUserId();
            
            if (task.eventId) {
                const eventsStorageKey = `studyEvents_${userId}`;
                const events = safeJSONParse(localStorage.getItem(eventsStorageKey), []);
                const updatedEvents = events.map(event => 
                    event.id === task.eventId 
                        ? { ...event, completed: !task.isCompleted }
                        : event
                );
                localStorage.setItem(eventsStorageKey, JSON.stringify(updatedEvents));
            }
            
            if (task.type === 'calendar_task') {
                const calendarStorageKey = `calendarTasks_${userId}`;
                const calendarTasks = safeJSONParse(localStorage.getItem(calendarStorageKey), []);
                const updatedCalendarTasks = calendarTasks.map(calTask => 
                    calTask.id === task.id 
                        ? { ...calTask, isCompleted: !task.isCompleted }
                        : calTask
                );
                localStorage.setItem(calendarStorageKey, JSON.stringify(updatedCalendarTasks));
            }

            if (task.isCompleted === false) {
                recordStudyProgress(task.subject || task.title, 'task_completed');
            }
        }
    };

    const handleViewDetails = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task && task.eventId) {
            const userId = getCurrentUserId();
            const storageKey = `studyEvents_${userId}`;
            const events = safeJSONParse(localStorage.getItem(storageKey), []);
            const event = events.find(e => e.id === task.eventId);
            
            if (event) {
                alert(`Study Session Details:\n\nTopic: ${event.topic || event.title}\nDate: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\nTime: ${event.time}\nDuration: ${event.duration}\nPriority: ${event.priority}\nDescription: ${event.description || 'No description'}`);
            } else {
                alert(`Study Session: ${task.title}\nSubject: ${task.subject}\nDue: ${task.dueTime}`);
            }
        } else {
            alert(`Task Details:\n\nTitle: ${task.title}\nSubject: ${task.subject}\nDifficulty: ${task.difficulty}\nDue: ${task.dueTime}\nType: ${task.type || 'Regular Task'}\n${task.description ? `Description: ${task.description}` : ''}`);
        }
    };

    const clearOldTopics = () => {
        const userId = getCurrentUserId();
        const storageKey = `temporaryTopics_${userId}`;
        localStorage.removeItem(storageKey);
        setRefreshTopics(prev => !prev);
        alert('Old topics cleared! Refreshing topics list...');
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTaskFilter === 'all') return true;
        if (activeTaskFilter === 'review') return task.type === 'review_task';
        if (activeTaskFilter === 'practice') return task.type === 'practice_task';
        if (activeTaskFilter === 'quiz') return task.type === 'quiz_task';
        if (activeTaskFilter === 'calendar') return task.type === 'calendar_task' || task.eventId;
        return !task.type && !task.eventId;
    });

    const hasAnyTasks = tasks.length > 0;
    const userHasCalendarTasks = tasks.some(task => task.type === 'calendar_task' || task.eventId);
    const userHasReviewTasks = tasks.some(task => task.type === 'review_task');
    const incompleteTasksCount = filteredTasks.filter(t => !t.isCompleted).length;

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
                    <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                    <Link to="/courses" className="nav-link">My Courses</Link>
                </div>

                <button 
                    onClick={handleLogout}
                    className="logout-button action-button" 
                    style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                    Log Out
                </button>
            </aside>

            <div className="main-content">
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-button ${activeSection === 'productivity' ? 'active' : ''}`}
                        onClick={() => setActiveSection('productivity')}
                    >
                        Productivity Overview
                    </button>
                    <button 
                        className={`tab-button ${activeSection === 'study' ? 'active' : ''}`}
                        onClick={() => setActiveSection('study')}
                    >
                        Study Session
                    </button>
                    <button 
                        className={`tab-button ${activeSection === 'tools' ? 'active' : ''}`}
                        onClick={() => setActiveSection('tools')}
                    >
                        Study Tools
                    </button>
                </div>

                {notificationPermission !== 'granted' && (
                    <div className="notification-permission-banner">
                        Enable notifications to get reminders 30 minutes before study sessions
                        <button onClick={requestNotificationPermission}>
                            Enable Notifications
                        </button>
                    </div>
                )}

                {activeSection === 'productivity' && (
                    <div className="section-content productivity-content">
                        <div className="main-content-area">
                            {hasStudyHistory ? (
                                <div className="dashboard-card">
                                    <AIRecommendations />
                                </div>
                            ) : (
                                <div className="dashboard-card">
                                    <div className="ai-recommendations-placeholder">
                                        <h3>AI Study Recommendations</h3>
                                        <p>You will be given personalized suggestions after learning some topics</p>
                                        <button 
                                            onClick={() => setActiveSection('study')}
                                            className="start-studying-btn"
                                        >
                                            Start Learning Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="productivity-chart dashboard-card">
                                <ProductivityChart /> 
                            </div>
                            
                            <div className="urgent-tasks dashboard-card">
                                <div className="tasks-header">
                                    <h3>Learning Tasks ({incompleteTasksCount})</h3>
                                    <small>Calendar sessions + Smart reviews</small>
                                </div>
                                
                                {hasAnyTasks ? (
                                    <div className="task-categories">
                                        <button 
                                            className={`category-filter ${activeTaskFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => setActiveTaskFilter('all')}
                                        >
                                            All Tasks
                                        </button>
                                        {userHasReviewTasks && (
                                            <>
                                                <button 
                                                    className={`category-filter ${activeTaskFilter === 'review' ? 'active' : ''}`}
                                                    onClick={() => setActiveTaskFilter('review')}
                                                >
                                                    Review Tasks
                                                </button>
                                                <button 
                                                    className={`category-filter ${activeTaskFilter === 'practice' ? 'active' : ''}`}
                                                    onClick={() => setActiveTaskFilter('practice')}
                                                >
                                                    Practice Tasks
                                                </button>
                                                <button 
                                                    className={`category-filter ${activeTaskFilter === 'quiz' ? 'active' : ''}`}
                                                    onClick={() => setActiveTaskFilter('quiz')}
                                                >
                                                    Self Assessments
                                                </button>
                                            </>
                                        )}
                                        {userHasCalendarTasks && (
                                            <button 
                                                className={`category-filter ${activeTaskFilter === 'calendar' ? 'active' : ''}`}
                                                onClick={() => setActiveTaskFilter('calendar')}
                                            >
                                                Calendar Sessions
                                            </button>
                                        )}
                                    </div>
                                ) : null}
                                
                                <div className="task-cards-container">
                                    {hasAnyTasks ? (
                                        filteredTasks.length > 0 ? (
                                            filteredTasks.map(task => (
                                                <StudyTaskCard
                                                    key={task.id}
                                                    {...task}
                                                    onToggleComplete={handleToggleComplete}
                                                    onViewDetails={handleViewDetails}
                                                    taskType={task.type || 'regular'}
                                                />
                                            ))
                                        ) : (
                                            <div className="no-tasks">
                                                <p>No tasks match the current filter.</p>
                                                <button 
                                                    onClick={() => setActiveTaskFilter('all')}
                                                    className="add-tasks-btn"
                                                >
                                                    Show All Tasks
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="no-tasks">
                                            <p>No tasks yet! Schedule study sessions in calendar or start studying to generate tasks.</p>
                                            <div className="no-tasks-actions">
                                                <button 
                                                    onClick={() => setActiveSection('study')}
                                                    className="add-tasks-btn"
                                                >
                                                    Start Studying
                                                </button>
                                                <button 
                                                    onClick={() => document.querySelector('.add-event-button')?.click()}
                                                    className="add-tasks-btn secondary"
                                                >
                                                    Schedule Session
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* STUDY HISTORY AND SCHEDULE TOGETHER IN MAIN CONTENT */}
                            <div className="history-schedule-container">
                                {hasStudyHistory && (
                                    <div className="study-history dashboard-card">
                                        <StudyHistory />
                                    </div>
                                )}
                                
                                <div className="study-schedule dashboard-card">
                                    <ScheduleCalendar />
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-content">
                            <Achievements 
                                studyHistory={safeJSONParse(localStorage.getItem(`studyHistory_${getCurrentUserId()}`), [])}
                                tasks={tasks}
                            />
                        </div>
                    </div>
                )}

                {activeSection === 'study' && (
                    <div className="section-content">
                        <div className="dashboard-card">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                <h3>Step 1: Add Learning Topic</h3>
                                <button onClick={clearOldTopics} className="clear-topics-btn">
                                    Clear Old Topics
                                </button>
                            </div>
                            <TopicManager onTopicAdded={handleTopicAdded} />
                        </div>

                        <div className="dashboard-card">
                            <div className="session-header">
                                <h2>Step 2: Start Your Study Session</h2>
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
                                        Selected Topic:
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
                                        Study Duration:
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
                                        <h3>Your Personalized Study Plan:</h3>
                                        <div className="content-actions">
                                            <button onClick={handleCopyToClipboard} className="action-btn copy-btn">
                                                Copy
                                            </button>
                                            <button onClick={handleDownloadTxt} className="action-btn download-btn">
                                                Download TXT
                                            </button>
                                            <button onClick={handleDownloadPDF} className="action-btn pdf-btn">
                                                Save as PDF
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {copySuccess && (
                                        <div className="copy-success-message">
                                            {copySuccess}
                                        </div>
                                    )}

                                    {showStudyToolsRedirect && (
                                        <div className="redirect-message success-message">
                                            <strong>Great! Study plan generated successfully!</strong>
                                            <p>Redirecting to Study Tools in 5 seconds to generate notes, quizzes, and flashcards...</p>
                                            <button 
                                                onClick={() => {
                                                    setActiveSection('tools');
                                                    setShowStudyToolsRedirect(false);
                                                    setTimeout(() => {
                                                        const studyToolsSection = document.querySelector('.ai-study-tools');
                                                        if (studyToolsSection) {
                                                            studyToolsSection.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }, 300);
                                                }}
                                                className="redirect-now-btn"
                                            >
                                                Go to Study Tools Now
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="study-plan-output styled-content">
                                        {generatedContent.split('\n').map((line, index) => {
                                            const trimmedLine = line.trim();
                                            
                                            if (index === 0 || trimmedLine.toUpperCase() === trimmedLine) {
                                                return (
                                                    <h4 key={index} className="content-header-line main-header">
                                                        {trimmedLine}
                                                    </h4>
                                                );
                                            }
                                            else if (trimmedLine.match(/^(\d+\.|#+|\*\*|—|-|\*)\s/) || 
                                                     trimmedLine.match(/^[A-Z][^a-z]{10,}/) ||
                                                     trimmedLine.endsWith(':')) {
                                                return (
                                                    <h4 key={index} className="content-header-line section-header">
                                                        {trimmedLine.replace(/^(\d+\.|#+|\*\*|—|-|\*)\s*/, '')}
                                                    </h4>
                                                );
                                            }
                                            else if (trimmedLine.match(/^[-•*]\s/)) {
                                                return (
                                                    <div key={index} className="content-list-item">
                                                        <span className="bullet">•</span>
                                                        <span>{trimmedLine.replace(/^[-•*]\s/, '')}</span>
                                                    </div>
                                                );
                                            }
                                            else if (trimmedLine.match(/^\d+\.\s/)) {
                                                return (
                                                    <div key={index} className="content-numbered-item">
                                                        <span className="number">{trimmedLine.match(/^\d+/)[0]}.</span>
                                                        <span>{trimmedLine.replace(/^\d+\.\s/, '')}</span>
                                                    </div>
                                                );
                                            }
                                            else if (trimmedLine) {
                                                return (
                                                    <p key={index} className="content-paragraph">
                                                        {trimmedLine}
                                                    </p>
                                                );
                                            }
                                            else {
                                                return <div key={index} className="content-empty-line"></div>;
                                            }
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'tools' && (
                    <div className="section-content">
                        {showStudyToolsRedirect && (
                            <div className="dashboard-card">
                                <div className="welcome-to-tools success-message">
                                    <h3>Welcome to Study Tools</h3>
                                    <p>Now you can generate detailed notes, quizzes, and flashcards for your topic: <strong>{selectedTopic}</strong></p>
                                    <p>Use the tools below to enhance your learning experience</p>
                                </div>
                            </div>
                        )}

                        <div className="dashboard-card">
                            <AITutor />
                        </div>

                        <div className="dashboard-card">
                            <DocumentUpload onSummaryGenerated={(data) => {
                                console.log('Summary generated:', data);
                            }} />
                        </div>

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