import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const TransactionsTab = ({ transactions, setTransactions, budgets, setBudgets }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  })
  
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

  // Get all unique categories for filtering
  const allCategories = [...new Set(transactions.map(t => t.category))]

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filters.type === 'all' || transaction.type === filters.type
      const matchesCategory = filters.category === 'all' || transaction.category === filters.category
      
      const matchesDateFrom = !filters.dateFrom || transaction.date >= filters.dateFrom
      const matchesDateTo = !filters.dateTo || transaction.date <= filters.dateTo
      
      const matchesAmountMin = !filters.amountMin || transaction.amount >= parseFloat(filters.amountMin)
      const matchesAmountMax = !filters.amountMax || transaction.amount <= parseFloat(filters.amountMax)
      
      return matchesSearch && matchesType && matchesCategory && 
             matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax
    })

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      if (sortField === 'amount') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      } else if (sortField === 'date') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else {
        aValue = aValue.toString().toLowerCase()
        bValue = bValue.toString().toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [transactions, searchTerm, sortField, sortDirection, filters])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
    toast.success('Filters cleared')
  }

  const exportToCSV = () => {
    if (filteredAndSortedTransactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedTransactions.map(transaction => [
        transaction.date,
        transaction.type,
        transaction.category,
        `"${transaction.description}"`,
        transaction.amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${filteredAndSortedTransactions.length} transactions to CSV`)
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

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const transaction = transactions.find(t => t.id === transactionId)
      
      // Update budget if it's an expense
      if (transaction && transaction.type === 'expense') {
        setBudgets(prev => prev.map(budget => 
          budget.category === transaction.category 
            ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
            : budget
        ))
      }
      
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      toast.success('Transaction deleted successfully!')
    }
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
        <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Transactions Manager</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <ApperIcon name="Download" className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowTransactionForm(!showTransactionForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
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

      {/* Filters and Search */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-surface-800">Filters & Search</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <ApperIcon name="X" className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search transactions..."
              />
              <ApperIcon name="Search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Items per page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="input-field"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Min Amount</label>
            <input
              type="number"
              step="0.01"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              className="input-field"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Max Amount</label>
            <input
              type="number"
              step="0.01"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              className="input-field"
              placeholder="No limit"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-surface-600">
        <span>Showing {paginatedTransactions.length} of {filteredAndSortedTransactions.length} transactions</span>
        <span>Total: ${filteredAndSortedTransactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0).toFixed(2)}</span>
      </div>

      {/* Interactive Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortField === 'date' && (
                      <ApperIcon 
                        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        className="w-4 h-4" 
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                  Type
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {sortField === 'category' && (
                      <ApperIcon 
                        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        className="w-4 h-4" 
                      />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Description</span>
                    {sortField === 'description' && (
                      <ApperIcon 
                        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        className="w-4 h-4" 
                      />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    {sortField === 'amount' && (
                      <ApperIcon 
                        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        className="w-4 h-4" 
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-surface-200">
              {paginatedTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-surface-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-900 max-w-xs truncate">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedTransactions.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="FileX" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500">No transactions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-surface-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-surface-300 text-surface-600 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-surface-300 text-surface-600 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default TransactionsTab
