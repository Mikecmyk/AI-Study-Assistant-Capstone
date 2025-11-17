// src/components/ScheduleCalendar.js

import React from 'react';

// Mock data for upcoming events
const MOCK_EVENTS = [
    { id: 1, type: 'session', title: 'Quantum Mechanics Review', time: 'Today, 2:00 PM', subject: 'Physics', color: '#6c63ff' },
    { id: 2, type: 'deadline', title: 'Grammar Test', time: 'Tomorrow, 10:00 AM', subject: 'English', color: '#ffc107' },
    { id: 3, type: 'session', title: 'Data Structures Practice', time: 'Wed, 4:30 PM', subject: 'Programming', color: '#6c63ff' },
    { id: 4, type: 'deadline', title: 'History Essay Due', time: 'Fri, 11:59 PM', subject: 'History', color: '#dc3545' },
];

// Helper function to render a single event item
const EventItem = ({ title, time, subject, color }) => (
    <div className="schedule-event-item">
        <div className="event-indicator" style={{ backgroundColor: color }}></div>
        <div className="event-details">
            <p className="event-title">{title}</p>
            <p className="event-time">{time}</p>
        </div>
        <span className="event-subject-tag" style={{ backgroundColor: color, color: '#fff' }}>
            {subject}
        </span>
    </div>
);

const ScheduleCalendar = () => {
    return (
        <div className="schedule-calendar-container">
            {/* 1. Header with Month/Controls */}
            <div className="calendar-header">
                <h4>September 2025</h4>
                <button className="calendar-view-button">Full View</button>
            </div>
            
            {/* 2. Visual Day Grid (Simplified Placeholder) */}
            <div className="calendar-grid-placeholder">
                <div className="day-cell current-day"><span>M</span> 15</div>
                <div className="day-cell"><span>T</span> 16</div>
                <div className="day-cell"><span>W</span> 17</div>
                <div className="day-cell has-event"><span>T</span> 18</div>
                <div className="day-cell"><span>F</span> 19</div>
                <div className="day-cell"><span>S</span> 20</div>
                <div className="day-cell"><span>S</span> 21</div>
            </div>

            {/* 3. Upcoming Events List */}
            <div className="upcoming-events-list">
                <h4>Upcoming Events</h4>
                {MOCK_EVENTS.map(event => (
                    <EventItem key={event.id} {...event} />
                ))}
            </div>

            <button className="add-event-button action-button">
                + Add New Event
            </button>
        </div>
    );
};

export default ScheduleCalendar;