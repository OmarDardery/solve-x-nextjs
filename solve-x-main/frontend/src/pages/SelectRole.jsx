import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dummyDataService } from '../services/dummyDataService'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { USER_ROLES } from '../types'
import toast from 'react-hot-toast'
import { GraduationCap, Users, User, Building2 } from 'lucide-react'

export function SelectRole() {
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const { currentUser, userRole, refreshUserRole } = useAuth()
  const navigate = useNavigate()

  // Check if user already has a role
  useEffect(() => {
    if (userRole) {
      // User already has a role, redirect to their dashboard
      const dashboardPaths = {
        [USER_ROLES.PROFESSOR]: '/dashboard/professor',
        [USER_ROLES.TEACHING_ASSISTANT]: '/dashboard/ta',
        [USER_ROLES.STUDENT]: '/dashboard/student',
        [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
      }
      navigate(dashboardPaths[userRole] || '/dashboard', { replace: true })
    }
  }, [userRole, navigate])

  const roles = [
    {
      value: USER_ROLES.PROFESSOR,
      label: 'Professor',
      icon: GraduationCap,
      description: 'Publish research projects and manage applications',
    },
    {
      value: USER_ROLES.TEACHING_ASSISTANT,
      label: 'Teaching Assistant',
      icon: Users,
      description: 'Assist with projects and manage student applications',
    },
    {
      value: USER_ROLES.STUDENT,
      label: 'Student',
      icon: User,
      description: 'Apply to projects and track your progress',
    },
    {
      value: USER_ROLES.ORGANIZATION,
      label: 'Organization Representative',
      icon: Building2,
      description: 'Publish courses, workshops, and training programs',
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    setLoading(true)
    try {
      // Update user role in localStorage
      localStorage.setItem('dummyAuth_role', selectedRole)
      
      // Update user in dummy data service
      const userData = {
        email: currentUser.email,
        role: selectedRole,
        displayName: currentUser.displayName || currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      }
      dummyDataService.createUser(currentUser.uid, userData)
      
      // Update users in localStorage
      const users = JSON.parse(localStorage.getItem('dummyAuth_users') || '{}')
      if (users[currentUser.email]) {
        users[currentUser.email].role = selectedRole
        localStorage.setItem('dummyAuth_users', JSON.stringify(users))
      }
      
      toast.success('Role selected successfully!')
      
      // Refresh user role in AuthContext
      if (refreshUserRole) {
        await refreshUserRole()
      }
      
      // Navigate to dashboard
      const dashboardPaths = {
        [USER_ROLES.PROFESSOR]: '/dashboard/professor',
        [USER_ROLES.TEACHING_ASSISTANT]: '/dashboard/ta',
        [USER_ROLES.STUDENT]: '/dashboard/student',
        [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
      }
      window.location.href = dashboardPaths[selectedRole] || '/dashboard'
    } catch (error) {
      console.error('Error setting role:', error)
      toast.error(error.message || 'Failed to set role')
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center">
            Choose the role that best describes your position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-6 rounded-xl border-2 transition-all text-left role-card ${
                      selectedRole === role.value
                        ? 'border-brand bg-brand-light'
                        : 'border-default hover:border-brand-hover'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mb-3 ${
                        selectedRole === role.value ? 'icon-primary' : 'icon-muted'
                      }`}
                    />
                    <h3 className="font-semibold text-lg mb-2 text-heading">{role.label}</h3>
                    <p className="text-sm text-body">{role.description}</p>
                  </button>
                )
              })}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !selectedRole}>
              {loading ? 'Setting up...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

