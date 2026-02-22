import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('solvex-theme')
    if (saved) {
      return saved === 'dark'
    }
    // Default to light mode as per branding preference
    return false
  })

  useEffect(() => {
    // Update document class for Tailwind dark mode
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Persist preference
    localStorage.setItem('solvex-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const setTheme = (theme) => {
    setIsDark(theme === 'dark')
  }

  // Get appropriate logo based on theme
  const getLogo = (variant = 'default') => {
    // Using Icon&Type.png for both modes as selected
    // For dark backgrounds, we use WhiteLogo; for light backgrounds, BlackLogo
    if (variant === 'icon') {
      return isDark ? '/WhiteLogo.png' : '/BlackLogo.png'
    }
    // Default: Icon&Type.png for the full branding
    return '/Icon&Type.png'
  }

  const value = {
    isDark,
    toggleTheme,
    setTheme,
    getLogo,
    theme: isDark ? 'dark' : 'light',
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
