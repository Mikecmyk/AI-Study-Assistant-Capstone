import React, { useState, useEffect } from 'react';
import './TopicManager.css';

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

// Freemium limits
const FREEMIUM_LIMITS = {
    free: {
        maxTopics: 5,
        maxStudySessions: 10,
        features: [
            "5 custom topics",
            "10 study sessions",
            "Basic AI study plans",
            "Study tools access",
            "Progress tracking"
        ]
    },
    premium: {
        maxTopics: 999,
        maxStudySessions: 999,
        features: [
            "Unlimited custom topics",
            "Unlimited study sessions",
            "Advanced AI explanations",
            "Priority support",
            "Export unlimited content",
            "Advanced analytics"
        ]
    }
};

// Pricing in KSH
const PRICING_PLANS = {
    monthly: {
        name: "Monthly Premium",
        price: 1499,
        period: "month",
        popular: false
    },
    yearly: {
        name: "Yearly Premium",
        price: 14999,
        period: "year",
        popular: true,
        savings: 1499 * 12 - 14999 // Calculate savings
    }
};

function TopicManager({ onTopicAdded }) {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [specificTopic, setSpecificTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userTopicCount, setUserTopicCount] = useState(0);
    const [userPlan, setUserPlan] = useState('free');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [studySessionCount, setStudySessionCount] = useState(0);

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

    useEffect(() => {
        const userId = getCurrentUserId();
        
        // Load user topics
        const storageKey = `temporaryTopics_${userId}`;
        const storedTopics = localStorage.getItem(storageKey);
        const existingTopics = storedTopics ? JSON.parse(storedTopics) : [];
        setUserTopicCount(existingTopics.length);
        
        // Load user plan
        const savedPlan = localStorage.getItem('userPlan') || 'free';
        setUserPlan(savedPlan);
        
        // Load study session count
        const studyHistoryKey = `studyHistory_${userId}`;
        const studyHistory = JSON.parse(localStorage.getItem(studyHistoryKey) || '[]');
        setStudySessionCount(studyHistory.length);
    }, []);

    const canAddMoreTopics = userPlan === 'premium' || userTopicCount < FREEMIUM_LIMITS.free.maxTopics;
    const canCreateMoreSessions = userPlan === 'premium' || studySessionCount < FREEMIUM_LIMITS.free.maxStudySessions;

    const formatKSH = (amount) => {
        return `KSH ${amount.toLocaleString()}`;
    };

    const saveTopicToStorage = (topicObject) => {
        if (!canAddMoreTopics) {
            setShowUpgradeModal(true);
            return false;
        }

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
        setUserTopicCount(updatedTopics.length);
        
        console.log('Saved topic to localStorage:', topicObject);
        return true;
    };

    const handleAddTopic = () => {
        setError('');
        setSuccessMessage('');
        
        if (!canCreateMoreSessions) {
            setError("You've reached your free study session limit! Upgrade to premium for unlimited learning.");
            setShowUpgradeModal(true);
            return;
        }

        if (selectedSubject && specificTopic) {
            const fullTopic = `${selectedSubject}: ${specificTopic}`;
            const topicObject = {
                id: Date.now(),
                name: fullTopic,
                subject: selectedSubject,
                specificArea: specificTopic,
                subtopics: [specificTopic],
                isCustom: true,
                createdAt: new Date().toISOString()
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
                isCustom: true,
                createdAt: new Date().toISOString()
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

    const handleUpgradePlan = (planType) => {
        const plan = PRICING_PLANS[planType];
        
        // In a real app, this would integrate with a payment processor like M-Pesa
        console.log(`Processing payment for ${plan.name}: ${formatKSH(plan.price)}`);
        
        // Simulate successful payment
        setUserPlan('premium');
        localStorage.setItem('userPlan', 'premium');
        setShowUpgradeModal(false);
        
        alert(`🎉 Successfully upgraded to ${plan.name}! You now have unlimited topics and study sessions.`);
        
        // Clear any error messages
        setError('');
    };

    const UsageMeter = () => (
        <div className="usage-meter">
            <div className="meter-header">
                <h4>Your Learning Limits</h4>
                <span className="plan-badge">{userPlan === 'premium' ? 'Premium' : 'Free'}</span>
            </div>
            
            <div className="meter-item">
                <div className="meter-label">
                    <span>Custom Topics</span>
                    <span>{userTopicCount}/{FREEMIUM_LIMITS[userPlan].maxTopics}</span>
                </div>
                <div className="meter-bar">
                    <div 
                        className="meter-fill topics-fill"
                        style={{ width: `${(userTopicCount / FREEMIUM_LIMITS[userPlan].maxTopics) * 100}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="meter-item">
                <div className="meter-label">
                    <span>Study Sessions</span>
                    <span>{studySessionCount}/{FREEMIUM_LIMITS[userPlan].maxStudySessions}</span>
                </div>
                <div className="meter-bar">
                    <div 
                        className="meter-fill sessions-fill"
                        style={{ width: `${(studySessionCount / FREEMIUM_LIMITS[userPlan].maxStudySessions) * 100}%` }}
                    ></div>
                </div>
            </div>
            
            {userPlan === 'free' && (
                <div className="upgrade-prompt-mini">
                    <p>Upgrade to unlock unlimited learning</p>
                    <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="upgrade-mini-btn"
                    >
                        Upgrade Now
                    </button>
                </div>
            )}
        </div>
    );

    const UpgradeModal = () => (
        <div className="modal-overlay">
            <div className="upgrade-modal">
                <div className="modal-header">
                    <h2> Upgrade to Premium</h2>
                    <button 
                        onClick={() => setShowUpgradeModal(false)}
                        className="close-modal"
                    >
                        ×
                    </button>
                </div>
                
                <div className="modal-content">
                    <div className="upgrade-reason">
                        <h3>Unlock Unlimited Learning</h3>
                        <p>
                            {!canAddMoreTopics 
                                ? "You've reached your free topic limit. Upgrade to add unlimited custom topics!" 
                                : "You're reaching your free limits. Upgrade for unlimited learning!"}
                        </p>
                    </div>
                    
                    <div className="pricing-plans">
                        <div className="plans-grid">
                            {Object.entries(PRICING_PLANS).map(([planType, plan]) => (
                                <div key={planType} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                                    {plan.popular && <div className="popular-badge">Best Value</div>}
                                    
                                    <div className="plan-header">
                                        <h3>{plan.name}</h3>
                                        <div className="plan-price">
                                            <span className="price">{formatKSH(plan.price)}</span>
                                            <span className="period">per {plan.period}</span>
                                        </div>
                                        {plan.savings && (
                                            <div className="savings">
                                                Save {formatKSH(plan.savings)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="plan-features">
                                        <h4>Everything in Free, plus:</h4>
                                        <ul>
                                            {FREEMIUM_LIMITS.premium.features.map((feature, index) => (
                                                <li key={index}>
                                                    <span className="feature-icon">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleUpgradePlan(planType)}
                                        className={`select-plan-btn ${plan.popular ? 'popular' : ''}`}
                                    >
                                        Upgrade to {plan.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="free-features">
                        <h4>Current Free Plan Includes:</h4>
                        <div className="free-features-grid">
                            {FREEMIUM_LIMITS.free.features.map((feature, index) => (
                                <div key={index} className="free-feature">
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="payment-methods">
                        <p> Secure payment via M-Pesa, Credit Card, or Airtel Money</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="topic-manager">
            <div className="topic-manager-header">
                <div className="header-main">
                    <h3>Add Learning Topic</h3>
                    <p className="topic-instruction">Study anything you want! Add any topic that interests you.</p>
                </div>
                <UsageMeter />
            </div>
            
            <div className="topic-input-section">
                <div className="form-group">
                    <label>Select Subject (Optional):</label>
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
                    <label>Or Enter Any Custom Topic:</label>
                    <input
                        type="text"
                        placeholder="e.g., Python list comprehensions, French Revolution causes, Marketing strategies, Personal finance..."
                        value={customTopic}
                        onChange={(e) => {
                            setCustomTopic(e.target.value);
                            setError('');
                            setSuccessMessage('');
                        }}
                        className="topic-input"
                    />
                    <small className="input-hint">
                        You can study literally anything! Business, programming, languages, hobbies, etc.
                    </small>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <button 
                    onClick={handleAddTopic} 
                    className={`add-topic-btn ${!canAddMoreTopics ? 'disabled' : ''}`}
                    disabled={!canAddMoreTopics}
                >
                    {canAddMoreTopics ? 'Add Learning Topic' : 'Topic Limit Reached - Upgrade to Add More'}
                </button>
            </div>

            <div className="topic-examples">
                <h4> Topic Ideas:</h4>
                <div className="example-tags">
                    <span className="example-tag">Digital Marketing Strategies</span>
                    <span className="example-tag">Python for Data Analysis</span>
                    <span className="example-tag">Personal Finance Management</span>
                    <span className="example-tag">Spanish Language Basics</span>
                    <span className="example-tag">Startup Business Planning</span>
                    <span className="example-tag">Machine Learning Projects</span>
                </div>
            </div>

            {showUpgradeModal && <UpgradeModal />}
        </div>
    );
}

export default TopicManager;