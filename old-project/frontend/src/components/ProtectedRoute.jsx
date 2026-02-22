import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user is logged in but has no role, redirect to select-role
  // unless they're already on the select-role page or just signed up
  // Give a small delay to allow Firestore to sync
  if (!userRole && location.pathname !== '/select-role' && !location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/select-role" replace />
  }
  
  // If user has a role but is on select-role page, redirect to their dashboard
  if (userRole && location.pathname === '/select-role') {
    const dashboardPaths = {
      'professor': '/dashboard/professor',
      'ta': '/dashboard/ta',
      'student': '/dashboard/student',
      'organization': '/dashboard/organization',
      'organization_representative': '/dashboard/organization',
    }
    return <Navigate to={dashboardPaths[userRole] || '/dashboard'} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

