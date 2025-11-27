// AITutor.js - Complete with enhanced text formatting
import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import './Dashboard.css'; 

const AITutor = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('general');
    const [difficulty, setDifficulty] = useState('beginner');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

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

    const scrollToBottom = (force = false) => {
        if (force || !isUserScrolling) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
            
            if (isAtBottom) {
                setIsUserScrolling(false);
            } else {
                setIsUserScrolling(true);
            }
        }
    };

    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        if (!isUserScrolling) {
            scrollToBottom();
        }
    }, [messages, isUserScrolling]);

    useEffect(() => {
        const welcomeMessage = {
            id: 1,
            text: "Hello! I'm your AI Tutor. I can help you with various subjects and explain concepts step-by-step. What would you like to learn today?",
            sender: 'tutor',
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages([welcomeMessage]);
    }, []);

    // Enhanced message formatting function
    const formatMessage = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        const elements = [];
        let currentList = [];
        let inList = false;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) {
                if (inList && currentList.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className="formatted-list">
                            {currentList.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    currentList = [];
                    inList = false;
                }
                elements.push(<br key={`br-${index}`} />);
                return;
            }

            if (trimmedLine.match(/^#{1,3}\s/) || 
                trimmedLine.match(/^[A-Z][^.!?]*:$/) ||
                trimmedLine.length < 60 && trimmedLine.match(/^[A-Z]/) && 
                !trimmedLine.match(/[.!?]$/)) {
                
                if (inList && currentList.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className="formatted-list">
                            {currentList.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    currentList = [];
                    inList = false;
                }

                const headerText = trimmedLine.replace(/^#{1,3}\s/, '');
                elements.push(
                    <h4 key={`h-${index}`} className="formatted-header">
                        {headerText}
                    </h4>
                );
                return;
            }

            if (trimmedLine.match(/^[•\-*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
                const listItem = trimmedLine.replace(/^[•\-*]\s/, '').replace(/^\d+\.\s/, '');
                currentList.push(listItem);
                inList = true;
                return;
            }

            if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
                const boldText = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                           .replace(/\*(.*?)\*/g, '<strong>$1</strong>');
                elements.push(
                    <p key={`p-${index}`} 
                       className="formatted-paragraph"
                       dangerouslySetInnerHTML={{ __html: boldText }}
                    />
                );
                return;
            }

            if (trimmedLine.match(/^[A-Z][^.!?]*!/) || 
                (trimmedLine.length < 100 && trimmedLine.match(/^[A-Z]/))) {
                elements.push(
                    <p key={`p-${index}`} className="formatted-key-point">
                        {trimmedLine}
                    </p>
                );
                return;
            }

            if (inList && currentList.length > 0) {
                elements.push(
                    <ul key={`list-${index}`} className="formatted-list">
                        {currentList.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                );
                currentList = [];
                inList = false;
            }

            elements.push(
                <p key={`p-${index}`} className="formatted-paragraph">
                    {trimmedLine}
                </p>
            );
        });

        if (inList && currentList.length > 0) {
            elements.push(
                <ul key={`list-final`} className="formatted-list">
                    {currentList.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
        }

        return <div className="formatted-content">{elements}</div>;
    };

    const Message = ({ message }) => {
        return (
            <div
                key={message.id}
                className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
                <div className="message-content">
                    {message.sender === 'tutor' && !message.isError ? (
                        formatMessage(message.text)
                    ) : (
                        <div className="message-text">{message.text}</div>
                    )}
                    <div className="message-time">{message.timestamp}</div>
                </div>
            </div>
        );
    };

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

        setIsUserScrolling(false);

        try {
            const context = {
                subject: selectedSubject,
                difficulty: difficulty,
                conversation_history: conversationHistory.slice(-6),
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
            
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: inputMessage },
                { role: 'assistant', content: response.data.response }
            ]);

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
        const userId = getCurrentUserId();
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
        
        const storageKey = `studyHistory_${userId}`;
        const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedHistory = [studySession, ...existingHistory].slice(0, 50);
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    };

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

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
    };

    const clearConversation = () => {
        const welcomeMessage = {
            id: Date.now(),
            text: "Hello! I'm your AI Tutor. What would you like to learn now?",
            sender: 'tutor',
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages([welcomeMessage]);
        setConversationHistory([]);
        setIsUserScrolling(false);
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
                <h3>AI Tutor</h3>
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
                        Clear Chat
                    </button>
                </div>
            </div>

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

            <div 
                className="chat-messages" 
                ref={chatContainerRef}
            >
                {messages.map((message) => (
                    <Message key={message.id} message={message} />
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

            <form onSubmit={handleSendMessage} className="message-form">
                <div className="input-container">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`Ask me anything about ${subjects[selectedSubject]}...`}
                        disabled={isLoading}
                        className="message-input"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputMessage.trim()}
                        className="send-button"
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
                <small className="input-hint">
                    Press Enter to send • Shift+Enter for new line
                </small>
            </form>

            <div className="tutor-tips">
                <h4>Tutor Tips:</h4>
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