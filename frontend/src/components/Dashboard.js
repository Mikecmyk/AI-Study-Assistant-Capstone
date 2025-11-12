// frontend/src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import api from '../api'; 

function Dashboard() {
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(''); // Stores the name of the selected topic
    const [duration, setDuration] = useState(''); // Stores the user-input duration
    const [generatedContent, setGeneratedContent] = useState(''); // Stores the AI response
    const [isGenerating, setIsGenerating] = useState(false); // Loading state for the AI call
    
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await api.get('/api/topics/'); 
                setTopics(response.data);
                // Set the first topic as the default selection
                if (response.data.length > 0) {
                    setSelectedTopic(response.data[0].name); 
                }
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching topics:", err);
                // Clear the token and force logout if auth fails
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
        e.preventDefault(); // Prevent form submission default
        setGeneratedContent(''); // Clear previous content
        setError(null);
        setIsGenerating(true);

        try {
            // Data structure must match Django's StudySessionSerializer fields:
            const response = await api.post('/api/sessions/', {
                topic_name: selectedTopic,
                duration_input: duration,
            });

            // The AI-generated content is returned in the response data
            setGeneratedContent(response.data.generated_content);
            alert(`Study session created successfully for ${response.data.topic_name}!`);

        } catch (err) {
            console.error("Error generating session:", err.response ? err.response.data : err);
            setError("Failed to generate study plan. Check console for details.");

        } finally {
            setIsGenerating(false);
        }
    };

    // --- Loading and Error States ---
    if (isLoading) {
        return <div className="dashboard-container">Loading Dashboard...</div>;
    }

    // --- Main Component Render ---
    return (
        <div className="dashboard-container">
            <h2>Start a New Study Session</h2>

            {/* Study Session Form */}
            <form onSubmit={handleGenerateSession} className="study-form">
                {/* Error Display */}
                {error && <p style={{color: 'red'}}>Error: {error}</p>}

                {/* Topic Selection (Dropdown) */}
                <label style={{ marginRight: '10px' }}>
                    Topic:
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        required
                        style={{ marginLeft: '10px' }}
                    >
                        {topics.map(topic => (
                            <option key={topic.id} value={topic.name}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Duration Input */}
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

            <hr style={{ margin: '30px 0' }}/>

            {/* AI Generated Content Display */}
            {generatedContent && (
                <div className="generated-content">
                    <h3>Generated Study Plan:</h3>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        textAlign: 'left', 
                        padding: '15px', 
                        backgroundColor: '#f4f4f4',
                        border: '1px solid #ddd' 
                    }}>
                        {generatedContent}
                    </pre>
                </div>
            )}

            <hr style={{ margin: '30px 0' }}/>

            {/* Placeholder for history */}
            <h2>Recent Study History</h2>
            <p>Your history will appear here.</p>
        </div>
    );
} // <--- THE MISSING CLOSING BRACE IS HERE!

export default Dashboard;