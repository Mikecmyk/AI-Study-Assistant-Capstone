// frontend/src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import api from '../api'; 

function Dashboard() {
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                
                const response = await api.get('/api/topics/'); 
                setTopics(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching topics:", err);
                setError("Failed to load study topics.");
                setIsLoading(false);
            }
        };

        fetchTopics();
    }, []);

    
    const handleGenerateSession = () => {
        alert("Generate Session button clicked! We will build the form here next.");
    };


    if (isLoading) {
        return <div className="dashboard-container">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-container" style={{color: 'red'}}>Error: {error}</div>;
    }

    return (
        <div className="dashboard-container">
            <h2>Start a New Study Session</h2>
            
            {/* Displaying available topics */}
            <p>Available Topics:</p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {topics.map(topic => (
                    <li key={topic.id} style={{ display: 'inline', marginRight: '15px', border: '1px solid #ccc', padding: '5px' }}>
                        {topic.name}
                    </li>
                ))}
            </ul>

            {/* Placeholder for the form */}
            <div className="study-form">
                <h3>Generate AI Study Plan</h3>
                <button onClick={handleGenerateSession}>
                    Generate Session
                </button>
            </div>

            <hr style={{ margin: '30px 0' }}/>

            {/* Placeholder for history */}
            <h2>Recent Study History</h2>
            <p>Your history will appear here.</p>
        </div>
    );
}

export default Dashboard;