// src/components/ScheduleCalendar.js (FIXED VERSION - NO WARNINGS)
import React, { useState, useEffect } from 'react';

// Helper function to render a single event item
const EventItem = ({ event, onEdit, onDelete }) => (
    <div className="schedule-event-item">
        <div className="event-indicator" style={{ backgroundColor: event.color }}></div>
        <div className="event-details">
            <p className="event-title">{event.title}</p>
            <p className="event-time">{event.time}</p>
            <p className="event-description">{event.description}</p>
        </div>
        <span className="event-subject-tag" style={{ backgroundColor: event.color, color: '#fff' }}>
            {event.subject}
        </span>
        <div className="event-actions">
            <button onClick={() => onEdit(event)} className="edit-btn">✏️</button>
            <button onClick={() => onDelete(event.id)} className="delete-btn">🗑️</button>
        </div>
    </div>
);

// Event Form Component
const EventForm = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        date: '',
        time: '',
        type: 'session',
        color: '#6c63ff'
    });

    useEffect(() => {
        if (event) {
            setFormData(event);
        } else {
            // Set default date to today
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const formattedTime = today.toTimeString().slice(0, 5);
            
            setFormData(prev => ({
                ...prev,
                date: formattedDate,
                time: formattedTime
            }));
        }
    }, [event]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const eventData = {
            ...formData,
            id: event?.id || Date.now(),
            timestamp: new Date(`${formData.date}T${formData.time}`).toISOString()
        };
        onSave(eventData);
    };

    return (
        <div className="event-form-overlay">
            <div className="event-form">
                <h3>{event ? 'Edit Event' : 'Add New Event'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Subject:</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Time:</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type:</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="session">Study Session</option>
                                <option value="deadline">Deadline</option>
                                <option value="exam">Exam</option>
                                <option value="meeting">Meeting</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Color:</label>
                            <select
                                value={formData.color}
                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                            >
                                <option value="#6c63ff">Purple</option>
                                <option value="#ffc107">Yellow</option>
                                <option value="#dc3545">Red</option>
                                <option value="#28a745">Green</option>
                                <option value="#17a2b8">Blue</option>
                                <option value="#fd7e14">Orange</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            {event ? 'Update' : 'Create'} Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ScheduleCalendar = () => {
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Load events from localStorage on component mount
    useEffect(() => {
        const savedEvents = localStorage.getItem('studyCalendarEvents');
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        } else {
            // Initialize with mock data
            const mockEvents = [
                { 
                    id: 1, 
                    type: 'session', 
                    title: 'Quantum Mechanics Review', 
                    description: 'Review key concepts and practice problems',
                    time: 'Today, 2:00 PM', 
                    subject: 'Physics', 
                    color: '#6c63ff',
                    date: new Date().toISOString().split('T')[0],
                    timestamp: new Date().toISOString()
                },
                { 
                    id: 2, 
                    type: 'deadline', 
                    title: 'Grammar Test', 
                    description: 'Complete all grammar exercises',
                    time: 'Tomorrow, 10:00 AM', 
                    subject: 'English', 
                    color: '#ffc107',
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    timestamp: new Date(Date.now() + 86400000).toISOString()
                }
            ];
            setEvents(mockEvents);
            localStorage.setItem('studyCalendarEvents', JSON.stringify(mockEvents));
        }
    }, []);

    // Save events to localStorage whenever events change
    useEffect(() => {
        localStorage.setItem('studyCalendarEvents', JSON.stringify(events));
    }, [events]);

    const handleAddEvent = () => {
        setEditingEvent(null);
        setShowForm(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setShowForm(true);
    };

    const handleDeleteEvent = (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(events.filter(event => event.id !== eventId));
        }
    };

    const handleSaveEvent = (eventData) => {
        if (editingEvent) {
            // Update existing event
            setEvents(events.map(event => 
                event.id === eventData.id ? eventData : event
            ));
        } else {
            // Add new event
            setEvents([...events, eventData]);
        }
        setShowForm(false);
        setEditingEvent(null);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingEvent(null);
    };

    // Generate calendar days for current month
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const days = [];
        const today = new Date();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const hasEvent = events.some(event => 
                new Date(event.timestamp).toDateString() === date.toDateString()
            );
            const isToday = date.toDateString() === today.toDateString();
            
            days.push({
                date: i,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                hasEvent,
                isToday
            });
        }
        
        return days.slice(0, 7); // Show first 7 days for simplicity
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="schedule-calendar-container">
            {/* Header with Month/Controls */}
            <div className="calendar-header">
                <h4>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                <div className="calendar-controls">
                    <button 
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="calendar-nav-btn"
                    >
                        ‹
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="calendar-today-btn"
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="calendar-nav-btn"
                    >
                        ›
                    </button>
                </div>
            </div>
            
            {/* Visual Day Grid */}
            <div className="calendar-grid">
                {calendarDays.map((day, index) => (
                    <div 
                        key={index} 
                        className={`day-cell ${day.isToday ? 'current-day' : ''} ${day.hasEvent ? 'has-event' : ''}`}
                    >
                        <span>{day.dayName}</span>
                        <div className="day-number">{day.date}</div>
                        {day.hasEvent && <div className="event-dot"></div>}
                    </div>
                ))}
            </div>

            {/* Upcoming Events List */}
            <div className="upcoming-events-list">
                <h4>Upcoming Events ({events.length})</h4>
                <div className="events-scroll-container">
                    {events
                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                        .map(event => (
                            <EventItem 
                                key={event.id} 
                                event={event}
                                onEdit={handleEditEvent}
                                onDelete={handleDeleteEvent}
                            />
                        ))
                    }
                    {events.length === 0 && (
                        <p className="no-events">No events scheduled. Add your first event!</p>
                    )}
                </div>
            </div>

            <button className="add-event-button action-button" onClick={handleAddEvent}>
                + Add New Event
            </button>

            {/* Event Form Modal */}
            {showForm && (
                <EventForm 
                    event={editingEvent}
                    onSave={handleSaveEvent}
                    onCancel={handleCancelForm}
                />
            )}
        </div>
    );
};

export default ScheduleCalendar;