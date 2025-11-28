Zonlus AI Study Assistant
Project Overview
Zonlus is an intelligent study assistant platform that uses artificial intelligence to provide personalized learning experiences. The platform helps students create structured study plans, generate educational content, and track learning progress through a web-based interface.
Key Features
Study Management
-AI-Powered Study Plans: Generate personalized study sessions
-Topic Management: Add and organize learning topics
-Study Tools: Create flashcards, quizzes, and summaries
-Progress Tracking: Monitor learning with analytics
User Management
-Role-Based Access: Separate admin and user interfaces
-Freemium Model: Free users get 3 personal topics, premium unlimited
-User Administration: Admin panel for platform management
Content Generation
-AI Tutor: Interactive assistant for questions
-Document Processing: Upload and summarize documents
-Study Session Generation: Create structured study plans
Technology Stack
Frontend
React.js - UI framework

CSS3 - Styling

JavaScript ES6+

Backend
Django REST Framework

Python

SQLite/PostgreSQL

User Guide
For Students
-Register/Login - New accounts start with free plan

-Add Topics - Free: 3 personal topics + system topics

-Study Sessions - Select topic and generate AI study plans

-Track Progress - View analytics and completion history

For Administrators
-Admin Dashboard - Platform analytics and management

-Topic Management - Add system-wide topics for all users

-User Management - Monitor users and modify roles

API Endpoints
Authentication
-POST /api/auth/login/

-POST /api/auth/register/

-POST /api/auth/logout/

Study Sessions
-GET /api/topics/ - Get topics

-POST /api/sessions/ - Create study session

-GET /api/sessions/history/ - Study history

Admin
-GET /admin/topics/ - Manage topics

-GET /admin/users/ - User management

-GET /admin/analytics/ - Platform analytics

Freemium Model
Free Plan
-3 personal topics

-10 study sessions monthly

-Access to system topics

-Basic AI features

Premium Plan
-Unlimited personal topics

-Unlimited study sessions

-Advanced AI features

-Export capabilities

-Priority support

Local Storage
-userPersonalTopics_[userId] - Personal topics

-studyHistory_[userId] - Session history

-userPlan_[userId] - Subscription plan

-calendarTasks_[userId] - Scheduled tasks

Development
Adding Features
-Create React components

-Update Django API endpoints

-Test across user roles

-Update documentation

Future Enhancements
-Mobile application

-Advanced AI features

-Social learning features

-Enhanced analytics

-External platform integration

