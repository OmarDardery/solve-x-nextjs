# Adding Dummy Data Guide

This guide explains how to add dummy data to demonstrate the full functionality of the SolveX platform.

## Method 1: Using Browser Console (Recommended)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Sign up as different users with different roles:**
   - Create at least one Professor account
   - Create at least one TA (Teaching Assistant) account
   - Create at least one Student account
   - Create at least one Organization account

3. **Open browser console** (F12 or Cmd+Option+I) and run:

   ```javascript
   // First, import the function (you may need to adjust the path)
   import { addDummyData, getUserIdByEmail } from './src/utils/addDummyData.js'
   
   // Get user IDs by email
   const professorId = await getUserIdByEmail('professor@example.com')
   const taId = await getUserIdByEmail('ta@example.com')
   const orgId = await getUserIdByEmail('org@example.com')
   
   // Update the dummy data script with actual IDs, then run:
   await addDummyData()
   ```

## Method 2: Manual Addition via UI

1. **As a Professor or TA:**
   - Log in to your account
   - Go to your dashboard
   - Click "Create Project" or "Create Opportunity"
   - Fill out the form with:
     - Title: e.g., "Machine Learning Research Project"
     - Description: Detailed description of the opportunity
     - Skills: Comma-separated list (e.g., "Python, Machine Learning, Data Analysis")
     - Timeline: e.g., "6 months, Starting Spring 2024"
     - Positions: Number of available positions
     - Check "Publish immediately" to make it visible to students
   - Submit the form

2. **As an Organization:**
   - Log in to your organization account
   - Go to your dashboard
   - Click "Create Opportunity"
   - Fill out the form with similar details
   - Publish the opportunity

3. **As a Student:**
   - Log in to your student account
   - Browse opportunities from the dashboard or the Opportunities page
   - Click on an opportunity to view details
   - Click "Apply Now" to submit an application
   - Fill out the application form and submit

## Sample Data Examples

### Research Projects (Professor/TA)

**Title:** Machine Learning for Climate Prediction
**Description:** Join our research team to develop advanced machine learning models for climate prediction. This project involves working with large datasets, implementing neural networks, and collaborating with climate scientists.
**Skills:** Python, Machine Learning, TensorFlow, Data Analysis, Statistics
**Timeline:** 6 months, Starting Spring 2024
**Positions:** 3

**Title:** Blockchain-Based Voting System
**Description:** Research and develop a secure, transparent voting system using blockchain technology. This project explores cryptographic protocols, smart contracts, and decentralized systems.
**Skills:** Blockchain, Solidity, JavaScript, Cryptography, Web3
**Timeline:** 4 months, Starting Fall 2024
**Positions:** 2

### Organization Opportunities

**Title:** Summer Internship Program 2024
**Type:** Training
**Description:** Join our prestigious summer internship program! Work on real-world projects, learn from industry experts, and build your professional network.
**Skills:** Software Development, Teamwork, Problem Solving
**Timeline:** 3 months, June - August 2024
**Positions:** 20

**Title:** Data Science Workshop Series
**Type:** Workshop
**Description:** Learn data science from scratch! This comprehensive workshop covers Python, pandas, matplotlib, machine learning basics, and data visualization.
**Skills:** Python, Data Science, Pandas, Matplotlib
**Timeline:** 6 weeks, Starting March 2024
**Positions:** 30

## Testing the Flow

1. **Professor/TA creates opportunity:**
   - Log in as Professor or TA
   - Create and publish a research opportunity
   - Verify it appears in your dashboard

2. **Student views opportunities:**
   - Log in as Student
   - Go to Opportunities page or Dashboard
   - See the published opportunities

3. **Student applies:**
   - Click on an opportunity
   - View full details
   - Click "Apply Now"
   - Fill out application form
   - Submit application

4. **Professor/TA reviews applications:**
   - Log in as Professor or TA
   - Go to Applications page
   - See student applications
   - Update application status (Pending, Accepted, Waitlisted, Rejected)

5. **Student tracks applications:**
   - Log in as Student
   - Go to Applications page or Dashboard
   - See status of submitted applications

## Notes

- All data is stored in Firestore
- Published opportunities are visible to all students
- Draft opportunities are only visible to the creator
- Applications are linked to both the opportunity and the student
- Role-based access ensures users only see relevant data



