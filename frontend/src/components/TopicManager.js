import React, { useState } from 'react';

const predefinedSubjects = {
    "Physics": [
        "Newton's Laws of Motion",
        "Work and Energy", 
        "Gravitation",
        "Electric Fields",
        "Magnetic Fields",
        "Wave Optics",
        "Quantum Mechanics Basics",
        "Thermodynamics Laws",
        "Fluid Mechanics",
        "Simple Harmonic Motion"
    ],
    "Mathematics": [
        "Calculus - Derivatives",
        "Calculus - Integration", 
        "Linear Algebra - Matrices",
        "Probability Theory",
        "Statistics - Hypothesis Testing",
        "Trigonometry Basics",
        "Differential Equations",
        "Vector Calculus",
        "Complex Numbers"
    ],
    "Computer Science": [
        "Data Structures - Arrays",
        "Data Structures - Linked Lists", 
        "Algorithms - Sorting",
        "Object-Oriented Programming",
        "Database Design",
        "Web Development Basics",
        "Python Programming",
        "Machine Learning Intro",
        "Network Fundamentals"
    ],
    "Chemistry": [
        "Atomic Structure",
        "Chemical Bonding",
        "Organic Chemistry Basics", 
        "Acids and Bases",
        "Periodic Table Trends",
        "Chemical Reactions",
        "Stoichiometry",
        "Thermochemistry"
    ],
    "Biology": [
        "Cell Structure and Function",
        "DNA and Genetics",
        "Evolution Theory", 
        "Human Anatomy Basics",
        "Photosynthesis",
        "Ecosystems",
        "Microbiology Intro",
        "Neuroscience Basics"
    ]
};

function TopicManager({ onTopicAdded }) {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [specificTopic, setSpecificTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

    const saveTopicToStorage = (topicObject) => {
        const userId = getCurrentUserId();
        const storageKey = `temporaryTopics_${userId}`;
        
        const storedTopics = localStorage.getItem(storageKey);
        const existingTopics = storedTopics ? JSON.parse(storedTopics) : [];
        
        // Check if topic already exists to avoid duplicates
        const topicExists = existingTopics.some(topic => 
            topic.name === topicObject.name
        );
        
        if (topicExists) {
            setError("This topic already exists!");
            return false;
        }
        
        const updatedTopics = [...existingTopics, topicObject];
        localStorage.setItem(storageKey, JSON.stringify(updatedTopics));
        
        console.log('Saved topic to localStorage:', topicObject);
        console.log('All stored topics:', updatedTopics);
        return true;
    };

    const handleAddTopic = () => {
        setError('');
        setSuccessMessage('');
        
        if (selectedSubject && specificTopic) {
            const fullTopic = `${selectedSubject}: ${specificTopic}`;
            const topicObject = {
                id: Date.now(),
                name: fullTopic,
                subject: selectedSubject,
                specificArea: specificTopic,
                subtopics: [specificTopic],
                isCustom: true
            };
            
            const saved = saveTopicToStorage(topicObject);
            
            if (saved) {
                onTopicAdded(topicObject);
                
                setSelectedSubject('');
                setSpecificTopic('');
                setCustomTopic('');
                
                setSuccessMessage(`Topic "${fullTopic}" added successfully! You can find it under "Select a topic" in your study session.`);
                
                // Auto-scroll to study session after a delay
                setTimeout(() => {
                    const studySection = document.querySelector('.study-form');
                    if (studySection) {
                        studySection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 1500);
            }
            
        } else if (customTopic.trim()) {
            if (customTopic.length < 3) {
                setError("Please enter a more specific topic (at least 3 characters)");
                return;
            }
            
            let topicName = customTopic.trim();
            let subject = 'Custom';
            let specificArea = customTopic.trim();
            
            if (customTopic.includes(':') && customTopic.split(':').length === 2) {
                const [detectedSubject, detectedTopic] = customTopic.split(':').map(s => s.trim());
                if (detectedSubject && detectedTopic) {
                    subject = detectedSubject;
                    specificArea = detectedTopic;
                    topicName = `${subject}: ${specificArea}`;
                }
            }
            
            const topicObject = {
                id: Date.now(),
                name: topicName,
                subject: subject,
                specificArea: specificArea,
                subtopics: [specificArea],
                isCustom: true
            };
            
            const saved = saveTopicToStorage(topicObject);
            
            if (saved) {
                onTopicAdded(topicObject);
                
                setCustomTopic('');
                setSelectedSubject('');
                setSpecificTopic('');
                
                setSuccessMessage(`Topic "${topicName}" added successfully! You can find it under "Select a topic" in your study session.`);
                
                // Auto-scroll to study session after a delay
                setTimeout(() => {
                    const studySection = document.querySelector('.study-form');
                    if (studySection) {
                        studySection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 1500);
            }
        } else {
            setError("Please select a topic or enter a custom one");
        }
    };

    return (
        <div className="topic-manager">
            <h3>Add Learning Topic</h3>
            <p className="topic-instruction">Choose a specific topic for better learning results</p>
            
            <div className="form-group">
                <label>Select Subject:</label>
                <select 
                    value={selectedSubject} 
                    onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setSpecificTopic('');
                        setError('');
                        setSuccessMessage('');
                    }}
                    className="topic-select"
                >
                    <option value="">Choose a subject...</option>
                    {Object.keys(predefinedSubjects).map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>
            </div>

            {selectedSubject && (
                <div className="form-group">
                    <label>Select Specific Topic:</label>
                    <select 
                        value={specificTopic}
                        onChange={(e) => {
                            setSpecificTopic(e.target.value);
                            setError('');
                            setSuccessMessage('');
                        }}
                        className="topic-select"
                    >
                        <option value="">Choose a specific area...</option>
                        {predefinedSubjects[selectedSubject].map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Or Enter Custom Topic:</label>
                <input
                    type="text"
                    placeholder="e.g., Python list comprehensions, French Revolution causes..."
                    value={customTopic}
                    onChange={(e) => {
                        setCustomTopic(e.target.value);
                        setError('');
                        setSuccessMessage('');
                    }}
                    className="topic-input"
                />
                <small style={{color: '#666', fontSize: '12px'}}>
                    Tip: Use "Subject: Topic" format like "Physics: Quantum Mechanics"
                </small>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button onClick={handleAddTopic} className="add-topic-btn">
                Add Learning Topic
            </button>

            <div className="topic-tips">
                <h4>Tips for Better Learning:</h4>
                <ul>
                    <li>Choose specific topics rather than broad subjects</li>
                    <li>Break complex subjects into smaller, manageable topics</li>
                    <li>Focus on one concept at a time for deeper understanding</li>
                </ul>
            </div>
        </div>
    );
}

export default TopicManager;