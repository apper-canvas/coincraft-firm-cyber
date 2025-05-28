import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const TransactionsTab = ({ transactions, setTransactions, budgets, setBudgets }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

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

  return (
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
  )
}

export default TransactionsTab