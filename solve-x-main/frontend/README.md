# SolveX - Premium Student Research & Opportunities Platform

A full-stack, luxury-grade web platform for managing student research, academic collaboration, skill development, and opportunities using React + Firebase.

## 🚀 Features

- **Role-Based Access Control**: Professor, Teaching Assistant, Student, and Organization Representative roles
- **Project Management**: Professors and TAs can create and manage research projects
- **Student Projects**: Students can publish their own project ideas
- **Applications System**: Comprehensive application tracking with status management
- **Organization Portal**: Student organizations can publish courses, workshops, and training programs
- **Weekly Reporting**: Students submit weekly progress reports for accepted projects
- **Unified Dashboard**: Centralized hub for all research opportunities
- **Luxury UI/UX**: Premium design with smooth animations and elegant components

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Styling**: TailwindCSS with custom theme (#0046ad)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v6

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solvex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - The Firebase configuration is already set up in `src/lib/firebase.js`
   - Make sure your Firebase project has the following enabled:
     - Authentication (Email/Password and Google)
     - Firestore Database
     - Storage (optional, only for metadata)

4. **Set up Firestore Security Rules**
   - Deploy the rules from `firestore.rules` to your Firebase project
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 User Roles

### Professor
- Create and manage research projects
- View and manage applications
- Track student progress through weekly reports

### Teaching Assistant (TA)
- Create and manage research projects
- View and manage applications
- Track student progress

### Student
- Browse and apply to research projects
- Create and publish own project ideas
- Submit weekly progress reports
- Track application status

### Organization Representative
- Publish courses, workshops, competitions, and training programs
- Manage applications to organization opportunities

## 📁 Project Structure

```
solvex/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   │   ├── forms/          # Form components
│   │   └── layout/         # Layout components (Navbar, Layout)
│   ├── context/            # React Context providers
│   ├── lib/                # Firebase configuration
│   ├── pages/              # Page components
│   │   └── dashboard/      # Role-specific dashboards
│   ├── types/              # Type definitions and constants
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── firestore.rules         # Firestore security rules
└── package.json
```

## 🔥 Firebase Collections

- `users/` - User profiles with roles
- `projects/` - Professor/TA research projects
- `studentProjects/` - Student-created projects
- `opportunities/` - Organization opportunities
- `applications/` - Application submissions
- `reports/` - Weekly student progress reports
- `notifications/` - In-app notifications

## 🎨 Design System

- **Primary Color**: `#0046ad`
- **Typography**: Inter (body), Poppins (headings)
- **Components**: Cards, Modals, Tables, Forms with luxury styling
- **Animations**: Smooth transitions using Framer Motion

## 📝 File Uploads

All file uploads must be done via **Google Drive links**. Users paste Drive links into forms, and the system validates and stores them. No direct file uploads to Firebase Storage.

## 🔒 Security

- Role-based access control enforced in Firestore security rules
- Protected routes in React Router
- User authentication required for all operations
- Data validation using Zod schemas

## 🚧 Development Status

This is a production-ready platform with all core features implemented. Additional enhancements can be added as needed.

## 📄 License

Private - All rights reserved

---

Built with ❤️ for academic excellence
