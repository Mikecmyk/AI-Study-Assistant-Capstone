// frontend/src/components/StudyTools.js

import React, { useState } from 'react';
import api from '../api'; // Use the authenticated API instance

function StudyTools({ topics }) {
    const [selectedTopic, setSelectedTopic] = useState(topics.length > 0 ? topics[0].name : '');
    const [toolType, setToolType] = useState('notes'); // 'notes' or 'quiz'
    const [generationResult, setGenerationResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerationResult('');
        setError(null);
        setIsGenerating(true);

        // We will define a new endpoint in Django for this in the next step!
        const endpoint = '/api/study-tools/'; 

        try {
            const response = await api.post(endpoint, {
                topic_name: selectedTopic,
                tool_type: toolType, // 'notes' or 'quiz'
            });

            setGenerationResult(response.data.generated_content);
            alert(`${toolType.charAt(0).toUpperCase() + toolType.slice(1)} generated successfully!`);

        } catch (err) {
            console.error(`Error generating ${toolType}:`, err.response ? err.response.data : err);
            setError(`Failed to generate ${toolType}. Check console for details.`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="study-tools-container" style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <h3>Advanced Study Tools (Notes & Quizzes)</h3>
            
            <form onSubmit={handleGenerate} className="study-form-tools">
                {error && <p style={{color: 'red'}}>Error: {error}</p>}

                {/* Topic Selection */}
                <label style={{ marginRight: '15px' }}>
                    Select Topic:
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

                {/* Tool Selection (Radio Buttons) */}
                <label style={{ marginRight: '15px' }}>
                    <input
                        type="radio"
                        value="notes"
                        checked={toolType === 'notes'}
                        onChange={() => setToolType('notes')}
                        style={{ marginLeft: '20px', marginRight: '5px' }}
                    />
                    Generate Notes
                </label>
                <label>
                    <input
                        type="radio"
                        value="quiz"
                        checked={toolType === 'quiz'}
                        onChange={() => setToolType('quiz')}
                        style={{ marginRight: '5px' }}
                    />
                    Generate Quiz
                </label>

                <button type="submit" disabled={isGenerating} style={{ marginLeft: '20px' }}>
                    {isGenerating ? `Generating ${toolType}...` : `Generate ${toolType.charAt(0).toUpperCase() + toolType.slice(1)}`}
                </button>
            </form>

            {/* Display Results */}
            {generationResult && (
                <div className="tool-results" style={{ marginTop: '20px' }}>
                    <h4>Generated {toolType.charAt(0).toUpperCase() + toolType.slice(1)}:</h4>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        textAlign: 'left', 
                        padding: '15px', 
                        backgroundColor: '#f6f6f6',
                        border: '1px solid #ddd' 
                    }}>
                        {generationResult}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default StudyTools;