import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { USER_ROLES } from '../types'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing JWT token and restore session
    const token = apiService.getToken()
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('user_role')
    
    if (token && storedUser && storedRole) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setUserRole(storedRole)
        
        // Optionally verify token with backend
        apiService.getProfile().catch(() => {
          // Token invalid, clear session
          logout()
        })
      } catch (error) {
        console.error('Error restoring session:', error)
        logout()
      }
    }
    
    setLoading(false)
  }, [])

  async function signup(role, code, email, password, firstName, lastName) {
    try {
      const response = await apiService.signup(role, {
        code: parseInt(code),
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      })

      // Store JWT token
      if (response.token) {
        apiService.setToken(response.token)
      }

      // Create user object from response
      const user = {
        email,
        firstName,
        lastName,
        role,
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_role', role)

      setCurrentUser(user)
      setUserRole(role)

      return { user }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async function signupOrganization(code, email, password, name, contact, link) {
    try {
      const response = await apiService.signup('organization', {
        code: parseInt(code),
        email,
        password,
        name,
        contact: contact || '',
        link: link || '',
      })

      // Store JWT token
      if (response.token) {
        apiService.setToken(response.token)
      }

      // Create user object from response
      const user = {
        email,
        name,
        contact,
        link,
        role: 'organization',
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_role', 'organization')

      setCurrentUser(user)
      setUserRole('organization')

      return { user }
    } catch (error) {
      console.error('Organization signup error:', error)
      throw error
    }
  }

  async function login(role, email, password) {
    try {
      const response = await apiService.signin(role, email, password)

      // Store JWT token
      if (response.token) {
        apiService.setToken(response.token)
      }

      // Get user profile from backend
      const profileData = await apiService.getProfile()
      
      // Handle both response structures
      const userData = profileData.user || profileData
      const user = {
        email,
        role,
        ...userData,
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_role', role)

      // Update state synchronously
      setCurrentUser(user)
      setUserRole(role)

      return { user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function sendVerificationCode(email, role = '') {
    try {
      await apiService.sendVerificationCode(email, role)
      return { success: true }
    } catch (error) {
      console.error('Send verification code error:', error)
      throw error
    }
  }

  async function logout() {
    apiService.removeToken()
    localStorage.removeItem('user')
    localStorage.removeItem('user_role')
    setCurrentUser(null)
    setUserRole(null)
  }

  const refreshUserRole = async () => {
    if (currentUser) {
      const storedRole = localStorage.getItem('user_role')
      setUserRole(storedRole || null)
      return storedRole
    }
    return null
  }

  const value = {
    currentUser,
    userRole,
    signup,
    signupOrganization,
    login,
    sendVerificationCode,
    logout,
    loading,
    refreshUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}