import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const quickStats = [
    { label: 'Total Balance', value: '$12,847.50', icon: 'Wallet', color: 'text-primary-600' },
    { label: 'Monthly Income', value: '$4,200.00', icon: 'TrendingUp', color: 'text-secondary-600' },
    { label: 'Monthly Expenses', value: '$2,850.75', icon: 'TrendingDown', color: 'text-red-500' },
    { label: 'Savings Goal', value: '68%', icon: 'Target', color: 'text-accent' }
  ]

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
                <button 
                  onClick={() => {
                    const analyticsSection = document.querySelector('.analytics-section');
                    if (analyticsSection) {
                      analyticsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Also switch to analytics tab if MainFeature is available
                    const analyticsTab = document.querySelector('[data-tab="analytics"]');
                    if (analyticsTab) {
                      analyticsTab.click();
                    }
                  }}
                  className="text-surface-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Analytics
                </button>
                <a href="#goals" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">Goals</a>
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

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="metric-card group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 sm:p-3 rounded-xl ${stat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                  <ApperIcon name={stat.icon} className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <ApperIcon name="TrendingUp" className="w-4 h-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-surface-500 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-surface-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Feature */}
      <MainFeature />

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

export default Home