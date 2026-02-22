/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // SolveX Brand Colors from branding specification
        brand: {
          900: '#011c8d', // Darkest brand blue
          700: '#1329b3', // Medium brand blue
          500: '#643ae6', // Brand purple
          300: '#a15df2', // Light brand purple
        },
        // Primary palette derived from brand colors
        primary: {
          50: '#f0f0ff',
          100: '#e0e1ff',
          200: '#c7c8fe',
          300: '#a15df2', // brand-300
          400: '#8347e9',
          500: '#643ae6', // brand-500
          600: '#1329b3', // brand-700
          700: '#011c8d', // brand-900
          800: '#01156b',
          900: '#010e49',
        },
        // Dark mode specific colors
        dark: {
          bg: '#0a0a1a',
          card: '#12122a',
          border: '#1e1e3f',
          text: '#e4e4f0',
          muted: '#9999b3',
        },
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Source Sans Pro', 'system-ui', 'sans-serif'],
        display: ['Source Sans 3', 'Source Sans Pro', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(1, 28, 141, 0.08), 0 10px 20px -2px rgba(1, 28, 141, 0.04)',
        'medium': '0 4px 25px -5px rgba(1, 28, 141, 0.1), 0 10px 30px -5px rgba(1, 28, 141, 0.05)',
        'large': '0 10px 40px -10px rgba(1, 28, 141, 0.15), 0 20px 50px -10px rgba(1, 28, 141, 0.1)',
        'soft-dark': '0 2px 15px -3px rgba(100, 58, 230, 0.15), 0 10px 20px -2px rgba(100, 58, 230, 0.08)',
        'medium-dark': '0 4px 25px -5px rgba(100, 58, 230, 0.2), 0 10px 30px -5px rgba(100, 58, 230, 0.1)',
        'large-dark': '0 10px 40px -10px rgba(100, 58, 230, 0.25), 0 20px 50px -10px rgba(100, 58, 230, 0.15)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #011c8d 0%, #643ae6 100%)',
        'gradient-brand-light': 'linear-gradient(135deg, #1329b3 0%, #a15df2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a1a 0%, #1e1e3f 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


