import React from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleStartTrial = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Safe scroll function with null checks
  const safeScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Social media handlers
  const handleFacebook = () => {
    window.open('https://facebook.com', '_blank');
  };

  const handleTwitter = () => {
    window.open('https://twitter.com', '_blank');
  };

  const handleInstagram = () => {
    window.open('https://instagram.com', '_blank');
  };

  const handleLinkedIn = () => {
    window.open('https://linkedin.com', '_blank');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <nav className="navbar">
            <div className="logo">
              <i className="fas fa-graduation-cap"></i>
              Zonlus
            </div>
            <ul className="nav-links">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-link-btn">Home</button></li>
              <li><button onClick={() => safeScrollTo('features')} className="nav-link-btn">Features</button></li>
              <li><button onClick={() => safeScrollTo('stats')} className="nav-link-btn">How It Works</button></li>
              <li><button onClick={handleGetStarted} className="nav-link-btn">Get Started</button></li>
            </ul>
            <button onClick={handleGetStarted} className="cta-button">Get Started</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Your AI Exam Partner</h1>
            <h2>Smarter Study, Faster Success!</h2>
            <p>We help students study better, not harder. That's why they keep coming back.</p>
            <div className="hero-buttons">
              <button onClick={handleStartTrial} className="btn-primary">Start Free Trial</button>
              <button onClick={handleLearnMore} className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Zonlus?</h2>
            <p>Our platform isn't about more content – it's about the right content at the right time.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>AI-Powered Learning</h3>
              <p>Our advanced AI adapts to your learning style and pace, creating personalized study plans.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>Personalized For You</h3>
              <p>Every student is different. We create customized learning paths based on your strengths.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Track Your Progress</h3>
              <p>Monitor your improvement with detailed analytics and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats">
        <div className="container">
          <div className="stats-content">
            <h2>Trusted by Students Worldwide</h2>
            <p>Join thousands of students who have improved their grades with Zonlus</p>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">36+</div>
                <div className="stat-label">Countries</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">94%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Add this section) */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-title">
            <h2>What Students Say</h2>
            <p>Hear from students who have transformed their study habits with Zonlus</p>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">"Zonlus helped me improve my grades by two letter grades in just one semester. The personalized study plans made all the difference!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">SJ</div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Medical Student</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"I was struggling with time management until I found Zonlus. The AI creates the perfect study schedule that adapts to my busy life."</p>
              <div className="testimonial-author">
                <div className="author-avatar">MR</div>
                <div className="author-info">
                  <h4>Michael Rodriguez</h4>
                  <p>Engineering Student</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"The progress tracking feature showed me exactly where I needed to focus. I went from barely passing to top of my class!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">EC</div>
                <div className="author-info">
                  <h4>Emily Chen</h4>
                  <p>Law Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Study Smarter?</h2>
            <p>Join thousands of students achieving academic success with Zonlus. Start your free trial today!</p>
            <button onClick={handleStartTrial} className="btn-primary">Get Started For Free</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Zonlus</h3>
              <p>Your AI Exam Partner for smarter studying and faster success. We help students study better, not harder.</p>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="footer-link-btn">Home</button></li>
                <li><button onClick={() => safeScrollTo('features')} className="footer-link-btn">Features</button></li>
                <li><button onClick={() => safeScrollTo('stats')} className="footer-link-btn">How It Works</button></li>
                <li><button onClick={() => safeScrollTo('testimonials')} className="footer-link-btn">Testimonials</button></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><button className="footer-link-btn">Privacy Policy</button></li>
                <li><button className="footer-link-btn">Terms of Service</button></li>
                <li><button className="footer-link-btn">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="copyright">
            <p>&copy; 2023 Zonlus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;