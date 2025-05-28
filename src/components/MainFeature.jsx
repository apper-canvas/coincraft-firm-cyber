import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('transactions')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', amount: 4200, category: 'Salary', description: 'Monthly salary', date: '2024-01-15' },
    { id: 2, type: 'expense', amount: 850, category: 'Rent', description: 'Monthly rent payment', date: '2024-01-14' },
    { id: 3, type: 'expense', amount: 120, category: 'Groceries', description: 'Weekly shopping', date: '2024-01-13' },
    { id: 4, type: 'expense', amount: 45, category: 'Transportation', description: 'Gas fill-up', date: '2024-01-12' },
  ])

  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Groceries', limit: 400, spent: 120, period: 'monthly' },
    { id: 2, category: 'Transportation', limit: 200, spent: 45, period: 'monthly' },
    { id: 3, category: 'Entertainment', limit: 150, spent: 0, period: 'monthly' },
    { id: 4, category: 'Dining Out', limit: 300, spent: 0, period: 'monthly' },
  ])

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Rent', 'Groceries', 'Transportation', 'Entertainment', 'Dining Out', 'Utilities', 'Healthcare', 'Shopping', 'Other']
  }

  const handleTransactionSubmit = (e) => {
    e.preventDefault()
    
    if (!transactionForm.amount || !transactionForm.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const newTransaction = {
      id: Date.now(),
      ...transactionForm,
      amount: parseFloat(transactionForm.amount)
    }

    setTransactions(prev => [newTransaction, ...prev])
    
    // Update budget if it's an expense
    if (transactionForm.type === 'expense') {
      setBudgets(prev => prev.map(budget => 
        budget.category === transactionForm.category 
          ? { ...budget, spent: budget.spent + parseFloat(transactionForm.amount) }
          : budget
      ))
    }

    setTransactionForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    
    setShowTransactionForm(false)
    toast.success('Transaction added successfully!')
  }

  // Chart configurations
  const expenseChartOptions = {
    chart: { type: 'donut', fontFamily: 'Inter' },
    labels: [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))],
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '70%' } } },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: 'bottom' }
      }
    }]
  }

  const expenseChartSeries = categories.expense.map(category => 
    transactions.filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  ).filter(amount => amount > 0)

  const budgetChartOptions = {
    chart: { type: 'bar', fontFamily: 'Inter' },
    xaxis: { categories: budgets.map(b => b.category) },
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'top' },
    plotOptions: {
      bar: { columnWidth: '50%', borderRadius: 4 }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: '100%' },
        plotOptions: { bar: { columnWidth: '70%' } }
      }
    }]
  }

  const budgetChartSeries = [
    { name: 'Budget Limit', data: budgets.map(b => b.limit) },
    { name: 'Amount Spent', data: budgets.map(b => b.spent) }
  ]

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: 'CreditCard' },
    { id: 'budgets', label: 'Budgets', icon: 'PieChart' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-card border border-surface-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-card'
                  : 'text-surface-600 hover:text-primary-600 hover:bg-surface-50'
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Recent Transactions</h2>
              <button
                onClick={() => setShowTransactionForm(!showTransactionForm)}
                className="btn-primary flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            </div>

            {/* Transaction Form */}
            <AnimatePresence>
              {showTransactionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <form onSubmit={handleTransactionSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">Type</label>
                      <select
                        value={transactionForm.type}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value, category: '' }))}
                        className="input-field"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="input-field"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">Category</label>
                      <select
                        value={transactionForm.category}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                        className="input-field"
                        required
                      >
                        <option value="">Select category</option>
                        {categories[transactionForm.type].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                        className="input-field"
                        placeholder="Transaction description"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 flex gap-4">
                      <button type="submit" className="btn-primary">
                        Add Transaction
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTransactionForm(false)}
                        className="px-6 py-3 rounded-xl border-2 border-surface-300 text-surface-600 hover:bg-surface-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      transaction.type === 'income' 
                        ? 'bg-secondary-100 text-secondary-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <ApperIcon 
                        name={transaction.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                        className="w-5 h-5" 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-800">{transaction.description}</h3>
                      <p className="text-sm text-surface-500">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-secondary-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <motion.div
            key="budgets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Budget Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((budget, index) => {
                const percentage = (budget.spent / budget.limit) * 100
                const isOverBudget = percentage > 100
                
                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="metric-card"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-surface-800">{budget.category}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isOverBudget 
                          ? 'bg-red-100 text-red-700' 
                          : percentage > 80 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-600">Spent: ${budget.spent}</span>
                        <span className="text-surface-600">Limit: ${budget.limit}</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isOverBudget 
                              ? 'bg-gradient-to-r from-red-400 to-red-500' 
                              : percentage > 80
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                              : 'bg-gradient-to-r from-secondary-400 to-secondary-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-surface-500">
                        ${(budget.limit - budget.spent).toFixed(2)} remaining
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Financial Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Distribution */}
              <div className="chart-container">
                <h3 className="text-lg font-semibold text-surface-800 mb-4">Expense Distribution</h3>
                {expenseChartSeries.length > 0 ? (
                  <Chart
                    options={expenseChartOptions}
                    series={expenseChartSeries}
                    type="donut"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-surface-500">
                    <div className="text-center">
                      <ApperIcon name="PieChart" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No expense data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Budget vs Spending */}
              <div className="chart-container">
                <h3 className="text-lg font-semibold text-surface-800 mb-4">Budget vs Spending</h3>
                <Chart
                  options={budgetChartOptions}
                  series={budgetChartSeries}
                  type="bar"
                  height={300}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default MainFeature