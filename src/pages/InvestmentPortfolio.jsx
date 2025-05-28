import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import ApperIcon from '../components/ApperIcon'
import { Link } from 'react-router-dom'

const InvestmentPortfolio = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [showInvestmentForm, setShowInvestmentForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  
  const [investmentForm, setInvestmentForm] = useState({
    symbol: '',
    name: '',
    shares: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })

  const [investments, setInvestments] = useState([
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      purchasePrice: 150.25,
      currentPrice: 175.30,
      purchaseDate: '2024-01-10',
      priceHistory: []
    },
    {
      id: 2,
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 25,
      purchasePrice: 2800.50,
      currentPrice: 2950.75,
      purchaseDate: '2024-01-15',
      priceHistory: []
    },
    {
      id: 3,
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 30,
      purchasePrice: 380.00,
      currentPrice: 395.20,
      purchaseDate: '2024-01-20',
      priceHistory: []
    }
  ])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setInvestments(prev => prev.map(investment => {
        const volatility = 0.02 // 2% volatility
        const change = (Math.random() - 0.5) * volatility
        const newPrice = investment.currentPrice * (1 + change)
        
        // Update price history for charts
        const now = new Date()
        const newPricePoint = {
          x: now.getTime(),
          y: newPrice
        }
        
        const updatedHistory = [...(investment.priceHistory || []), newPricePoint].slice(-50) // Keep last 50 points
        
        return {
          ...investment,
          currentPrice: newPrice,
          priceHistory: updatedHistory
        }
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Initialize price history
  useEffect(() => {
    setInvestments(prev => prev.map(investment => {
      if (investment.priceHistory.length === 0) {
        const history = []
        const startTime = new Date().getTime() - (24 * 60 * 60 * 1000) // 24 hours ago
        
        for (let i = 0; i < 48; i++) {
          const time = startTime + (i * 30 * 60 * 1000) // Every 30 minutes
          const volatility = 0.02
          const change = (Math.random() - 0.5) * volatility
          const price = investment.currentPrice * (1 + change)
          
          history.push({ x: time, y: price })
        }
        
        return { ...investment, priceHistory: history }
      }
      return investment
    }))
  }, [])

  const handleInvestmentSubmit = (e) => {
    e.preventDefault()
    
    if (!investmentForm.symbol || !investmentForm.name || !investmentForm.shares || !investmentForm.purchasePrice) {
      toast.error('Please fill in all required fields')
      return
    }

    const investmentData = {
      ...investmentForm,
      shares: parseFloat(investmentForm.shares),
      purchasePrice: parseFloat(investmentForm.purchasePrice),
      currentPrice: parseFloat(investmentForm.purchasePrice) * (1 + (Math.random() - 0.5) * 0.1), // Random initial price change
      priceHistory: []
    }

    if (editingInvestment) {
      setInvestments(prev => prev.map(inv => 
        inv.id === editingInvestment.id 
          ? { ...inv, ...investmentData }
          : inv
      ))
      toast.success('Investment updated successfully!')
      setEditingInvestment(null)
    } else {
      const newInvestment = {
        id: Date.now(),
        ...investmentData
      }
      setInvestments(prev => [...prev, newInvestment])
      toast.success('Investment added successfully!')
    }

    setInvestmentForm({
      symbol: '',
      name: '',
      shares: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    })
    
    setShowInvestmentForm(false)
  }

  const handleEdit = (investment) => {
    setInvestmentForm({
      symbol: investment.symbol,
      name: investment.name,
      shares: investment.shares.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      purchaseDate: investment.purchaseDate
    })
    setEditingInvestment(investment)
    setShowInvestmentForm(true)
  }

  const handleDelete = (investment) => {
    setInvestments(prev => prev.filter(inv => inv.id !== investment.id))
    setShowDeleteConfirm(null)
    toast.success(`${investment.symbol} removed from portfolio`)
  }

  const calculatePortfolioValue = () => {
    return investments.reduce((total, inv) => total + (inv.shares * inv.currentPrice), 0)
  }

  const calculateTotalGainLoss = () => {
    return investments.reduce((total, inv) => {
      const purchaseValue = inv.shares * inv.purchasePrice
      const currentValue = inv.shares * inv.currentPrice
      return total + (currentValue - purchaseValue)
    }, 0)
  }

  const calculateGainLossPercentage = () => {
    const totalInvested = investments.reduce((total, inv) => total + (inv.shares * inv.purchasePrice), 0)
    const totalGainLoss = calculateTotalGainLoss()
    return totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
  }

  const getChartOptions = (investment) => ({
    chart: {
      type: 'line',
      fontFamily: 'Inter',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: [investment.currentPrice >= investment.purchasePrice ? '#10b981' : '#ef4444'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'HH:mm'
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM HH:mm'
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: { height: 200 }
      }
    }]
  })

  return (
    <div className={`min-h-screen bg-gradient-to-br from-surface-50 via-surface-100 to-primary-50 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-md border-b border-surface-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-card">
                  <ApperIcon name="Coins" className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">CoinCraft</h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-surface-600 hover:text-primary-600 font-medium transition-colors">Dashboard</Link>
                <span className="text-primary-600 font-medium">Portfolio</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Portfolio Summary */}
        <motion.section 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-800 mb-6">Investment Portfolio</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                  <ApperIcon name="DollarSign" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-surface-800">${calculatePortfolioValue().toFixed(2)}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${
                  calculateTotalGainLoss() >= 0 
                    ? 'bg-secondary-100 text-secondary-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  <ApperIcon name={calculateTotalGainLoss() >= 0 ? 'TrendingUp' : 'TrendingDown'} className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${
                  calculateTotalGainLoss() >= 0 ? 'text-secondary-600' : 'text-red-600'
                }`}>
                  {calculateTotalGainLoss() >= 0 ? '+' : ''}${calculateTotalGainLoss().toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${
                  calculateGainLossPercentage() >= 0 
                    ? 'bg-secondary-100 text-secondary-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  <ApperIcon name="Percent" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Performance</p>
                <p className={`text-2xl font-bold ${
                  calculateGainLossPercentage() >= 0 ? 'text-secondary-600' : 'text-red-600'
                }`}>
                  {calculateGainLossPercentage() >= 0 ? '+' : ''}{calculateGainLossPercentage().toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Add Investment Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-surface-800">Your Investments</h2>
          <button
            onClick={() => {
              setEditingInvestment(null)
              setInvestmentForm({
                symbol: '',
                name: '',
                shares: '',
                purchasePrice: '',
                purchaseDate: new Date().toISOString().split('T')[0]
              })
              setShowInvestmentForm(!showInvestmentForm)
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>Add Investment</span>
          </button>
        </div>

        {/* Investment Form */}
        <AnimatePresence>
          {showInvestmentForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 rounded-2xl mb-6"
            >
              <h3 className="text-lg font-semibold text-surface-800 mb-4">
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
              </h3>
              <form onSubmit={handleInvestmentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Symbol</label>
                  <input
                    type="text"
                    value={investmentForm.symbol}
                    onChange={(e) => setInvestmentForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className="input-field"
                    placeholder="AAPL"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={investmentForm.name}
                    onChange={(e) => setInvestmentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Apple Inc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Shares</label>
                  <input
                    type="number"
                    step="0.01"
                    value={investmentForm.shares}
                    onChange={(e) => setInvestmentForm(prev => ({ ...prev, shares: e.target.value }))}
                    className="input-field"
                    placeholder="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={investmentForm.purchasePrice}
                    onChange={(e) => setInvestmentForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    className="input-field"
                    placeholder="150.25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={investmentForm.purchaseDate}
                    onChange={(e) => setInvestmentForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex gap-4">
                  <button type="submit" className="btn-primary">
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvestmentForm(false)
                      setEditingInvestment(null)
                    }}
                    className="px-6 py-3 rounded-xl border-2 border-surface-300 text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Investments List */}
        <div className="space-y-6">
          {investments.map((investment, index) => {
            const gainLoss = (investment.currentPrice - investment.purchasePrice) * investment.shares
            const gainLossPercentage = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100
            const isPositive = gainLoss >= 0

            return (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Investment Info */}
                  <div className="lg:w-1/3">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-surface-800">{investment.symbol}</h3>
                        <p className="text-surface-600">{investment.name}</p>
                        <p className="text-sm text-surface-500">{investment.shares} shares</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(investment)}
                          className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4 text-surface-600" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(investment.id)}
                          className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-surface-600">Current Price:</span>
                        <span className="font-medium">${investment.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-600">Purchase Price:</span>
                        <span className="font-medium">${investment.purchasePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-600">Total Value:</span>
                        <span className="font-medium">${(investment.shares * investment.currentPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-600">Gain/Loss:</span>
                        <span className={`font-bold ${
                          isPositive ? 'text-secondary-600' : 'text-red-600'
                        }`}>
                          {isPositive ? '+' : ''}${gainLoss.toFixed(2)} ({isPositive ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Chart */}
                  <div className="lg:w-2/3">
                    <h4 className="text-lg font-semibold text-surface-800 mb-4">24h Price Movement</h4>
                    {investment.priceHistory && investment.priceHistory.length > 0 ? (
                      <Chart
                        options={getChartOptions(investment)}
                        series={[{
                          name: investment.symbol,
                          data: investment.priceHistory
                        }]}
                        type="line"
                        height={250}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-surface-500">
                        <div className="text-center">
                          <ApperIcon name="BarChart3" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Loading price data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {investments.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="TrendingUp" className="w-16 h-16 mx-auto mb-4 text-surface-300" />
            <h3 className="text-xl font-semibold text-surface-600 mb-2">No investments yet</h3>
            <p className="text-surface-500 mb-6">Start building your portfolio by adding your first investment</p>
            <button
              onClick={() => setShowInvestmentForm(true)}
              className="btn-primary"
            >
              Add Your First Investment
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="AlertTriangle" className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-800 mb-2">Delete Investment</h3>
                <p className="text-surface-600 mb-6">
                  Are you sure you want to remove {investments.find(inv => inv.id === showDeleteConfirm)?.symbol} from your portfolio?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border-2 border-surface-300 rounded-xl text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(investments.find(inv => inv.id === showDeleteConfirm))}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InvestmentPortfolio