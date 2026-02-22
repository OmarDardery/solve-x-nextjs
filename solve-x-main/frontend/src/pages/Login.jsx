import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { USER_ROLES, getDomainsForRole, buildEmail } from '../types'
import toast from 'react-hot-toast'

export function Login() {
  const [identifier, setIdentifier] = useState('')
  const [domain, setDomain] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [availableDomains, setAvailableDomains] = useState([])
  const { login, currentUser, userRole, loading: authLoading } = useAuth()
  const { getLogo } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname

  // Update available domains when role changes
  useEffect(() => {
    if (role) {
      const domains = getDomainsForRole(role)
      setAvailableDomains(domains)
      // Auto-select the first domain
      if (domains.length > 0) {
        setDomain(domains[0])
      }
    } else {
      setAvailableDomains([])
      setDomain('')
    }
  }, [role])

  // Helper function to get role-based dashboard path
  const getDashboardPath = (role) => {
    if (!role) return '/select-role'
    const paths = {
      [USER_ROLES.PROFESSOR]: '/dashboard/professor',
      [USER_ROLES.STUDENT]: '/dashboard/student',
      [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
    }
    return paths[role] || '/select-role'
  }

  // Navigate after login when userRole is available
  useEffect(() => {
    if (currentUser && userRole && !authLoading) {
      const dashboardPath = getDashboardPath(userRole)
      if (!from || from === '/login' || from === '/') {
        navigate(dashboardPath, { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [currentUser, userRole, authLoading, navigate, from])

  // Get the placeholder text based on role
  const getIdentifierPlaceholder = () => {
    if (role === USER_ROLES.STUDENT) {
      return '2x-xxxxxx'
    } else if (role === USER_ROLES.PROFESSOR) {
      return 'firstname.lastname'
    }
    return 'Enter your identifier'
  }

  // Get the label text based on role
  const getIdentifierLabel = () => {
    if (role === USER_ROLES.STUDENT) {
      return 'Student ID'
    } else if (role === USER_ROLES.PROFESSOR) {
      return 'Username'
    }
    return 'Identifier'
  }

  const getFullEmail = () => {
    return buildEmail(identifier, domain)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = {}
    if (!role) {
      newErrors.role = 'Please select your role'
    }
    if (!identifier) {
      newErrors.identifier = 'Identifier is required'
    }
    if (!domain) {
      newErrors.domain = 'Domain is required'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const email = buildEmail(identifier, domain)
      await login(role, email, password)
      toast.success('Logged in successfully!')
      // Navigation will happen via useEffect when userRole is set
    } catch (error) {
      let errorMsg = 'Failed to log in'
      if (error.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img 
              src={getLogo()}
              alt="SolveX Logo" 
              className="h-16 sm:h-20 object-contain"
            />
          </div>
          <CardTitle className="text-center">Welcome to SolveX</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                if (errors.role) {
                  setErrors({ ...errors, role: '' })
                }
              }}
              error={errors.role}
              required
            >
              <option value="">Select your role</option>
              <option value={USER_ROLES.STUDENT}>Student</option>
              <option value={USER_ROLES.PROFESSOR}>Professor</option>
            </Select>

            {role && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-heading">
                  {getIdentifierLabel()} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={getIdentifierPlaceholder()}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value)
                        if (errors.identifier) {
                          setErrors({ ...errors, identifier: '' })
                        }
                      }}
                      error={errors.identifier}
                      required
                    />
                  </div>
                  <div className="flex items-center text-muted pt-2">@</div>
                  <div className="flex-1">
                    <Select
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value)
                        if (errors.domain) {
                          setErrors({ ...errors, domain: '' })
                        }
                      }}
                      disabled={availableDomains.length <= 1}
                      error={errors.domain}
                    >
                      {availableDomains.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                {identifier && domain && (
                  <p className="text-xs text-muted mt-1">
                    Email: {getFullEmail()}
                  </p>
                )}
              </div>
            )}

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              error={errors.password}
              required
            />
            <Button type="submit" className="w-full" disabled={loading || authLoading || !role}>
              {loading || authLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand font-medium">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-body">
            Are you an organization?{' '}
            <Link to="/login/organization" className="text-brand font-medium">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

