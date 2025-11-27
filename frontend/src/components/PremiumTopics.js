import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PremiumTopics.css';

const PremiumTopics = () => {
    const [premiumTopics, setPremiumTopics] = useState([]);
    const [userPlan, setUserPlan] = useState('free');
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const navigate = useNavigate();

    // Exchange rate (approximate)
    const USD_TO_KSH = 150;

    const premiumTopicCategories = [
        {
            id: 1,
            name: "Advanced Programming",
            icon: "",
            topics: [
                {
                    id: 101,
                    title: "Machine Learning with Python",
                    description: "Complete guide to ML algorithms, neural networks, and deep learning frameworks with real-world projects",
                    level: "Advanced",
                    duration: "12 hours",
                    features: ["Real-world projects", "Model deployment", "Advanced algorithms", "Python libraries"],
                    price: 29.99,
                    popularity: 95,
                    students: 1250
                },
                {
                    id: 102,
                    title: "Full-Stack Web Development",
                    description: "Master React, Node.js, databases and build complete web applications from scratch",
                    level: "Intermediate",
                    duration: "15 hours",
                    features: ["Project portfolio", "API development", "Database design", "Deployment"],
                    price: 24.99,
                    popularity: 88,
                    students: 890
                },
                {
                    id: 103,
                    title: "Data Structures & Algorithms Mastery",
                    description: "Advanced problem-solving techniques and technical interview preparation with 150+ problems",
                    level: "Advanced",
                    duration: "10 hours",
                    features: ["150+ problems", "Interview prep", "Optimization techniques", "Code reviews"],
                    price: 19.99,
                    popularity: 92,
                    students: 2100
                }
            ]
        },
        {
            id: 2,
            name: "Professional Skills",
            icon: "",
            topics: [
                {
                    id: 201,
                    title: "Financial Analysis & Modeling",
                    description: "Learn financial statements analysis, valuation models, and investment strategies with real data",
                    level: "Intermediate",
                    duration: "8 hours",
                    features: ["Excel modeling", "Case studies", "Real data analysis", "Investment strategies"],
                    price: 34.99,
                    popularity: 78,
                    students: 670
                },
                {
                    id: 202,
                    title: "Digital Marketing Strategy",
                    description: "Comprehensive digital marketing including SEO, social media, analytics and campaign planning",
                    level: "Beginner",
                    duration: "6 hours",
                    features: ["Campaign planning", "Analytics tools", "Strategy development", "Social media marketing"],
                    price: 22.99,
                    popularity: 85,
                    students: 1200
                },
                {
                    id: 203,
                    title: "Project Management Professional",
                    description: "PM methodologies, agile practices, and team leadership skills with certification prep",
                    level: "Intermediate",
                    duration: "10 hours",
                    features: ["Certification prep", "Real scenarios", "Team management", "Agile methodologies"],
                    price: 27.99,
                    popularity: 82,
                    students: 950
                }
            ]
        },
        {
            id: 3,
            name: "Advanced Sciences",
            icon: "",
            topics: [
                {
                    id: 301,
                    title: "Quantum Computing Fundamentals",
                    description: "Introduction to quantum mechanics, qubits, and quantum algorithms with simulation tools",
                    level: "Advanced",
                    duration: "7 hours",
                    features: ["Quantum circuits", "Algorithm design", "Simulation tools", "Quantum mechanics"],
                    price: 39.99,
                    popularity: 65,
                    students: 320
                },
                {
                    id: 302,
                    title: "Biotechnology & Genetics",
                    description: "Modern biotech techniques, genetic engineering, and medical applications with case studies",
                    level: "Intermediate",
                    duration: "9 hours",
                    features: ["Lab techniques", "Case studies", "Industry applications", "Genetic engineering"],
                    price: 31.99,
                    popularity: 72,
                    students: 480
                },
                {
                    id: 303,
                    title: "Renewable Energy Systems",
                    description: "Solar, wind, and hydro power systems design and implementation with sustainability planning",
                    level: "Intermediate",
                    duration: "8 hours",
                    features: ["System design", "Cost analysis", "Sustainability planning", "Energy storage"],
                    price: 26.99,
                    popularity: 75,
                    students: 560
                }
            ]
        }
    ];

    const subscriptionPlans = [
        {
            id: 'monthly',
            name: 'Monthly Premium',
            price: 9.99,
            period: 'month',
            popular: false,
            features: [
                'Unlimited custom topics',
                'Access to all premium topics',
                'Advanced AI explanations',
                'Priority support',
                'Export unlimited content',
                'Detailed analytics'
            ]
        },
        {
            id: 'yearly',
            name: 'Yearly Premium',
            price: 99.99,
            period: 'year',
            popular: true,
            features: [
                'Everything in Monthly plan',
                'Save 17% with yearly billing',
                'Early access to new features',
                'Custom study plans',
                'Advanced analytics dashboard',
                'Dedicated support'
            ]
        }
    ];

    useEffect(() => {
        // Load user plan from localStorage or API
        const savedPlan = localStorage.getItem('userPlan') || 'free';
        setUserPlan(savedPlan);
        
        // Load purchased topics
        const savedPurchases = JSON.parse(localStorage.getItem('purchasedTopics') || '[]');
        setPremiumTopics(savedPurchases);
    }, []);

    const convertToKSH = (usdPrice) => {
        return Math.round(usdPrice * USD_TO_KSH);
    };

    const formatKSH = (amount) => {
        return `KSH ${amount.toLocaleString()}`;
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handlePurchaseTopic = (topic) => {
        if (userPlan === 'free') {
            setSelectedTopic(topic);
            setShowPurchaseModal(true);
        } else {
            // Add topic to user's premium topics
            const updatedTopics = [...premiumTopics, { ...topic, purchasedAt: new Date().toISOString() }];
            setPremiumTopics(updatedTopics);
            localStorage.setItem('purchasedTopics', JSON.stringify(updatedTopics));
            alert(`Successfully added "${topic.title}" to your premium topics!`);
        }
    };

    const handleUpgradePlan = (planId) => {
        const plan = subscriptionPlans.find(p => p.id === planId);
        if (plan) {
            // In a real app, this would integrate with a payment processor
            console.log(`Processing payment for ${plan.name}: ${formatKSH(convertToKSH(plan.price))}`);
            
            // Simulate successful payment
            setUserPlan('premium');
            localStorage.setItem('userPlan', 'premium');
            setShowPurchaseModal(false);
            
            if (selectedTopic) {
                const updatedTopics = [...premiumTopics, { ...selectedTopic, purchasedAt: new Date().toISOString() }];
                setPremiumTopics(updatedTopics);
                localStorage.setItem('purchasedTopics', JSON.stringify(updatedTopics));
            }
            
            alert(`Successfully upgraded to ${plan.name}! You now have access to all premium features.`);
        }
    };

    const PremiumTopicCard = ({ topic, onPurchase }) => (
        <div className="premium-topic-card">
            <div className="card-header">
                <div className="premium-badge">Premium</div>
                <div className="popularity-badge">
                    <span className="popularity-icon"></span>
                    {topic.popularity}% Popular
                </div>
            </div>
            
            <div className="topic-content">
                <h3 className="topic-title">{topic.title}</h3>
                <p className="topic-description">{topic.description}</p>
                
                <div className="topic-meta">
                    <div className="meta-item">
                        <span className="meta-label">Level:</span>
                        <span className="meta-value level-badge">{topic.level}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Duration:</span>
                        <span className="meta-value">{topic.duration}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Students:</span>
                        <span className="meta-value">{topic.students.toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="topic-features">
                    <h4>What's Included:</h4>
                    <ul>
                        {topic.features.map((feature, index) => (
                            <li key={index}>
                                <span className="feature-check">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="topic-pricing">
                    <div className="price-section">
                        <div className="original-price">{formatKSH(convertToKSH(topic.price))}</div>
                        <div className="price-note">One-time payment</div>
                    </div>
                    <button 
                        onClick={() => onPurchase(topic)}
                        className={`purchase-btn ${userPlan === 'premium' ? 'premium-user' : ''}`}
                    >
                        {userPlan === 'premium' ? 'Add to My Topics' : 'Purchase Now'}
                    </button>
                </div>
            </div>
        </div>
    );

    const SubscriptionPlanCard = ({ plan, onSelect }) => (
        <div className={`subscription-plan-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                    <span className="price">{formatKSH(convertToKSH(plan.price))}</span>
                    <span className="period">per {plan.period}</span>
                </div>
                {plan.popular && (
                    <div className="savings-badge">
                        Save {formatKSH(convertToKSH(9.99 * 12 - plan.price))}
                    </div>
                )}
            </div>
            
            <div className="plan-features">
                <ul>
                    {plan.features.map((feature, index) => (
                        <li key={index}>
                            <span className="feature-icon">✓</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
            
            <button 
                onClick={() => onSelect(plan.id)}
                className={`select-plan-btn ${plan.popular ? 'popular' : ''}`}
            >
                Get Started
            </button>
        </div>
    );

    const allTopics = premiumTopicCategories.flatMap(category => category.topics);

    const filteredTopics = activeCategory === 'all' 
        ? allTopics 
        : premiumTopicCategories.find(cat => cat.id === parseInt(activeCategory))?.topics || [];

    return (
        <div className="premium-topics-container">
            {/* Back Button Header */}
            <div className="premium-topics-header">
                <button 
                    onClick={handleBackToDashboard}
                    className="back-to-dashboard-btn"
                >
                     Back to Dashboard
                </button>
            </div>

            <div className="premium-header">
                <div className="header-content">
                    <h1>Premium Learning Topics</h1>
                    <p>Access expert-curated topics and advanced learning materials designed for success</p>
                    
                    {userPlan === 'free' && (
                        <div className="upgrade-banner">
                            <div className="banner-content">
                                <div className="banner-text">
                                    <h3> Upgrade to Premium</h3>
                                    <p>Get unlimited topics and access to our premium content library with advanced features</p>
                                </div>
                                <button 
                                    onClick={() => setShowPurchaseModal(true)}
                                    className="upgrade-cta-btn"
                                >
                                    View Subscription Plans
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {userPlan === 'premium' && premiumTopics.length > 0 && (
                <div className="my-premium-topics">
                    <div className="section-header">
                        <h2>My Premium Topics</h2>
                        <p>Your purchased premium learning materials</p>
                    </div>
                    <div className="premium-topics-grid">
                        {premiumTopics.map(topic => (
                            <div key={topic.id} className="premium-topic-card owned">
                                <div className="premium-badge owned">Owned</div>
                                <h3>{topic.title}</h3>
                                <p>{topic.description}</p>
                                <div className="purchase-date">
                                    Purchased: {new Date(topic.purchasedAt).toLocaleDateString()}
                                </div>
                                <button className="study-btn">Start Studying</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="categories-navigation">
                <div className="categories-header">
                    <h2>Browse Premium Topics</h2>
                    <p>Choose from our carefully curated collection of advanced learning materials</p>
                </div>
                
                <div className="categories-filter">
                    <button 
                        className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All Topics
                    </button>
                    {premiumTopicCategories.map(category => (
                        <button
                            key={category.id}
                            className={`filter-btn ${activeCategory === category.id.toString() ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id.toString())}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="premium-categories">
                {premiumTopicCategories
                    .filter(category => activeCategory === 'all' || category.id === parseInt(activeCategory))
                    .map(category => (
                    <div key={category.id} className="category-section">
                        <div className="category-header">
                            <h2 className="category-title">
                                <span className="category-icon">{category.icon}</span>
                                {category.name}
                            </h2>
                            <p className="category-description">
                                Advanced topics in {category.name.toLowerCase()} for serious learners
                            </p>
                        </div>
                        <div className="premium-topics-grid">
                            {category.topics.map(topic => (
                                <PremiumTopicCard
                                    key={topic.id}
                                    topic={topic}
                                    onPurchase={handlePurchaseTopic}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showPurchaseModal && (
                <div className="modal-overlay">
                    <div className="purchase-modal">
                        <div className="modal-header">
                            <h2>Upgrade to Premium</h2>
                            <button 
                                onClick={() => setShowPurchaseModal(false)}
                                className="close-modal"
                            >
                                
                            </button>
                        </div>
                        
                        <div className="modal-content">
                            {selectedTopic && (
                                <div className="selected-topic-preview">
                                    <h3>Selected Topic: {selectedTopic.title}</h3>
                                    <p>{selectedTopic.description}</p>
                                    <div className="preview-price">
                                        <span className="price">{formatKSH(convertToKSH(selectedTopic.price))}</span>
                                        <span className="price-note">One-time purchase</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="subscription-options">
                                <h3>Choose Your Plan</h3>
                                <p className="options-subtitle">Get access to all premium topics and features</p>
                                <div className="plans-grid">
                                    {subscriptionPlans.map(plan => (
                                        <SubscriptionPlanCard
                                            key={plan.id}
                                            plan={plan}
                                            onSelect={handleUpgradePlan}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="free-features">
                                <h4>Free Plan Includes:</h4>
                                <div className="free-features-grid">
                                    <div className="free-feature">5 custom topics</div>
                                    <div className="free-feature">Basic AI study plans</div>
                                    <div className="free-feature">Study tools access</div>
                                    <div className="free-feature">Progress tracking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumTopics;