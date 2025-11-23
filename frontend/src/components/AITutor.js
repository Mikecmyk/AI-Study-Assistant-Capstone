// AITutor.js
import React, { useState, useRef, useEffect } from 'react';
import api from '../api';

const AITutor = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('general');
    const [difficulty, setDifficulty] = useState('beginner');
    const [conversationHistory, setConversationHistory] = useState([]);
    const messagesEndRef = useRef(null);

    const subjects = {
        'general': 'General Learning',
        'math': 'Mathematics',
        'science': 'Science',
        'physics': 'Physics',
        'chemistry': 'Chemistry',
        'biology': 'Biology',
        'history': 'History',
        'english': 'English/Literature',
        'programming': 'Programming',
        'economics': 'Economics'
    };

    const difficulties = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced'
    };

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize with welcome message
    useEffect(() => {
        const welcomeMessage = {
            id: 1,
            text: "👋 Hello! I'm your AI Tutor. I can help you with various subjects and explain concepts step-by-step. What would you like to learn today?",
            sender: 'tutor',
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages([welcomeMessage]);
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Build context for the AI
            const context = {
                subject: selectedSubject,
                difficulty: difficulty,
                conversation_history: conversationHistory.slice(-6), // Last 3 exchanges
                current_question: inputMessage
            };

            const response = await api.post('/ai-tutor/chat/', {
                message: inputMessage,
                subject: selectedSubject,
                difficulty: difficulty,
                context: context
            });

            const tutorMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'tutor',
                timestamp: new Date().toLocaleTimeString(),
                subject: selectedSubject
            };

            setMessages(prev => [...prev, tutorMessage]);
            
            // Update conversation history
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: inputMessage },
                { role: 'assistant', content: response.data.response }
            ]);

            // Save to study history
            saveToStudyHistory(inputMessage, response.data.response);

        } catch (error) {
            console.error('Tutor error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting right now. Please try again in a moment.",
                sender: 'tutor',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveToStudyHistory = (question, answer) => {
        const studySession = {
            id: Date.now(),
            topic: `AI Tutor: ${subjects[selectedSubject]}`,
            duration: 'Tutor Session',
            content: `Q: ${question}\nA: ${answer.substring(0, 150)}...`,
            type: 'ai_tutor',
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            subject: selectedSubject,
            difficulty: difficulty
        };
        
        const existingHistory = localStorage.getItem('studyHistory');
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        const updatedHistory = [studySession, ...history].slice(0, 50);
        localStorage.setItem('studyHistory', JSON.stringify(updatedHistory));
    };

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
    };

    const clearConversation = () => {
        const welcomeMessage = {
            id: Date.now(),
            text: "👋 Hello! I'm your AI Tutor. What would you like to learn now?",
            sender: 'tutor',
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages([welcomeMessage]);
        setConversationHistory([]);
    };

    const quickQuestions = {
        math: [
            "Can you explain quadratic equations?",
            "How do I solve linear equations?",
            "What are derivatives in calculus?",
            "Explain probability basics"
        ],
        science: [
            "Explain Newton's laws of motion",
            "What is photosynthesis?",
            "Describe the water cycle",
            "Explain atomic structure"
        ],
        programming: [
            "What are functions in programming?",
            "Explain object-oriented programming",
            "How do loops work?",
            "What are data types?"
        ]
    };

    return (
        <div className="ai-tutor">
            <div className="tutor-header">
                <h3>🤖 AI Tutor</h3>
                <div className="tutor-controls">
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="subject-select"
                    >
                        {Object.entries(subjects).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>
                    
                    <select 
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="difficulty-select"
                    >
                        {Object.entries(difficulties).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>

                    <button onClick={clearConversation} className="clear-chat-btn">
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Quick Questions */}
            {quickQuestions[selectedSubject] && (
                <div className="quick-questions">
                    <h4>Quick Questions:</h4>
                    <div className="question-buttons">
                        {quickQuestions[selectedSubject].map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickQuestion(question)}
                                className="quick-question-btn"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            <div className="chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
                    >
                        <div className="message-content">
                            <div className="message-text">{message.text}</div>
                            <div className="message-time">{message.timestamp}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message tutor">
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="message-form">
                <div className="input-container">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`Ask me anything about ${subjects[selectedSubject]}...`}
                        disabled={isLoading}
                        className="message-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputMessage.trim()}
                        className="send-button"
                    >
                        {isLoading ? '⏳' : '🚀'}
                    </button>
                </div>
                <small className="input-hint">
                    Press Enter to send • Shift+Enter for new line
                </small>
            </form>

            {/* Tutor Tips */}
            <div className="tutor-tips">
                <h4>💡 Tutor Tips:</h4>
                <ul>
                    <li>Ask for step-by-step explanations</li>
                    <li>Request examples for better understanding</li>
                    <li>Ask "why" to understand concepts deeply</li>
                    <li>Change subject/difficulty for personalized help</li>
                </ul>
            </div>
        </div>
    );
};

export default AITutor;