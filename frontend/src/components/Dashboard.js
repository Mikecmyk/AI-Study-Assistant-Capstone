import React, { useState, useEffect } from 'react';
import api from '../api'; // Use the same Axios instance
import StudyTools from './StudyTools'; // Import the new component

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
        // We are currently blocked by a proxy 404 error here, but the code is correct
        const response = await api.get('/topics/'); 
        setTopics(response.data);

        if (response.data.length > 0) {
          setSelectedTopic(response.data[0].name);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching topics:", err);
        // Note: I changed the endpoint to just '/topics/' in the fetchTopics call 
        // as per standard setup with a proxy handling the '/api' prefix.
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
    <div className="dashboard-container">
      <h2>Start a New Study Session</h2>

      <form onSubmit={handleGenerateSession} className="study-form">
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <label style={{ marginRight: '10px' }}>
          Topic:
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            required
            style={{ marginLeft: '10px' }}
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.name}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: '20px', marginRight: '10px' }}>
          Duration (e.g., 3 days, 2 hours):
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 2 hours or 3 days"
            required
            style={{ marginLeft: '10px' }}
          />
        </label>

        <button type="submit" disabled={isGenerating} style={{ marginLeft: '20px' }}>
          {isGenerating ? 'Generating...' : 'Generate AI Study Plan'}
        </button>
      </form>

      {generatedContent && (
        <div className="generated-content">
          <h3>Generated Study Plan:</h3>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              padding: '15px',
              backgroundColor: '#f4f4f4',
              border: '1px solid #ddd',
            }}
          >
            {generatedContent}
          </pre>
        </div>
      )}

      {/* --- NEW STUDY TOOLS SECTION --- */}
      <hr style={{ margin: '30px 0' }} />
      {/* Render StudyTools, passing the loaded topics */}
      {topics.length > 0 && <StudyTools topics={topics} />} 
      <hr style={{ margin: '30px 0' }} />
      {/* --- END STUDY TOOLS SECTION --- */}

      <h2>Recent Study History</h2>
      <p>Your history will appear here.</p>
    </div>
  );
}

export default Dashboard;