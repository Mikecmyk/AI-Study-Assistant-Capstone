// ScheduleCalendar.js - WITH TASK INTEGRATION + REMINDERS
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const ScheduleCalendar = () => {
    const [events, setEvents] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        topic: '',
        date: '',
        time: '',
        duration: '1 hour',
        description: '',
        priority: 'medium'
    });

    useEffect(() => {
        const savedEvents = localStorage.getItem('studyEvents');
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('studyEvents', JSON.stringify(events));
        syncEventsToTasks();
    }, [events]);

    const syncEventsToTasks = () => {
        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = events.filter(event => event.date >= today);
        
        const tasks = upcomingEvents.map(event => ({
            id: `event-${event.id}`,
            title: `Study: ${event.topic || event.title}`,
            subject: event.topic || 'General Study',
            difficulty: getPriorityLevel(event.priority),
            dueTime: formatDueTime(event.date, event.time),
            isCompleted: false,
            eventId: event.id,
            type: 'calendar_event'
        }));

        localStorage.setItem('calendarTasks', JSON.stringify(tasks));
        setupReminders(upcomingEvents);
    };

    const getPriorityLevel = (priority) => {
        const priorityMap = {
            'high': 'High',
            'medium': 'Mid', 
            'low': 'Easy'
        };
        return priorityMap[priority] || 'Mid';
    };

    const formatDueTime = (date, time) => {
        const eventDate = new Date(`${date}T${time}`);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (eventDate.toDateString() === today.toDateString()) {
            return `Today, ${time}`;
        } else if (eventDate.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${time}`;
        } else {
            return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const setupReminders = (upcomingEvents) => {
        const existingReminders = JSON.parse(localStorage.getItem('activeReminders') || '[]');
        existingReminders.forEach(reminderId => {
            clearTimeout(reminderId);
        });

        const newReminders = [];
        
        upcomingEvents.forEach(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const reminderTime = new Date(eventDateTime.getTime() - 30 * 60 * 1000);
            
            const now = new Date();
            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            if (timeUntilReminder > 0) {
                const reminderId = setTimeout(() => {
                    showNotification(event);
                }, timeUntilReminder);
                
                newReminders.push(reminderId);
            }
        });
        
        localStorage.setItem('activeReminders', JSON.stringify(newReminders));
    };

    const showNotification = (event) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Zonlus Study Reminder", {
                body: `Time to study: ${event.topic || event.title}\nStarts in 30 minutes!`,
                icon: "/favicon.ico",
                tag: `study-reminder-${event.id}`
            });
        }
        
        alert(`Study Reminder!\n\n"${event.topic || event.title}"\nStarts in 30 minutes!`);
    };

    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted");
                }
            });
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const handleDateClick = (date) => {
        setNewEvent({
            title: '',
            topic: '',
            date: date,
            time: '18:00',
            duration: '1 hour',
            description: '',
            priority: 'medium'
        });
        setShowEventForm(true);
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        
        const event = {
            id: Date.now(),
            ...newEvent,
            createdAt: new Date().toISOString()
        };
        
        setEvents(prev => [...prev, event]);
        setShowEventForm(false);
        setNewEvent({
            title: '',
            topic: '',
            date: '',
            time: '18:00',
            duration: '1 hour',
            description: '',
            priority: 'medium'
        });
        
        alert('Study session added to calendar! It will appear in your urgent tasks.');
    };

    const handleDeleteEvent = (eventId) => {
        if (window.confirm('Are you sure you want to delete this study session?')) {
            setEvents(prev => prev.filter(event => event.id !== eventId));
        }
    };

    const getEventsForDate = (date) => {
        return events.filter(event => event.date === date);
    };

    const generateCalendarDays = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const days = [];
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date: dateStr,
                day: i,
                hasEvents: getEventsForDate(dateStr).length > 0,
                isToday: dateStr === today.toISOString().split('T')[0]
            });
        }
        
        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="schedule-calendar-container">
            <div className="calendar-header">
                <h4>Study Calendar</h4>
                <button 
                    onClick={() => setShowEventForm(true)}
                    className="add-event-button"
                >
                    Add Study Session
                </button>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}
                
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`day-cell ${day?.isToday ? 'current-day' : ''} ${day?.hasEvents ? 'has-event' : ''}`}
                        onClick={() => day && handleDateClick(day.date)}
                    >
                        {day && (
                            <>
                                <div className="day-number">{day.day}</div>
                                {day.hasEvents && <div className="event-dot"></div>}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="upcoming-events-list">
                <h4>Upcoming Study Sessions</h4>
                <div className="events-scroll-container">
                    {events.filter(event => event.date >= new Date().toISOString().split('T')[0])
                          .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                          .slice(0, 5)
                          .map(event => (
                        <div key={event.id} className="schedule-event-item">
                            <div className="event-indicator" style={{
                                backgroundColor: event.priority === 'high' ? '#ef4444' : 
                                               event.priority === 'medium' ? '#f59e0b' : '#10b981'
                            }}></div>
                            <div className="event-details">
                                <div className="event-title">{event.topic || event.title}</div>
                                <div className="event-time">
                                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}
                                </div>
                                <div className="event-description">{event.description}</div>
                            </div>
                            <div className="event-actions">
                                <button 
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="delete-btn"
                                    title="Delete event"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {events.filter(event => event.date >= new Date().toISOString().split('T')[0]).length === 0 && (
                        <div className="no-events">
                            No upcoming study sessions. Add one to get started!
                        </div>
                    )}
                </div>
            </div>

            {showEventForm && (
                <div className="event-form-overlay">
                    <div className="event-form">
                        <h3>Add Study Session</h3>
                        <form onSubmit={handleAddEvent}>
                            <div className="form-group">
                                <label>Session Title *</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent(prev => ({...prev, title: e.target.value}))}
                                    placeholder="e.g., Math Review Session"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Study Topic *</label>
                                <input
                                    type="text"
                                    value={newEvent.topic}
                                    onChange={(e) => setNewEvent(prev => ({...prev, topic: e.target.value}))}
                                    placeholder="e.g., Calculus Derivatives"
                                    required
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent(prev => ({...prev, date: e.target.value}))}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Time *</label>
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent(prev => ({...prev, time: e.target.value}))}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration</label>
                                    <select
                                        value={newEvent.duration}
                                        onChange={(e) => setNewEvent(prev => ({...prev, duration: e.target.value}))}
                                    >
                                        <option value="30 minutes">30 minutes</option>
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
                                        onChange={(e) => setNewEvent(prev => ({...prev, priority: e.target.value}))}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent(prev => ({...prev, description: e.target.value}))}
                                    placeholder="What will you focus on during this study session?"
                                    rows="3"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setShowEventForm(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Add to Calendar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;