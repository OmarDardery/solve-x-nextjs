import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { USER_ROLES, getDomainsForRole, buildEmail } from '../types'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

export function Signup() {
  const [step, setStep] = useState(1) // 1: role + identifier, 2: code + details
  const [formData, setFormData] = useState({
    identifier: '', // Student ID or professor name
    domain: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [availableDomains, setAvailableDomains] = useState([])
  const { signup, sendVerificationCode, currentUser, userRole } = useAuth()
  const { getLogo } = useTheme()
  const navigate = useNavigate()

  // Update available domains when role changes
  useEffect(() => {
    if (formData.role) {
      const domains = getDomainsForRole(formData.role)
      setAvailableDomains(domains)
      // Auto-select the first domain
      if (domains.length > 0) {
        setFormData(prev => ({ ...prev, domain: domains[0] }))
      }
    } else {
      setAvailableDomains([])
      setFormData(prev => ({ ...prev, domain: '' }))
    }
  }, [formData.role])

  // Navigate after signup when auth state updates
  useEffect(() => {
    if (currentUser && userRole && showSuccessModal) {
      const timer = setTimeout(() => {
        const dashboardPaths = {
          [USER_ROLES.PROFESSOR]: '/dashboard/professor',
          [USER_ROLES.STUDENT]: '/dashboard/student',
          [USER_ROLES.ORGANIZATION]: '/dashboard/organization',
        }
        navigate(dashboardPaths[userRole] || '/dashboard', { replace: true })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [currentUser, userRole, showSuccessModal, navigate])

  // Get the placeholder text based on role
  const getIdentifierPlaceholder = () => {
    if (formData.role === USER_ROLES.STUDENT) {
      return '2x-xxxxxx'
    } else if (formData.role === USER_ROLES.PROFESSOR) {
      return 'firstname.lastname'
    }
    return 'Enter your identifier'
  }

  // Get the label text based on role
  const getIdentifierLabel = () => {
    if (formData.role === USER_ROLES.STUDENT) {
      return 'Student ID'
    } else if (formData.role === USER_ROLES.PROFESSOR) {
      return 'Username'
    }
    return 'Identifier'
  }

  const validateIdentifier = (identifier) => {
    if (!identifier) {
      return 'Identifier is required'
    }
    if (formData.role === USER_ROLES.STUDENT) {
      // Student ID format: 2x-xxxxxx (e.g., 21-101234)
      if (!/^2\d-\d{6}$/.test(identifier)) {
        return 'Invalid student ID format (e.g., 21-101234)'
      }
    }
    return null
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }
    
    const identifierError = validateIdentifier(formData.identifier)
    if (identifierError) {
      newErrors.identifier = identifierError
    }
    
    if (!formData.domain) {
      newErrors.domain = 'Domain is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    // Verification code validation
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required'
    } else if (!/^\d{6}$/.test(formData.verificationCode)) {
      newErrors.verificationCode = 'Code must be 6 digits'
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSendCode = async (e) => {
    e.preventDefault()

    if (!validateStep1()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      const email = buildEmail(formData.identifier, formData.domain)
      await sendVerificationCode(email, formData.role)
      toast.success('Verification code sent to your email!')
      setCodeSent(true)
      setStep(2)
    } catch (error) {
      let errorMsg = 'Failed to send verification code'
      if (error.message) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
      setErrors({ identifier: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      const email = buildEmail(formData.identifier, formData.domain)
      await signup(
        formData.role,
        formData.verificationCode,
        email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      
      setShowSuccessModal(true)
      toast.success('Account created successfully!')
    } catch (error) {
      let errorMsg = 'Failed to create account'
      if (error.message) {
        errorMsg = error.message
      }
      setErrorMessage(errorMsg)
      setShowErrorModal(true)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const getFullEmail = () => {
    return buildEmail(formData.identifier, formData.domain)
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
          <CardTitle className="text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Select your role and enter your credentials' : 'Complete your registration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Role + Identifier */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Select
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleChange}
                error={errors.role}
                required
              >
                <option value="">Select a role</option>
                <option value={USER_ROLES.STUDENT}>Student</option>
                <option value={USER_ROLES.PROFESSOR}>Professor</option>
              </Select>

              {formData.role && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-heading">
                      {getIdentifierLabel()} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          type="text"
                          name="identifier"
                          placeholder={getIdentifierPlaceholder()}
                          value={formData.identifier}
                          onChange={handleChange}
                          error={errors.identifier}
                          required
                        />
                      </div>
                      <div className="flex items-center text-muted pt-2">@</div>
                      <div className="flex-1">
                        <Select
                          name="domain"
                          value={formData.domain}
                          onChange={handleChange}
                          disabled={availableDomains.length <= 1}
                          error={errors.domain}
                        >
                          {availableDomains.map(domain => (
                            <option key={domain} value={domain}>{domain}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    {formData.identifier && formData.domain && (
                      <p className="text-xs text-muted mt-1">
                        Email: {getFullEmail()}
                      </p>
                    )}
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading || !formData.role}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Verification Code
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Verification Code + Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="alert-info">
                <p className="text-sm">
                  <Mail className="w-4 h-4 inline mr-1" />
                  A verification code has been sent to <strong>{getFullEmail()}</strong>
                </p>
              </div>

              <Input
                type="text"
                name="verificationCode"
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={formData.verificationCode}
                onChange={handleChange}
                error={errors.verificationCode}
                maxLength={6}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                />
                <Input
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3"
                  onClick={() => {
                    setStep(1)
                    setCodeSent(false)
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-2/3" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={handleSendCode}
                disabled={loading}
              >
                Resend verification code
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-body">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-medium">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-body">
            Are you an organization?{' '}
            <Link to="/signup/organization" className="text-brand font-medium">
              Sign up here
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-heading mb-2">Account Created Successfully!</h3>
          <p className="text-body mb-4">
            Your account has been created. You will be redirected to your dashboard shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
            <span>Redirecting...</span>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title=""
        size="sm"
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-heading mb-2">Sign Up Failed</h3>
          <p className="text-body mb-4">{errorMessage}</p>
          <Button onClick={() => setShowErrorModal(false)} className="w-full">
            Try Again
          </Button>
        </div>
      </Modal>
    </div>
  )
}

