import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { currentUser, userRole, logout } = useAuth()
  const { getLogo } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    switch (userRole) {
      case 'professor':
        return '/dashboard/professor'
      case 'ta':
        return '/dashboard/ta'
      case 'student':
        return '/dashboard/student'
      case 'organization':
      case 'organization_representative':
        return '/dashboard/organization'
      default:
        return '/dashboard'
    }
  }

  return (
    <nav className="navbar sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={getLogo()}
              alt="SolveX Logo" 
              className="h-8 sm:h-10 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-6">
              <Link to={getDashboardPath()} className="navbar-link font-medium">
                Dashboard
              </Link>
              <Link to="/opportunities" className="navbar-link font-medium">
                Opportunities
              </Link>
              {(userRole === 'student' || userRole === 'professor') && (
                <Link to="/events" className="navbar-link font-medium">
                  Events
                </Link>
              )}
              {userRole === 'student' && (
                <Link to="/applications" className="navbar-link font-medium">
                  My Applications
                </Link>
              )}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <span className="text-sm text-muted">
                  {currentUser.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Not logged in - show theme toggle */}
          {!currentUser && (
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          )}

          {/* Mobile menu button */}
          {currentUser && (
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                className="p-2 text-body"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          )}

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && currentUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="navbar md:hidden absolute top-16 left-0 right-0"
              >
                <div className="px-4 py-4 space-y-3">
                  <Link
                    to={getDashboardPath()}
                    className="block navbar-link font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/opportunities"
                    className="block navbar-link font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Opportunities
                  </Link>
                  {(userRole === 'student' || userRole === 'professor') && (
                    <Link
                      to="/events"
                      className="block navbar-link font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Events
                    </Link>
                  )}
                  {userRole === 'student' && (
                    <Link
                      to="/applications"
                      className="block navbar-link font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  )}
                  <div className="pt-3 divider border-t">
                    <p className="text-sm text-muted mb-2">{currentUser.email}</p>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}

