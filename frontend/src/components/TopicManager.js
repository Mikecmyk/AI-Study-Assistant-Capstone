// TopicManager.js - FIXED FREEMIUM LOGIC
import React, { useState, useEffect } from 'react';
import './TopicManager.css';
import api from '../api';

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
        maxPersonalTopics: 3,
        maxStudySessions: 10,
        features: [
            "3 personal topics",
            "10 study sessions", 
            "Access to all admin topics",
            "Basic AI study plans",
            "Study tools access",
            "Progress tracking"
        ]
    },
    premium: {
        maxPersonalTopics: 999,
        maxStudySessions: 999,
        features: [
            "Unlimited personal topics",
            "Unlimited study sessions",
            "Access to all admin topics", 
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
        savings: 1499 * 12 - 14999
    }
};

function TopicManager({ onTopicAdded, isAdmin = false }) {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [specificTopic, setSpecificTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [userPersonalTopicCount, setUserPersonalTopicCount] = useState(0);
    const [userPlan, setUserPlan] = useState('free'); // Default to free
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

    const initializeUserPlan = () => {
        const userId = getCurrentUserId();
        const planKey = `userPlan_${userId}`;
        const savedPlan = localStorage.getItem(planKey);
        
        // If no plan exists, set to free and save it
        if (!savedPlan) {
            localStorage.setItem(planKey, 'free');
            return 'free';
        }
        
        return savedPlan;
    };

    useEffect(() => {
        if (!isAdmin) {
            // Initialize user plan (ensures new users start with free)
            const plan = initializeUserPlan();
            setUserPlan(plan);
            
            // Load user personal topics count
            const userId = getCurrentUserId();
            const storageKey = `userPersonalTopics_${userId}`;
            const storedTopics = localStorage.getItem(storageKey);
            const personalTopics = storedTopics ? JSON.parse(storedTopics) : [];
            setUserPersonalTopicCount(personalTopics.length);
            
            // Load study session count
            const studyHistoryKey = `studyHistory_${userId}`;
            const studyHistory = JSON.parse(localStorage.getItem(studyHistoryKey) || '[]');
            setStudySessionCount(studyHistory.length);
        }
    }, [isAdmin]);

    const canAddMorePersonalTopics = isAdmin || userPlan === 'premium' || userPersonalTopicCount < FREEMIUM_LIMITS.free.maxPersonalTopics;

    const handleAddTopic = async () => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            let topicName = '';
            let description = '';

            if (selectedSubject && specificTopic) {
                topicName = `${selectedSubject}: ${specificTopic}`;
                description = `Study topic for ${specificTopic} in ${selectedSubject}`;
            } else if (customTopic.trim()) {
                if (customTopic.length < 3) {
                    setError("Please enter a more specific topic (at least 3 characters)");
                    setLoading(false);
                    return;
                }
                
                topicName = customTopic.trim();
                description = `Custom study topic: ${customTopic}`;
                
                if (customTopic.includes(':') && customTopic.split(':').length === 2) {
                    const [detectedSubject, detectedTopic] = customTopic.split(':').map(s => s.trim());
                    if (detectedSubject && detectedTopic) {
                        topicName = `${detectedSubject}: ${detectedTopic}`;
                        description = `Study topic for ${detectedTopic} in ${detectedSubject}`;
                    }
                }
            } else {
                setError("Please select a topic or enter a custom one");
                setLoading(false);
                return;
            }

            // For admin, save to database via API (available to all users)
            if (isAdmin) {
                const topicData = {
                    name: topicName,
                    description: description,
                    is_active: true
                };

                const response = await api.post('/admin/topics/', topicData);
                
                setSuccessMessage(`Topic "${topicName}" added successfully to the system! All users can now access this topic.`);
                
                // Clear form
                setSelectedSubject('');
                setSpecificTopic('');
                setCustomTopic('');
                
                // Notify parent component to refresh topic list
                if (onTopicAdded) {
                    onTopicAdded(response.data);
                }
            } else {
                // For regular users, check freemium limits first
                if (!canAddMorePersonalTopics) {
                    setShowUpgradeModal(true);
                    setLoading(false);
                    return;
                }

                // Save personal topic to localStorage
                const userId = getCurrentUserId();
                const storageKey = `userPersonalTopics_${userId}`;
                
                const storedTopics = localStorage.getItem(storageKey);
                const existingTopics = storedTopics ? JSON.parse(storedTopics) : [];
                
                const topicExists = existingTopics.some(topic => topic.name === topicName);
                
                if (topicExists) {
                    setError("This topic already exists in your personal topics!");
                    setLoading(false);
                    return;
                }
                
                const topicObject = {
                    id: Date.now(),
                    name: topicName,
                    description: description,
                    isCustom: true,
                    isPersonal: true,
                    createdAt: new Date().toISOString()
                };
                
                const updatedTopics = [...existingTopics, topicObject];
                localStorage.setItem(storageKey, JSON.stringify(updatedTopics));
                setUserPersonalTopicCount(updatedTopics.length);
                
                setSuccessMessage(`Personal topic "${topicName}" added successfully! You can find it under "Select a topic" in your study session.`);
                
                setSelectedSubject('');
                setSpecificTopic('');
                setCustomTopic('');
                
                if (onTopicAdded) {
                    onTopicAdded(topicObject);
                }
            }
            
        } catch (err) {
            console.error('Error adding topic:', err);
            setError(isAdmin ? 
                "Failed to add topic to database. Please try again." : 
                "Failed to add topic. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradePlan = (planType) => {
        const plan = PRICING_PLANS[planType];
        
        // Simulate payment processing
        console.log(`Processing payment for ${plan.name}: KSH ${plan.price}`);
        
        // Update user plan to premium
        const userId = getCurrentUserId();
        const planKey = `userPlan_${userId}`;
        setUserPlan('premium');
        localStorage.setItem(planKey, 'premium');
        setShowUpgradeModal(false);
        
        alert(`Successfully upgraded to ${plan.name}! You can now add unlimited personal topics.`);
        
        // Clear any error messages
        setError('');
    };

    // Usage Meter Component for regular users
    const UsageMeter = () => (
        <div className="usage-meter">
            <div className="meter-header">
                <h4>Your Learning Limits</h4>
                <span className="plan-badge">{userPlan === 'premium' ? 'Premium' : 'Free'}</span>
            </div>
            
            <div className="meter-item">
                <div className="meter-label">
                    <span>Personal Topics</span>
                    <span>{userPersonalTopicCount}/{FREEMIUM_LIMITS[userPlan].maxPersonalTopics}</span>
                </div>
                <div className="meter-bar">
                    <div 
                        className="meter-fill topics-fill"
                        style={{ width: `${(userPersonalTopicCount / FREEMIUM_LIMITS[userPlan].maxPersonalTopics) * 100}%` }}
                    ></div>
                </div>
                {userPlan === 'free' && userPersonalTopicCount >= FREEMIUM_LIMITS.free.maxPersonalTopics && (
                    <div className="limit-reached">
                        Limit reached! Upgrade to add more topics.
                    </div>
                )}
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

    // Upgrade Modal Component
    const UpgradeModal = () => (
        <div className="modal-overlay">
            <div className="upgrade-modal">
                <div className="modal-header">
                    <h2>Upgrade to Premium</h2>
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
                            {userPersonalTopicCount >= FREEMIUM_LIMITS.free.maxPersonalTopics 
                                ? "You've reached your free personal topic limit (3 topics). Upgrade to add unlimited custom topics!" 
                                : "Upgrade now to get unlimited personal topics and advanced features!"}
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
                                            <span className="price">KSH {plan.price.toLocaleString()}</span>
                                            <span className="period">per {plan.period}</span>
                                        </div>
                                        {plan.savings && (
                                            <div className="savings">
                                                Save KSH {plan.savings.toLocaleString()}
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
                        <p>Secure payment via M-Pesa, Credit Card, or Airtel Money</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Simplified Admin Interface
    if (isAdmin) {
        return (
            <div className="topic-manager-admin">
                <div className="admin-topic-form">
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
                            placeholder="e.g., Advanced Python Programming, Digital Marketing Strategies..."
                            value={customTopic}
                            onChange={(e) => {
                                setCustomTopic(e.target.value);
                                setError('');
                                setSuccessMessage('');
                            }}
                            className="topic-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    <button 
                        onClick={handleAddTopic} 
                        disabled={loading}
                        className="add-topic-btn-admin"
                    >
                        {loading ? 'Adding Topic...' : 'Add Topic to System'}
                    </button>
                </div>
            </div>
        );
    }

    // Regular user interface with freemium features
    return (
        <div className="topic-manager">
            <div className="topic-manager-header">
                <div className="header-main">
                    <h3>Add Learning Topic</h3>
                    <p className="topic-instruction">Add personal topics or use admin-created topics available to everyone</p>
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
                    <label>Or Enter Any Custom Topic (Personal):</label>
                    <input
                        type="text"
                        placeholder="e.g., Python list comprehensions, French Revolution causes, Marketing strategies..."
                        value={customTopic}
                        onChange={(e) => {
                            setCustomTopic(e.target.value);
                            setError('');
                            setSuccessMessage('');
                        }}
                        className="topic-input"
                    />
                    <small className="input-hint">
                        Personal topics are only visible to you. Free users can add up to {FREEMIUM_LIMITS.free.maxPersonalTopics} personal topics.
                        {userPersonalTopicCount >= FREEMIUM_LIMITS.free.maxPersonalTopics && (
                            <strong style={{color: '#e74c3c'}}> You've reached your free limit!</strong>
                        )}
                    </small>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <button 
                    onClick={handleAddTopic} 
                    disabled={loading || !canAddMorePersonalTopics}
                    className={`add-topic-btn ${!canAddMorePersonalTopics ? 'disabled' : ''}`}
                >
                    {loading ? 'Adding Topic...' : 
                     !canAddMorePersonalTopics ? 'Personal Topic Limit Reached - Upgrade to Add More' : 
                     'Add Personal Topic'}
                </button>
            </div>

            {showUpgradeModal && <UpgradeModal />}
        </div>
    );
}

export default TopicManager;