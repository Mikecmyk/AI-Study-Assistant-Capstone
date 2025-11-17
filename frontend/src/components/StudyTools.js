// src/components/StudyTools.js (Updated with Modern CSS Classes)

import React, { useEffect, useState } from 'react'; 
import api from '../api'; 
// Import the CSS if this component uses its own styles, 
// or rely on Dashboard.css if it's imported there. We'll rely on Dashboard.css.


const StudyTools = ({ topics: propTopics }) => {
    // State to hold the topics if not passed as a prop
    const [topics, setTopics] = useState(propTopics || []); 
    const [selectedTopic, setSelectedTopic] = useState(''); 
    
    // State for Notes and Quizzes
    const [notes, setNotes] = useState(''); 
    const [quiz, setQuiz] = useState(''); 
    
    // State for loading
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [error, setError] = useState(null);

    // Fetch topics only if not passed as a prop
    useEffect(() => {
        if (topics.length === 0) {
            const fetchTopics = async () => {
                try {
                    const response = await api.get('/topics/');
                    setTopics(response.data);
                    if (response.data.length > 0) {
                        setSelectedTopic(response.data[0].name);
                    }
                } catch (error) {
                    console.error('Error fetching topics:', error);
                    setError('Failed to load study topics.');
                }
            };
            fetchTopics();
        }
    }, [propTopics, topics.length]);

    // Handle Generate Notes
    const handleGenerateNotes = async () => {
        if (!selectedTopic) {
            alert('Please select a topic first!');
            return;
        }

        setNotes(''); 
        setError(null);
        setLoadingNotes(true);
        
        try {
            const response = await api.post('/study-tools/', {
                topic: selectedTopic,
            });
            setNotes(response.data.notes);
        } catch (err) {
            console.error('Error generating notes:', err);
            setError(err.response?.data?.error || 'Failed to generate notes');
        } finally {
            setLoadingNotes(false);
        }
    };
    
    // Handle Generate Quiz
    const handleGenerateQuiz = async () => {
        if (!selectedTopic) {
            alert('Please select a topic first!');
            return;
        }

        setQuiz(''); 
        setError(null);
        setLoadingQuiz(true);
        
        try {
            const response = await api.post('/quiz-generate/', { 
                topic: selectedTopic,
            });
            setQuiz(response.data.quiz);
        } catch (err) {
            console.error('Error generating quiz:', err);
            setError(err.response?.data?.error || 'Failed to generate quiz');
        } finally {
            setLoadingQuiz(false);
        }
    };

    return (
        <div className="study-tools-container">
            <h3>AI Study Tools</h3> 
            
            {error && <p className="error-message">{error}</p>}

            <div className="topic-selector-group">
                <label>
                    Select Topic:
                    <select 
                        value={selectedTopic} 
                        onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                        {topics.length === 0 && <option value="">Loading topics...</option>}
                        {topics.map((topic) => (
                            <option key={topic.id} value={topic.name}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* --- Notes Section --- */}
            <div className="tool-section notes-section">
                <h4>Study Notes Generator</h4>
                <button 
                    onClick={handleGenerateNotes} 
                    disabled={loadingNotes || !selectedTopic}
                    className="action-button" // Reuse the primary action button style
                >
                    {loadingNotes ? 'Generating Notes...' : 'Generate AI Notes'}
                </button>
            
                {/* 1. APPLY NEW GENERATED CONTENT STYLES */}
                {notes && (
                    <div className="generated-content">
                        <h4>Generated Notes for {selectedTopic}:</h4>
                        {/* Use the new class for output formatting, assuming notes contain readable text/markdown */}
                        <div className="generated-notes-output">
                            {notes}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Quiz Section --- */}
            <div className="tool-section quiz-section">
                <h4>Quiz Generator</h4>
                <button 
                    onClick={handleGenerateQuiz} 
                    disabled={loadingQuiz || !selectedTopic}
                    className="action-button" // Reuse the primary action button style
                >
                    {loadingQuiz ? 'Generating Quiz...' : 'Generate AI Quiz'}
                </button>
            
                {/* 2. APPLY NEW GENERATED CONTENT STYLES */}
                {quiz && (
                    <div className="generated-content">
                        <h4>Generated Quiz for {selectedTopic}:</h4>
                        {/* Use the new class for quiz formatting */}
                        <div className="generated-quiz-output">
                            {quiz}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyTools;