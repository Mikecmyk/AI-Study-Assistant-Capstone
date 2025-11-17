// src/components/StudyTools.js
import React, { useEffect, useState } from 'react'; // React is no longer "unused" because we use JSX
import api from '../api'; // Use the authenticated API instance

const StudyTools = ({ topics: propTopics }) => { // 1. Use propTopics if provided
    // State to hold the topics if not passed as a prop (from Dashboard.js)
    const [topics, setTopics] = useState(propTopics || []); 
    const [selectedTopic, setSelectedTopic] = useState(''); 
    
    // State for Notes and Quizzes
    const [notes, setNotes] = useState(''); 
    const [quiz, setQuiz] = useState(''); 
    
    // State for loading
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [error, setError] = useState(null);

    // 2. Fetch topics only if not passed as a prop (propTopics is empty/null)
    // This makes the component more robust
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

    // 3. handleGenerateNotes is now used
    const handleGenerateNotes = async () => {
        if (!selectedTopic) {
            alert('Please select a topic first!');
            return;
        }

        setNotes(''); // Clear previous results
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
    
    // 4. New function handleGenerateQuiz for the quiz endpoint
    const handleGenerateQuiz = async () => {
        if (!selectedTopic) {
            alert('Please select a topic first!');
            return;
        }

        setQuiz(''); // Clear previous results
        setError(null);
        setLoadingQuiz(true);
        
        try {
            const response = await api.post('/quiz-generate/', { // Use the new endpoint
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
            <h2>AI Study Tools</h2>
            
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <div style={{ marginBottom: '20px' }}>
                <label>
                    Select Topic:
                    <select 
                        value={selectedTopic} 
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        style={{ marginLeft: '10px' }}
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
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
                <h3>Study Notes Generator</h3>
                <button 
                    onClick={handleGenerateNotes} 
                    disabled={loadingNotes || !selectedTopic}
                >
                    {loadingNotes ? 'Generating Notes...' : 'Generate AI Notes'}
                </button>
            
                {/* notes is now used */}
                {notes && (
                    <div style={{ marginTop: '15px' }}>
                        <h4>Generated Notes for {selectedTopic}:</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #eee' }}>
                            {notes}
                        </pre>
                    </div>
                )}
            </div>

            {/* --- Quiz Section --- */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Quiz Generator</h3>
                <button 
                    onClick={handleGenerateQuiz} 
                    disabled={loadingQuiz || !selectedTopic}
                >
                    {loadingQuiz ? 'Generating Quiz...' : 'Generate AI Quiz'}
                </button>
            
                {/* New state for quiz is used */}
                {quiz && (
                    <div style={{ marginTop: '15px' }}>
                        <h4>Generated Quiz for {selectedTopic}:</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #eee' }}>
                            {quiz}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyTools;