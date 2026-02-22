import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'

// Pages
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { SelectRole } from './pages/SelectRole'
import { OrganizationSignup } from './pages/OrganizationSignup'
import { OrganizationLogin } from './pages/OrganizationLogin'

// Dashboard Pages
import { ProfessorDashboard } from './pages/dashboard/ProfessorDashboard'
import { StudentDashboard } from './pages/dashboard/StudentDashboard'
import { OrganizationDashboard } from './pages/dashboard/OrganizationDashboard'

// Feature Pages
import { Opportunities } from './pages/Opportunities'
import { OpportunityDetail } from './pages/OpportunityDetail'
import { Applications } from './pages/Applications'
import { WeeklyReports } from './pages/WeeklyReports'
import { Events } from './pages/Events'
import { OrganizationDetail } from './pages/OrganizationDetail'

import { USER_ROLES } from './types'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/organization" element={<OrganizationLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/organization" element={<OrganizationSignup />} />
        <Route
          path="/select-role"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <SelectRole />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/professor"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.PROFESSOR]}>
              <Layout>
                <ProfessorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/organization"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ORGANIZATION]}>
              <Layout>
                <OrganizationDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Feature Routes */}
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Layout>
                <Opportunities />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <OpportunityDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Layout>
                <Applications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <WeeklyReports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizations/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <OrganizationDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

