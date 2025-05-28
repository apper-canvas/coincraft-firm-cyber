import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GoalsTab from '../components/GoalsTab'
import ApperIcon from '../components/ApperIcon'

const Goals = () => {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-md border-b border-surface-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-card">
                <ApperIcon name="Coins" className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">CoinCraft</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">Dashboard</Link>
                <Link to="/portfolio" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">Portfolio</Link>
                <Link to="/goals" className="text-primary-600 font-medium">Goals</Link>
              </nav>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ApperIcon name={darkMode ? 'Sun' : 'Moon'} className="w-5 h-5 text-surface-600" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GoalsTab />
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-surface-200/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="Coins" className="w-4 h-4 text-white" />
              </div>
              <span className="text-surface-600 font-medium">CoinCraft Finance Platform</span>
            </div>
            <div className="flex space-x-6 text-sm text-surface-500">
              <a href="#privacy" className="hover:text-primary-600 transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-primary-600 transition-colors">Terms</a>
              <a href="#support" className="hover:text-primary-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Goals