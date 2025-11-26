// ScheduleCalendar.js - Updated with better styling
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
        priority: 'medium',
        description: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = () => {
        const userId = 'anonymous'; // Replace with actual user ID
        const storageKey = `studyEvents_${userId}`;
        const savedEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setEvents(savedEvents);
    };

    const saveEvents = (updatedEvents) => {
        const userId = 'anonymous'; // Replace with actual user ID
        const storageKey = `studyEvents_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        const event = {
            id: Date.now(),
            ...newEvent,
            completed: false
        };
        const updatedEvents = [...events, event];
        saveEvents(updatedEvents);
        setNewEvent({
            title: '',
            topic: '',
            date: '',
            time: '',
            duration: '',
            priority: 'medium',
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
                <p>Plan and track your study sessions</p>
            </div>

            <div className="add-session-section">
                <h4>Add Study Session</h4>
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
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    placeholder="Study session title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Topic</label>
                                <input
                                    type="text"
                                    value={newEvent.topic}
                                    onChange={(e) => setNewEvent({...newEvent, topic: e.target.value})}
                                    placeholder="Subject or topic"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Duration</label>
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
                                <label>Priority</label>
                                <select
                                    value={newEvent.priority}
                                    onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                placeholder="Add any notes or specific goals..."
                            />
                        </div>
                        
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button type="submit" className="add-event-button">
                                Save Session
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
                                    <span className={`session-priority priority-${event.priority}`}>
                                        {event.priority}
                                    </span>
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
                                    <span className={`session-priority priority-${event.priority}`}>
                                        {event.priority}
                                    </span>
                                </div>
                                <div className="session-details">
                                    <div className="session-detail">
                                        <span className="detail-label">Date</span>
                                        <span className="detail-value">{formatDate(event.date)}</span>
                                    </div>
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