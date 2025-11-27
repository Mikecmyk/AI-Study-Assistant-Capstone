// ScheduleCalendar.js - UPDATED (No Priority, Creates Tasks)

import React, { useState, useEffect } from 'react';

const ScheduleCalendar = () => {
    const [events, setEvents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        topic: '',
        date: '',
        time: '',
        duration: '',
        description: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = () => {
        const userId = getCurrentUserId();
        const storageKey = `studyEvents_${userId}`;
        const savedEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setEvents(savedEvents);
    };

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

    const saveEvents = (updatedEvents) => {
        const userId = getCurrentUserId();
        const storageKey = `studyEvents_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
    };

    const createTaskFromSession = (event) => {
        const userId = getCurrentUserId();
        const task = {
            id: `session-${event.id}`,
            title: `Study: ${event.topic}`,
            subject: event.topic,
            difficulty: 'Medium',
            dueTime: formatDueDate(event.date),
            isCompleted: false,
            type: 'self_assessment',
            description: event.description || `Scheduled study session for ${event.topic}`,
            sessionDate: event.date,
            sessionTime: event.time,
            sessionDuration: event.duration
        };

        // Save to calendar tasks
        const calendarStorageKey = `calendarTasks_${userId}`;
        const existingTasks = JSON.parse(localStorage.getItem(calendarStorageKey) || '[]');
        const updatedTasks = [...existingTasks, task];
        localStorage.setItem(calendarStorageKey, JSON.stringify(updatedTasks));

        // Trigger task refresh in parent component
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
    };

    const formatDueDate = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        if (dateStr === today) return 'Today';
        if (dateStr === tomorrowStr) return 'Tomorrow';
        
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        const event = {
            id: Date.now(),
            ...newEvent,
            completed: false
        };
        
        // Save to events
        const updatedEvents = [...events, event];
        saveEvents(updatedEvents);
        
        // Create corresponding task in Learning Tasks
        createTaskFromSession(event);
        
        // Reset form
        setNewEvent({
            title: '',
            topic: '',
            date: '',
            time: '',
            duration: '',
            description: ''
        });
        setShowAddForm(false);
    };

    const getTodaySessions = () => {
        const today = new Date().toISOString().split('T')[0];
        return events.filter(event => event.date === today);
    };

    const getUpcomingSessions = () => {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        return events.filter(event => 
            event.date > today && event.date <= nextWeekStr
        );
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="schedule-calendar">
            <div className="schedule-header">
                <h3>Study Schedule</h3>
                <p>Plan your study sessions</p>
            </div>

            <div className="add-session-section">
                <h4>Schedule Study Session</h4>
                {!showAddForm ? (
                    <button 
                        className="add-event-button"
                        onClick={() => setShowAddForm(true)}
                    >
                        Add Session
                    </button>
                ) : (
                    <form onSubmit={handleAddEvent} className="add-event-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Session Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    placeholder="Study session title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Study Topic</label>
                                <input
                                    type="text"
                                    value={newEvent.topic}
                                    onChange={(e) => setNewEvent({...newEvent, topic: e.target.value})}
                                    placeholder="Subject or topic to study"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Study Date</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Study Time</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Study Duration</label>
                            <select
                                value={newEvent.duration}
                                onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                                required
                            >
                                <option value="">Select duration</option>
                                <option value="30 mins">30 minutes</option>
                                <option value="1 hour">1 hour</option>
                                <option value="1.5 hours">1.5 hours</option>
                                <option value="2 hours">2 hours</option>
                                <option value="3 hours">3 hours</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Study Goals (Optional)</label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                placeholder="What do you want to achieve in this session?"
                                rows="3"
                            />
                        </div>
                        
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button type="submit" className="add-event-button">
                                Schedule Session
                            </button>
                            <button 
                                type="button" 
                                className="add-event-button"
                                style={{background: '#7f8c8d'}}
                                onClick={() => setShowAddForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="todays-sessions">
                <h4 className="section-title">Today's Sessions</h4>
                <div className="session-list">
                    {getTodaySessions().length > 0 ? (
                        getTodaySessions().map(event => (
                            <div key={event.id} className="session-item">
                                <div className="session-header">
                                    <h5 className="session-topic">{event.topic}</h5>
                                    <span className="session-time">{event.time}</span>
                                </div>
                                <div className="session-details">
                                    <div className="session-detail">
                                        <span className="detail-label">Duration</span>
                                        <span className="detail-value">{event.duration}</span>
                                    </div>
                                </div>
                                {event.description && (
                                    <p className="session-description">{event.description}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-sessions">
                            <p>No study sessions scheduled for today.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="upcoming-sessions">
                <h4 className="section-title">Upcoming This Week</h4>
                <div className="session-list">
                    {getUpcomingSessions().length > 0 ? (
                        getUpcomingSessions().map(event => (
                            <div key={event.id} className="session-item">
                                <div className="session-header">
                                    <h5 className="session-topic">{event.topic}</h5>
                                    <span className="session-date">{formatDate(event.date)}</span>
                                </div>
                                <div className="session-details">
                                    <div className="session-detail">
                                        <span className="detail-label">Time</span>
                                        <span className="detail-value">{event.time}</span>
                                    </div>
                                    <div className="session-detail">
                                        <span className="detail-label">Duration</span>
                                        <span className="detail-value">{event.duration}</span>
                                    </div>
                                </div>
                                {event.description && (
                                    <p className="session-description">{event.description}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-sessions">
                            <p>No upcoming study sessions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleCalendar;