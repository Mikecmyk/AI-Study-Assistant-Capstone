import React, { useState, useEffect } from 'react';

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
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    console.warn('JSON parse error, returning default:', error);
    return defaultValue;
  }
};

export const recordStudyProgress = (topic, type = 'study_plan') => {
  const userId = getCurrentUserId();
  const storageKey = `studyProgress_${userId}`;
  
  const today = new Date().toISOString().split('T')[0];
  const progressData = safeJSONParse(localStorage.getItem(storageKey), []);
  
  const todayEntry = progressData.find(entry => entry.date === today);
  
  if (todayEntry) {
    todayEntry.count += 1;
    todayEntry.topics.push({
      topic: topic,
      type: type,
      timestamp: new Date().toISOString()
    });
  } else {
    progressData.push({
      date: today,
      count: 1,
      topics: [{
        topic: topic,
        type: type,
        timestamp: new Date().toISOString()
      }]
    });
  }
  
  const recentData = progressData.slice(-30);
  localStorage.setItem(storageKey, JSON.stringify(recentData));
};

const ProductivityChart = () => {
  const [progressData, setProgressData] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [averageSessions, setAverageSessions] = useState(0);

  useEffect(() => {
    const userId = getCurrentUserId();
    const storageKey = `studyProgress_${userId}`;
    const data = safeJSONParse(localStorage.getItem(storageKey), []);
    
    console.log('Productivity data loaded:', data);
    setProgressData(data);

    // Ensure data is an array before using reduce
    const total = Array.isArray(data) ? data.reduce((sum, day) => sum + (day.count || 0), 0) : 0;
    const average = Array.isArray(data) && data.length > 0 ? (total / data.length).toFixed(1) : 0;

    setTotalSessions(total);
    setAverageSessions(average);
  }, []);

  const getLast7DaysData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    return last7Days.map(date => {
      const entry = Array.isArray(progressData) ? progressData.find(item => item.date === date) : null;
      return {
        date: date,
        count: entry ? (entry.count || 0) : 0,
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      };
    });
  };

  const weekData = getLast7DaysData();
  const maxCount = Math.max(...weekData.map(day => day.count), 1);

  return (
    <div className="productivity-chart-container">
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Total Sessions</span>
          <span className="stat-value">{totalSessions}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Daily Average</span>
          <span className="stat-value">{averageSessions}</span>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <div className="simple-bar-chart">
          <div className="chart-title">Study Activity (Last 7 Days)</div>
          <div className="bars-container">
            {weekData.map((day, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{day.label}</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(day.count / maxCount) * 100}%`,
                      backgroundColor: day.count > 0 ? '#4361ee' : '#e2e8f0'
                    }}
                  ></div>
                </div>
                <div className="bar-value">{day.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {totalSessions === 0 && (
        <div className="no-data-message">
          <p>No study data yet. Start studying to see your progress.</p>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;