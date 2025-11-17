// Dashboard.js (Full, Updated Component)

import React, { useState, useEffect } from 'react';
import api from '../api'; 
import StudyTools from './StudyTools';
// 1. IMPORT THE NEW CSS FILE
import './Dashboard.css'; 
// You might also need to import Sidebar and ScheduleView components if you create them
// import Sidebar from './Sidebar';
// import ScheduleView from './ScheduleView'; 


function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError("Failed to load study topics. Please log in again.");
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleGenerateSession = async (e) => {
    e.preventDefault();
    setGeneratedContent('');
    setError(null);
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
      setError("Failed to generate study plan. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="dashboard-container">Loading Dashboard...</div>;
  }

  return (
    // 2. APPLY GRID LAYOUT CLASS
    <div className="dashboard-container">
      
      {/* 3. LEFT SIDEBAR (e.g., Logo, Primary Nav Links) */}
      <aside className="sidebar">
          {/* Placeholder for your Sidebar content */}
          <h3>Study Core</h3>
          <p>Navigation Links here...</p>
      </aside>

      {/* 4. MAIN CONTENT AREA (Tasks, Tools, History) */}
      <div className="main-content">

          {/* Study Plan Generator Form */}
          <div className="dashboard-card">
              <h2>Start a New Study Session</h2>
              
              {/* Apply CSS class to the form and remove inline styles */}
              <form onSubmit={handleGenerateSession} className="study-form">
                {error && <p className="error-message">Error: {error}</p>}

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
                  {/* <pre> tag uses the .generated-content pre CSS style */}
                  <pre>
                    {generatedContent}
                  </pre>
                </div>
              )}
          </div>
          
          {/* AI Study Tools (Notes/Quiz) - Now fully functional! */}
          <div className="ai-study-tools dashboard-card">
              <StudyTools topics={topics} /> 
          </div>

          {/* Placeholder for Urgent Tasks/Productivity Chart */}
          <div className="urgent-tasks dashboard-card">
              <h3>Urgent Tasks</h3>
              <p>Task cards will appear here.</p>
          </div>
          
          <div className="study-history dashboard-card">
              <h2>Recent Study History</h2>
              <p>Your history will appear here.</p>
          </div>

      </div>
      
      {/* 5. RIGHT SCHEDULE/CALENDAR COLUMN */}
      <aside className="right-schedule">
          {/* Placeholder for your Schedule/Calendar View component */}
          <h3>Schedule & Calendar</h3>
          <p>Calendar component here...</p>
      </aside>
    </div>
  );
}

export default Dashboard;