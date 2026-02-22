import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'
import { Layout } from '../components/layout/Layout'
import { Search, BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Home() {
  const { currentUser } = useAuth()
  const { getLogo } = useTheme()

  return (
    <Layout>
      <div className="space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 sm:py-16 px-4"
        >
          <div className="flex justify-center mb-6 sm:mb-8">
            <img 
              src={getLogo()}
              alt="SolveX Logo" 
              className="h-16 sm:h-20 md:h-24 object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-heading mb-4 sm:mb-6">
            Welcome to SolveX
          </h1>
          <p className="text-base sm:text-xl text-body max-w-2xl mx-auto mb-6 sm:mb-8">
            The premium platform for student research, academic collaboration, and skill development
          </p>
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" as={Link} to="/signup" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" as={Link} to="/login" className="w-full sm:w-auto">
                Sign In
              </Button>
            </div>
          ) : (
            <Button size="lg" as={Link} to="/opportunities">
              Browse Opportunities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 px-4 sm:px-0">
          {[
            {
              icon: Search,
              title: 'Research Opportunities',
              description: 'Discover and apply to research projects from professors, TAs, and fellow students',
            },
            {
              icon: BookOpen,
              title: 'Skill Development',
              description: 'Access courses, workshops, and training programs from student organizations',
            },
            {
              icon: Users,
              title: 'Collaboration',
              description: 'Connect with peers, professors, and organizations to advance your academic journey',
            },
            {
              icon: TrendingUp,
              title: 'Progress Tracking',
              description: 'Submit weekly reports and track your progress on accepted projects',
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: 'rgba(100, 58, 230, 0.1)' }}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 icon-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-heading mb-2">{feature.title}</h3>
                <p className="text-body text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

