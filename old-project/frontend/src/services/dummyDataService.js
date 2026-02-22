/**
 * Dummy Data Service
 * Provides all data for the platform without Firebase dependency
 */

import { APPLICATION_STATUS, USER_ROLES } from '../types'

// Generate unique IDs
let projectIdCounter = 1
let applicationIdCounter = 1
let reportIdCounter = 1

const generateId = (prefix) => {
  if (prefix === 'project') return `proj_${projectIdCounter++}`
  if (prefix === 'application') return `app_${applicationIdCounter++}`
  if (prefix === 'report') return `report_${reportIdCounter++}`
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Dummy Users
const dummyUsers = {
  student1: {
    uid: 'student1',
    email: 'student@example.com',
    role: USER_ROLES.STUDENT,
    firstName: 'John',
    lastName: 'Student',
    displayName: 'John Student',
  },
  student2: {
    uid: 'student2',
    email: 'student2@example.com',
    role: USER_ROLES.STUDENT,
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
  },
  professor1: {
    uid: 'professor1',
    email: 'professor@example.com',
    role: USER_ROLES.PROFESSOR,
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    displayName: 'Dr. Michael Chen',
  },
  professor_fatma: {
    uid: 'professor_fatma',
    email: 'fatma.elshahaby@example.com',
    role: USER_ROLES.PROFESSOR,
    firstName: 'Dr. Fatma',
    lastName: 'Elshahaby',
    displayName: 'Dr. Fatma Elshahaby',
  },
  professor_amani: {
    uid: 'professor_amani',
    email: 'amani.eissa@example.com',
    role: USER_ROLES.PROFESSOR,
    firstName: 'Dr. Amani',
    lastName: 'Eissa',
    displayName: 'Dr. Amani Eissa',
  },
  professor_yousseri: {
    uid: 'professor_yousseri',
    email: 'yousseri@example.com',
    role: USER_ROLES.PROFESSOR,
    firstName: 'Dr.',
    lastName: 'Yousseri',
    displayName: 'Dr. Yousseri',
  },
  professor_mohamed: {
    uid: 'professor_mohamed',
    email: 'mohamed.ismail@example.com',
    role: USER_ROLES.PROFESSOR,
    firstName: 'Dr. Mohamed',
    lastName: 'Ismail',
    displayName: 'Dr. Mohamed Ismail',
  },
  ta1: {
    uid: 'ta1',
    email: 'ta@example.com',
    role: USER_ROLES.TEACHING_ASSISTANT,
    firstName: 'Emily',
    lastName: 'Rodriguez',
    displayName: 'Emily Rodriguez',
  },
  org1: {
    uid: 'org1',
    email: 'org@example.com',
    role: USER_ROLES.ORGANIZATION,
    firstName: 'Tech',
    lastName: 'Corp',
    displayName: 'Tech Corp',
  },
}

// Dummy Projects (Professor/TA projects)
const dummyProjects = [
  {
    id: 'proj_1',
    title: 'Machine Learning for Climate Prediction',
    description: 'We are looking for motivated students to join our research team working on developing advanced machine learning models for climate prediction. This project involves working with large datasets, implementing neural networks, and analyzing climate patterns. Students will gain hands-on experience with Python, TensorFlow, and data analysis tools.',
    createdBy: 'professor1',
    published: true,
    positions: 3,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Statistics'],
    timeline: '6 months, starting immediately',
    cvLink: 'https://drive.google.com/file/d/example1',
    proposalLink: 'https://drive.google.com/file/d/example2',
    datasetLink: 'https://drive.google.com/file/d/example3',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    type: 'project',
  },
  {
    id: 'proj_2',
    title: 'Blockchain-Based Supply Chain Management',
    description: 'Research project focusing on implementing blockchain technology to improve transparency and efficiency in supply chain management. The project involves developing smart contracts, creating a decentralized application, and testing it with real-world scenarios. Ideal for students interested in blockchain, cryptography, and distributed systems.',
    createdBy: 'professor1',
    published: true,
    positions: 2,
    skills: ['Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'JavaScript'],
    timeline: '8 months',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    type: 'project',
  },
  {
    id: 'proj_3',
    title: 'Computer Vision for Medical Imaging',
    description: 'Join our team to develop computer vision algorithms for analyzing medical images. This project focuses on using deep learning to detect anomalies in X-rays, MRIs, and CT scans. Students will work with medical datasets and collaborate with healthcare professionals.',
    createdBy: 'ta1',
    published: true,
    positions: 4,
    skills: ['Computer Vision', 'Deep Learning', 'PyTorch', 'Image Processing', 'Medical Imaging'],
    timeline: '12 months',
    cvLink: 'https://drive.google.com/file/d/example4',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    type: 'project',
  },
  {
    id: 'proj_4',
    title: 'Natural Language Processing for Sentiment Analysis',
    description: 'Research project on developing advanced NLP models for sentiment analysis of social media content. The project involves preprocessing text data, training transformer models, and evaluating their performance on various datasets.',
    createdBy: 'professor1',
    published: false,
    positions: 2,
    skills: ['NLP', 'Python', 'Transformers', 'BERT', 'Text Processing'],
    timeline: '6 months',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    type: 'project',
  },
  {
    id: 'proj_5',
    title: 'IoT Security and Privacy',
    description: 'Investigating security vulnerabilities in IoT devices and developing privacy-preserving solutions. This project involves penetration testing, developing secure protocols, and implementing encryption mechanisms for IoT networks.',
    createdBy: 'ta1',
    published: true,
    positions: 3,
    skills: ['Cybersecurity', 'IoT', 'Encryption', 'Network Security', 'C/C++'],
    timeline: '9 months',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: 'project',
  },
]

// Dummy Student Projects
const dummyStudentProjects = [
  {
    id: 'student_proj_1',
    title: 'Mobile App for Study Groups',
    description: 'Developing a mobile application to help students form and manage study groups. Features include scheduling, task sharing, and progress tracking.',
    createdBy: 'student1',
    published: true,
    positions: 2,
    skills: ['React Native', 'Firebase', 'JavaScript', 'Mobile Development'],
    timeline: '4 months',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    type: 'student_project',
  },
]

// Dummy Organization Opportunities
const dummyOpportunities = [
  {
    id: 'opp_1',
    title: 'Summer Internship Program 2024',
    description: 'Join our summer internship program and work on real-world projects. We offer hands-on experience in software development, data science, and product management. This is a paid internship opportunity with potential for full-time conversion.',
    organizationId: 'org1',
    published: true,
    type: 'course',
    positions: 10,
    skills: ['Software Development', 'Teamwork', 'Problem Solving'],
    timeline: '3 months, June - August 2024',
    materialLink: 'https://drive.google.com/file/d/example5',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'opp_2',
    title: 'Data Science Workshop Series',
    description: 'Comprehensive workshop series covering data science fundamentals, machine learning, and data visualization. Perfect for students looking to enhance their data science skills.',
    organizationId: 'org1',
    published: true,
    type: 'workshop',
    positions: 20,
    skills: ['Python', 'Data Science', 'Machine Learning', 'Statistics'],
    timeline: '6 weeks, starting next month',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'opp_3',
    title: 'Hackathon Competition 2024',
    description: 'Annual hackathon competition with prizes worth $10,000. Teams will work on solving real-world problems using technology. Open to all students.',
    organizationId: 'org1',
    published: true,
    type: 'competition',
    positions: 50,
    skills: ['Programming', 'Problem Solving', 'Teamwork', 'Innovation'],
    timeline: '48 hours, weekend event',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
]

// Dummy Applications
const dummyApplications = [
  {
    id: 'app_1',
    opportunityId: 'proj_1',
    studentId: 'student1',
    studentName: 'John Student',
    projectTitle: 'Machine Learning for Climate Prediction',
    opportunityTitle: 'Machine Learning for Climate Prediction',
    description: 'I am very interested in this project as I have been studying machine learning for the past two years. I have completed several courses on deep learning and have worked on projects involving neural networks. I am particularly excited about applying ML to climate science.',
    driveLinks: ['https://drive.google.com/file/d/cv1', 'https://drive.google.com/file/d/proposal1'],
    status: APPLICATION_STATUS.ACCEPTED,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'app_2',
    opportunityId: 'proj_1',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    projectTitle: 'Machine Learning for Climate Prediction',
    opportunityTitle: 'Machine Learning for Climate Prediction',
    description: 'I have a strong background in data science and statistics. I am currently working on my thesis related to climate data analysis and believe this project would be a perfect fit for my research interests.',
    driveLinks: ['https://drive.google.com/file/d/cv2'],
    status: APPLICATION_STATUS.PENDING,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'app_3',
    opportunityId: 'proj_3',
    studentId: 'student1',
    studentName: 'John Student',
    projectTitle: 'Computer Vision for Medical Imaging',
    opportunityTitle: 'Computer Vision for Medical Imaging',
    description: 'I am passionate about using technology to improve healthcare. I have experience with image processing and would love to contribute to this project.',
    driveLinks: [],
    status: APPLICATION_STATUS.WAITLISTED,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'app_4',
    opportunityId: 'proj_2',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    projectTitle: 'Blockchain-Based Supply Chain Management',
    opportunityTitle: 'Blockchain-Based Supply Chain Management',
    description: 'I have been learning about blockchain technology and have completed a course on smart contracts. This project aligns perfectly with my interests.',
    driveLinks: ['https://drive.google.com/file/d/cv3', 'https://drive.google.com/file/d/proposal2'],
    status: APPLICATION_STATUS.REJECTED,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'app_5',
    opportunityId: 'opp_1',
    studentId: 'student1',
    studentName: 'John Student',
    projectTitle: 'Summer Internship Program 2024',
    opportunityTitle: 'Summer Internship Program 2024',
    description: 'I am excited about the opportunity to gain real-world experience through this internship program.',
    driveLinks: ['https://drive.google.com/file/d/cv4'],
    status: APPLICATION_STATUS.PENDING,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
]

// Dummy Weekly Reports
const dummyReports = [
  // Reports sent to Dr. Fatma Elshahaby
  {
    id: 'report_1',
    studentId: 'student1',
    studentName: 'John Student',
    recipientId: 'professor_fatma',
    recipientName: 'Dr. Fatma Elshahaby',
    recipientType: 'professor',
    professorId: 'professor_fatma',
    taId: null,
    week: 15,
    year: 2024,
    accomplishments: 'Completed data preprocessing pipeline. Implemented initial neural network architecture. Analyzed climate dataset patterns. Successfully processed 10,000+ data points.',
    challenges: 'Faced issues with data normalization. Large dataset size causing memory constraints. Need to optimize data loading process.',
    nextGoals: 'Optimize memory usage. Train initial model. Evaluate baseline performance. Implement cross-validation.',
    supportNeeded: 'Need guidance on handling large datasets efficiently. Would appreciate a meeting to discuss optimization strategies.',
    driveLink: 'https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456/view',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'report_2',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    recipientId: 'professor_fatma',
    recipientName: 'Dr. Fatma Elshahaby',
    recipientType: 'professor',
    professorId: 'professor_fatma',
    taId: null,
    week: 15,
    year: 2024,
    accomplishments: 'Finished literature review on machine learning applications. Completed initial data collection. Set up project repository and documentation.',
    challenges: 'Finding relevant research papers. Understanding some advanced ML concepts.',
    nextGoals: 'Begin data preprocessing. Start implementing baseline models. Schedule weekly progress meetings.',
    supportNeeded: 'Would like recommendations for additional reading materials.',
    driveLink: 'https://drive.google.com/file/d/2bCdEfGhIjKlMnOpQrStUvWxYzA234567/view',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Reports sent to Dr. Amani Eissa
  {
    id: 'report_3',
    studentId: 'student1',
    studentName: 'John Student',
    recipientId: 'professor_amani',
    recipientName: 'Dr. Amani Eissa',
    recipientType: 'professor',
    professorId: 'professor_amani',
    taId: null,
    week: 14,
    year: 2024,
    accomplishments: 'Set up development environment. Reviewed relevant research papers. Created project timeline. Completed initial project proposal.',
    challenges: 'Understanding complex algorithms. Time management with other coursework.',
    nextGoals: 'Start data preprocessing. Design model architecture. Begin coding implementation.',
    supportNeeded: 'None at the moment, but will reach out if needed.',
    driveLink: 'https://drive.google.com/file/d/3cDeFgHiJkLmNoPqRsTuVwXyZ345678/view',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'report_4',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    recipientId: 'professor_amani',
    recipientName: 'Dr. Amani Eissa',
    recipientType: 'professor',
    professorId: 'professor_amani',
    taId: null,
    week: 13,
    year: 2024,
    accomplishments: 'Completed comprehensive data analysis. Implemented feature engineering pipeline. Created visualization dashboards for data exploration.',
    challenges: 'Dealing with missing data. Feature selection complexity.',
    nextGoals: 'Implement machine learning models. Perform model evaluation. Write documentation.',
    supportNeeded: 'Need advice on feature selection techniques.',
    driveLink: 'https://drive.google.com/file/d/4dEfGhIjKlMnOpQrStUvWxYzA456789/view',
    submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  // Reports sent to Dr. Yousseri
  {
    id: 'report_5',
    studentId: 'student1',
    studentName: 'John Student',
    recipientId: 'professor_yousseri',
    recipientName: 'Dr. Yousseri',
    recipientType: 'professor',
    professorId: 'professor_yousseri',
    taId: null,
    week: 16,
    year: 2024,
    accomplishments: 'Successfully trained initial model with 85% accuracy. Implemented data augmentation techniques. Created model evaluation metrics.',
    challenges: 'Model overfitting issues. Need to improve generalization.',
    nextGoals: 'Implement regularization techniques. Fine-tune hyperparameters. Test on validation set.',
    supportNeeded: 'Would appreciate feedback on current model architecture.',
    driveLink: 'https://drive.google.com/file/d/5eFgHiJkLmNoPqRsTuVwXyZ567890/view',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Reports sent to Dr. Mohamed Ismail
  {
    id: 'report_6',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    recipientId: 'professor_mohamed',
    recipientName: 'Dr. Mohamed Ismail',
    recipientType: 'professor',
    professorId: 'professor_mohamed',
    taId: null,
    week: 15,
    year: 2024,
    accomplishments: 'Completed system architecture design. Implemented core functionality. Wrote unit tests for critical components.',
    challenges: 'Integration issues between modules. Performance optimization needed.',
    nextGoals: 'Complete integration testing. Optimize performance bottlenecks. Prepare for deployment.',
    supportNeeded: 'Need guidance on deployment strategies.',
    driveLink: 'https://drive.google.com/file/d/6fGhIjKlMnOpQrStUvWxYzA678901/view',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'report_7',
    studentId: 'student1',
    studentName: 'John Student',
    recipientId: 'professor_mohamed',
    recipientName: 'Dr. Mohamed Ismail',
    recipientType: 'professor',
    professorId: 'professor_mohamed',
    taId: null,
    week: 14,
    year: 2024,
    accomplishments: 'Finished research on related work. Completed initial prototype. Documented findings and methodology.',
    challenges: 'Limited access to certain datasets. Understanding domain-specific requirements.',
    nextGoals: 'Expand dataset access. Refine prototype based on feedback. Continue literature review.',
    supportNeeded: 'Help with accessing restricted datasets would be appreciated.',
    driveLink: 'https://drive.google.com/file/d/7gHiJkLmNoPqRsTuVwXyZ789012/view',
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  // Reports sent to TA
  {
    id: 'report_8',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    recipientId: 'ta1',
    recipientName: 'Emily Rodriguez',
    recipientType: 'ta',
    professorId: null,
    taId: 'ta1',
    week: 15,
    year: 2024,
    accomplishments: 'Completed code refactoring. Improved code documentation. Fixed several bugs identified in testing phase.',
    challenges: 'Understanding some complex algorithms. Debugging time-consuming issues.',
    nextGoals: 'Continue bug fixes. Improve test coverage. Prepare code review materials.',
    supportNeeded: 'Would like code review feedback when ready.',
    driveLink: 'https://drive.google.com/file/d/8hIjKlMnOpQrStUvWxYzA890123/view',
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  // Additional reports for variety
  {
    id: 'report_9',
    studentId: 'student1',
    studentName: 'John Student',
    recipientId: 'professor_fatma',
    recipientName: 'Dr. Fatma Elshahaby',
    recipientType: 'professor',
    professorId: 'professor_fatma',
    taId: null,
    week: 13,
    year: 2024,
    accomplishments: 'Completed initial research phase. Identified key research questions. Prepared research proposal outline.',
    challenges: 'Narrowing down research scope. Finding relevant datasets.',
    nextGoals: 'Finalize research proposal. Begin data collection. Start literature review.',
    supportNeeded: 'Feedback on research proposal would be helpful.',
    driveLink: 'https://drive.google.com/file/d/9iJkLmNoPqRsTuVwXyZ901234/view',
    submittedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'report_10',
    studentId: 'student2',
    studentName: 'Sarah Johnson',
    recipientId: 'professor_yousseri',
    recipientName: 'Dr. Yousseri',
    recipientType: 'professor',
    professorId: 'professor_yousseri',
    taId: null,
    week: 12,
    year: 2024,
    accomplishments: 'Set up project infrastructure. Configured development tools. Created initial project structure.',
    challenges: 'Learning new frameworks. Setting up development environment.',
    nextGoals: 'Begin core development. Start implementing main features. Create initial documentation.',
    supportNeeded: 'None currently.',
    driveLink: 'https://drive.google.com/file/d/0jKlMnOpQrStUvWxYzA012345/view',
    submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
]

class DummyDataService {
  constructor() {
    // Store data in memory (simulating database)
    this.projects = [...dummyProjects]
    this.studentProjects = [...dummyStudentProjects]
    this.opportunities = [...dummyOpportunities]
    this.applications = [...dummyApplications]
    this.reports = [...dummyReports]
    this.users = { ...dummyUsers }
  }

  // User methods
  getUser(uid) {
    return this.users[uid] || null
  }

  createUser(uid, userData) {
    this.users[uid] = { uid, ...userData }
    return this.users[uid]
  }

  // Project methods
  getProjects(filters = {}) {
    let projects = [...this.projects]
    
    if (filters.createdBy) {
      // Check if user exists in dummy users, if not, show role-appropriate data
      const user = this.users[filters.createdBy]
      if (user) {
        projects = projects.filter(p => p.createdBy === filters.createdBy)
      } else {
        // For new users, show projects based on their role from localStorage
        // For demo purposes, if it's a professor/TA, show some projects
        const userRole = this.getUserRoleFromStorage(filters.createdBy)
        if (userRole === 'professor' || userRole === 'ta') {
          // Show a subset of projects as if they created them
          projects = projects.slice(0, 2).map(p => ({ ...p, createdBy: filters.createdBy }))
        } else {
          projects = []
        }
      }
    }
    
    if (filters.published !== undefined) {
      projects = projects.filter(p => p.published === filters.published)
    }
    
    // Sort by createdAt descending
    projects.sort((a, b) => b.createdAt - a.createdAt)
    
    if (filters.limit) {
      projects = projects.slice(0, filters.limit)
    }
    
    return projects
  }

  getUserRoleFromStorage(uid) {
    try {
      const storedUser = localStorage.getItem('dummyAuth_user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.uid === uid) {
          return localStorage.getItem('dummyAuth_role')
        }
      }
    } catch (e) {
      // Ignore
    }
    return null
  }

  getProject(id) {
    return this.projects.find(p => p.id === id) || null
  }

  createProject(projectData) {
    const project = {
      id: generateId('project'),
      ...projectData,
      createdAt: new Date(),
      type: 'project',
    }
    this.projects.push(project)
    return project
  }

  // Student Project methods
  getStudentProjects(filters = {}) {
    let projects = [...this.studentProjects]
    
    if (filters.createdBy) {
      const user = this.users[filters.createdBy]
      if (user) {
        projects = projects.filter(p => p.createdBy === filters.createdBy)
      } else {
        // For new students, show empty or some sample projects
        projects = []
      }
    }
    
    if (filters.published !== undefined) {
      projects = projects.filter(p => p.published === filters.published)
    }
    
    projects.sort((a, b) => b.createdAt - a.createdAt)
    
    return projects
  }

  getStudentProject(id) {
    return this.studentProjects.find(p => p.id === id) || null
  }

  // Opportunity methods
  getOpportunities(filters = {}) {
    let opportunities = [...this.opportunities]
    
    if (filters.organizationId) {
      const user = this.users[filters.organizationId]
      if (user) {
        opportunities = opportunities.filter(o => o.organizationId === filters.organizationId)
      } else {
        // For new organizations, show some sample opportunities
        const userRole = this.getUserRoleFromStorage(filters.organizationId)
        if (userRole === 'organization_representative') {
          opportunities = opportunities.slice(0, 2).map(o => ({ ...o, organizationId: filters.organizationId }))
        } else {
          opportunities = []
        }
      }
    }
    
    if (filters.published !== undefined) {
      opportunities = opportunities.filter(o => o.published === filters.published)
    }
    
    opportunities.sort((a, b) => b.createdAt - a.createdAt)
    
    return opportunities
  }

  getOpportunity(id) {
    return this.opportunities.find(o => o.id === id) || null
  }

  createOpportunity(opportunityData) {
    const opportunity = {
      id: generateId('opportunity'),
      ...opportunityData,
      createdAt: new Date(),
    }
    this.opportunities.push(opportunity)
    return opportunity
  }

  // Application methods
  getApplications(filters = {}) {
    let applications = [...this.applications]
    
    if (filters.studentId) {
      // For demo: if user is a student, show some applications
      const user = this.users[filters.studentId]
      if (user) {
        applications = applications.filter(a => a.studentId === filters.studentId)
      } else {
        // For new student users, show some sample applications
        const userRole = this.getUserRoleFromStorage(filters.studentId)
        if (userRole === 'student') {
          // Show a couple of sample applications
          applications = applications.slice(0, 2).map(a => ({ ...a, studentId: filters.studentId }))
        } else {
          applications = []
        }
      }
    }
    
    if (filters.opportunityId) {
      applications = applications.filter(a => a.opportunityId === filters.opportunityId)
    }
    
    if (filters.status) {
      applications = applications.filter(a => a.status === filters.status)
    }
    
    if (filters.opportunityIds && Array.isArray(filters.opportunityIds)) {
      applications = applications.filter(a => filters.opportunityIds.includes(a.opportunityId))
    }
    
    // Sort by createdAt descending
    applications.sort((a, b) => b.createdAt - a.createdAt)
    
    return applications
  }

  createApplication(applicationData) {
    const application = {
      id: generateId('application'),
      ...applicationData,
      status: APPLICATION_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.applications.push(application)
    return application
  }

  updateApplication(id, updates) {
    const index = this.applications.findIndex(a => a.id === id)
    if (index !== -1) {
      this.applications[index] = {
        ...this.applications[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.applications[index]
    }
    return null
  }

  // Report methods
  getReports(filters = {}) {
    let reports = [...this.reports]
    
    if (filters.studentId) {
      const user = this.users[filters.studentId]
      if (user) {
        reports = reports.filter(r => r.studentId === filters.studentId)
      } else {
        // For new students, show empty or some sample reports
        const userRole = this.getUserRoleFromStorage(filters.studentId)
        if (userRole === 'student') {
          // Show a couple of sample reports
          reports = reports.slice(0, 2).map(r => ({ ...r, studentId: filters.studentId }))
        } else {
          reports = []
        }
      }
    }
    
    if (filters.projectId) {
      reports = reports.filter(r => r.projectId === filters.projectId)
    }
    
    if (filters.professorId) {
      reports = reports.filter(r => r.professorId === filters.professorId)
    }
    
    if (filters.taId) {
      reports = reports.filter(r => r.taId === filters.taId)
    }
    
    if (filters.recipientId) {
      // Get reports sent to a specific professor or TA
      reports = reports.filter(r => r.professorId === filters.recipientId || r.taId === filters.recipientId)
    }
    
    // Sort by submittedAt descending
    reports.sort((a, b) => {
      const dateA = a.submittedAt || new Date(0)
      const dateB = b.submittedAt || new Date(0)
      return dateB - dateA
    })
    
    return reports
  }

  createReport(reportData) {
    const report = {
      id: generateId('report'),
      ...reportData,
      submittedAt: new Date(),
    }
    this.reports.push(report)
    return report
  }

  // Get all published opportunities (projects + student projects + org opportunities)
  getAllPublishedOpportunities() {
    const publishedProjects = this.projects.filter(p => p.published)
    const publishedStudentProjects = this.studentProjects.filter(p => p.published)
    const publishedOpportunities = this.opportunities.filter(o => o.published)
    
    return [
      ...publishedProjects,
      ...publishedStudentProjects,
      ...publishedOpportunities,
    ].sort((a, b) => b.createdAt - a.createdAt)
  }

  // Get opportunity by ID (checks all collections)
  getOpportunityById(id) {
    const project = this.getProject(id)
    if (project) return { ...project, type: 'project' }
    
    const studentProject = this.getStudentProject(id)
    if (studentProject) return { ...studentProject, type: 'student_project' }
    
    const opportunity = this.getOpportunity(id)
    if (opportunity) return { ...opportunity, type: 'opportunity' }
    
    return null
  }

  // Get applications for opportunities created by a user
  getApplicationsForUserOpportunities(userId, userRole) {
    let opportunityIds = []
    
    if (userRole === USER_ROLES.PROFESSOR || userRole === USER_ROLES.TEACHING_ASSISTANT) {
      const userProjects = this.projects.filter(p => p.createdBy === userId)
      if (userProjects.length > 0) {
        opportunityIds = userProjects.map(p => p.id)
      } else {
        // For new professors/TAs, show applications for some existing projects
        opportunityIds = this.projects.slice(0, 2).map(p => p.id)
      }
    } else if (userRole === USER_ROLES.ORGANIZATION) {
      const userOpps = this.opportunities.filter(o => o.organizationId === userId)
      if (userOpps.length > 0) {
        opportunityIds = userOpps.map(o => o.id)
      } else {
        // For new organizations, show applications for some existing opportunities
        opportunityIds = this.opportunities.slice(0, 1).map(o => o.id)
      }
    }
    
    return this.getApplications({ opportunityIds })
  }

  // Get all professors and TAs for report submission
  getProfessorsAndTAs() {
    const professors = Object.values(this.users).filter(
      u => u.role === USER_ROLES.PROFESSOR
    )
    const tas = Object.values(this.users).filter(
      u => u.role === USER_ROLES.TEACHING_ASSISTANT
    )
    return [...professors, ...tas]
  }
}

// Export singleton instance
export const dummyDataService = new DummyDataService()

