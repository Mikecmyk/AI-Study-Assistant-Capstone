// StudyTools.js - UPDATED WITH MODERN MARKDOWN RENDERER
import React, { useState } from 'react';
import api from '../api';
import MarkdownRenderer from './MarkdownRenderer';

const saveToStudyHistory = (filename, content, type) => {
    const studySession = {
        id: Date.now(),
        topic: `Study Tools: ${filename}`,
        duration: 'AI Generated',
        content: content.substring(0, 200) + '...',
        type: type,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        filename: filename
    };
    
    const existingHistory = localStorage.getItem('studyHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    const updatedHistory = [studySession, ...history].slice(0, 50);
    localStorage.setItem('studyHistory', JSON.stringify(updatedHistory));
    
    console.log('Saved study tools output to history');
};

const StudyTools = ({ topics, selectedTopic, selectedSubtopics = [] }) => {
    const [localSelectedTopic, setLocalSelectedTopic] = useState(selectedTopic || '');
    const [notes, setNotes] = useState('');
    const [quiz, setQuiz] = useState('');
    const [loading, setLoading] = useState('');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const currentTopic = selectedTopic || localSelectedTopic;
    const currentSubtopics = selectedSubtopics;

    const handleCopyToClipboard = async (content, type) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopySuccess(`${type} copied to clipboard!`);
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setCopySuccess(`Failed to copy ${type}`);
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };

    const handleDownloadTxt = (content, type) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        
        const topicName = currentTopic.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        const fileType = type === 'notes' ? 'AI_Notes' : 'AI_Quiz';
        element.download = `Zonlus_${fileType}_${topicName}_${date}.txt`;
        
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        setCopySuccess(`${type === 'notes' ? 'Notes' : 'Quiz'} downloaded as text file!`);
        setTimeout(() => setCopySuccess(''), 3000);
    };

    const handleDownloadPDF = (content, type) => {
        const printWindow = window.open('', '_blank');
        const topicName = currentTopic || 'Study Material';
        const date = new Date().toLocaleDateString();
        const displayType = type === 'notes' ? 'AI Study Notes' : 'AI Quiz';
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Zonlus ${displayType} - ${topicName}</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 40px; 
                            line-height: 1.6; 
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 40px 20px;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 3px solid #4361ee; 
                            padding-bottom: 25px; 
                            margin-bottom: 35px; 
                        }
                        .topic { 
                            color: #4361ee; 
                            font-size: 32px; 
                            margin-bottom: 12px;
                            font-weight: 700;
                        }
                        .type { 
                            color: #f72585; 
                            font-size: 20px; 
                            margin-bottom: 12px;
                            font-weight: 600;
                        }
                        .date { 
                            color: #666; 
                            font-size: 16px; 
                        }
                        .content { 
                            white-space: pre-wrap; 
                            font-size: 15px;
                            line-height: 1.7;
                        }
                        .footer { 
                            margin-top: 50px; 
                            text-align: center; 
                            color: #999; 
                            font-size: 14px;
                            border-top: 1px solid #eee;
                            padding-top: 20px;
                        }
                        @media print { 
                            body { 
                                margin: 20px; 
                                padding: 20px;
                            }
                            .header {
                                margin-bottom: 25px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="topic">${topicName}</div>
                        <div class="type">${displayType}</div>
                        <div class="date">Generated on ${date} via Zonlus AI</div>
                    </div>
                    <div class="content">${content}</div>
                    <div class="footer">
                        Created with Zonlus - Your AI Exam Partner<br>
                        Learn smarter, not harder.
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        setCopySuccess(`Opening print dialog for ${displayType}...`);
        setTimeout(() => setCopySuccess(''), 3000);
    };

    const generateContent = async (type) => {
        if (!currentTopic) {
            setError('Please select a topic first');
            return;
        }

        setLoading(type);
        setError('');
        setCopySuccess('');
        
        try {
            const payload = {
                topic: currentTopic,
                subtopics: currentSubtopics
            };

            console.log(`Generating ${type} for:`, payload);

            let response;
            if (type === 'notes') {
                response = await api.post('/study-tools/', payload);
                const notesContent = response.data.notes;
                setNotes(notesContent);
                setQuiz('');
                saveToStudyHistory(currentTopic, notesContent, 'notes');
            } else if (type === 'quiz') {
                response = await api.post('/quiz-generate/', payload);
                const quizContent = response.data.quiz;
                setQuiz(quizContent);
                setNotes('');
                saveToStudyHistory(currentTopic, quizContent, 'quiz');
            }
        } catch (err) {
            console.error(`Error generating ${type}:`, err);
            setError(
                err.response?.data?.error || 
                `Failed to generate ${type}. Please try again.`
            );
        } finally {
            setLoading('');
        }
    };

    const ActionButtons = ({ content, type }) => (
        <div className="content-actions">
            <button 
                onClick={() => handleCopyToClipboard(content, type)}
                className="action-btn copy-btn"
                title={`Copy ${type} to clipboard`}
            >
                Copy
            </button>
            
            <button 
                onClick={() => handleDownloadTxt(content, type)}
                className="action-btn download-btn"
                title={`Download ${type} as text file`}
            >
                Download TXT
            </button>
            
            <button 
                onClick={() => handleDownloadPDF(content, type)}
                className="action-btn pdf-btn"
                title={`Save ${type} as PDF`}
            >
                Save as PDF
            </button>
        </div>
    );

    return (
        <div className="study-tools">
            <h3>AI Study Tools</h3>
            
            <div className="tool-controls">
                <select 
                    value={currentTopic}
                    onChange={(e) => setLocalSelectedTopic(e.target.value)}
                    className="topic-select"
                    disabled={selectedTopic}
                >
                    <option value="">Select a topic...</option>
                    {topics.map((topic) => (
                        <option key={topic.id || topic.name} value={topic.name || topic}>
                            {topic.name || topic}
                        </option>
                    ))}
                </select>

                <div className="tool-buttons">
                    <button 
                        onClick={() => generateContent('notes')}
                        disabled={loading || !currentTopic}
                        className="tool-btn notes-btn"
                    >
                        {loading === 'notes' ? 'Generating...' : 'Generate Notes'}
                    </button>
                    
                    <button 
                        onClick={() => generateContent('quiz')}
                        disabled={loading || !currentTopic}
                        className="tool-btn quiz-btn"
                    >
                        {loading === 'quiz' ? 'Generating...' : 'Generate Quiz'}
                    </button>
                </div>
            </div>

            {currentSubtopics.length > 0 && (
                <div className="subtopics-info">
                    <strong>Focus Areas:</strong> {currentSubtopics.join(', ')}
                </div>
            )}

            {!selectedTopic && currentTopic && (
                <div className="current-topic-info">
                    <small>Working on: <strong>{currentTopic}</strong></small>
                </div>
            )}

            {copySuccess && (
                <div className="copy-success-message">
                    {copySuccess}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {notes && (
                <div className="generated-content">
                    <div className="content-header">
                        <h4>Study Notes:</h4>
                        <ActionButtons content={notes} type="notes" />
                    </div>
                    <div className="content-output notes-output">
                        <MarkdownRenderer content={notes} />
                    </div>
                </div>
            )}

            {quiz && (
                <div className="generated-content">
                    <div className="content-header">
                        <h4>Quiz:</h4>
                        <ActionButtons content={quiz} type="quiz" />
                    </div>
                    <div className="content-output quiz-output">
                        <MarkdownRenderer content={quiz} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyTools;