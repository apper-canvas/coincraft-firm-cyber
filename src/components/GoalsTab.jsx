import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const GoalsTab = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Emergency Fund',
      description: 'Build 6 months of expenses as emergency fund',
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: '2024-12-31',
      category: 'savings',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Vacation Trip',
      description: 'Save for a trip to Europe',
      targetAmount: 5000,
      currentAmount: 2800,
      deadline: '2024-08-15',
      category: 'travel',
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      title: 'New Car',
      description: 'Down payment for a new car',
      targetAmount: 12000,
      currentAmount: 4200,
      deadline: '2024-10-01',
      category: 'purchase',
      createdAt: '2024-02-01'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'savings'
  })

  const categories = [
    { value: 'savings', label: 'Savings', icon: 'Piggybank' },
    { value: 'travel', label: 'Travel', icon: 'Plane' },
    { value: 'purchase', label: 'Purchase', icon: 'ShoppingCart' },
    { value: 'investment', label: 'Investment', icon: 'TrendingUp' },
    { value: 'education', label: 'Education', icon: 'BookOpen' },
    { value: 'other', label: 'Other', icon: 'Target' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      toast.error('Target amount must be greater than 0')
      return
    }

    if (parseFloat(formData.currentAmount) < 0) {
      toast.error('Current amount cannot be negative')
      return
    }

    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      id: editingGoal ? editingGoal.id : Date.now(),
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString().split('T')[0]
    }

    if (editingGoal) {
      setGoals(goals.map(goal => goal.id === editingGoal.id ? goalData : goal))
      toast.success('Goal updated successfully!')
      setEditingGoal(null)
    } else {
      setGoals([...goals, goalData])
      toast.success('Goal created successfully!')
    }

    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: 'savings'
    })
    setShowForm(false)
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category
    })
    setShowForm(true)
  }

  const handleDelete = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== goalId))
      toast.success('Goal deleted successfully!')
    }
  }

  const handleAddAmount = (goalId, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = goal.currentAmount + parseFloat(amount)
        const updatedGoal = { ...goal, currentAmount: newAmount }
        
        if (newAmount >= goal.targetAmount) {
          toast.success('🎉 Congratulations! Goal achieved!')
        } else {
          toast.success('Amount added successfully!')
        }
        
        return updatedGoal
      }
      return goal
    }))
  }

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.icon : 'Target'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="goals-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-surface-800 mb-2">Financial Goals</h2>
          <p className="text-surface-600">Track and achieve your financial objectives</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingGoal(null)
            setFormData({
              title: '',
              description: '',
              targetAmount: '',
              currentAmount: '',
              deadline: '',
              category: 'savings'
            })
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {goals.map((goal, index) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
          const daysRemaining = getDaysRemaining(goal.deadline)
          const isCompleted = progress >= 100
          const isOverdue = daysRemaining < 0 && !isCompleted

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`metric-card relative overflow-hidden ${
                isCompleted ? 'ring-2 ring-secondary-300' : ''
              } ${
                isOverdue ? 'ring-2 ring-red-300' : ''
              }`}
            >
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <div className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <ApperIcon name="CheckCircle" className="w-3 h-3" />
                    <span>Completed</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-primary-100 text-primary-600`}>
                    <ApperIcon name={getCategoryIcon(goal.category)} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-800">{goal.title}</h3>
                    <p className="text-sm text-surface-500">{goal.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Edit" className="w-4 h-4 text-surface-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600">Progress</span>
                  <span className="text-sm font-medium text-surface-800">
                    {progress.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-surface-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-secondary-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-600">
                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                  </span>
                  <span className={`font-medium ${
                    isOverdue ? 'text-red-600' : daysRemaining <= 30 ? 'text-orange-600' : 'text-surface-600'
                  }`}>
                    {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                     daysRemaining === 0 ? 'Due today' :
                     `${daysRemaining} days left`}
                  </span>
                </div>

                {!isCompleted && (
                  <div className="flex space-x-2 pt-2">
                    <input
                      type="number"
                      placeholder="Add amount"
                      className="flex-1 px-3 py-2 border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddAmount(goal.id, e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input')
                        handleAddAmount(goal.id, input.value)
                        input.value = ''
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="Target" className="w-16 h-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-800 mb-2">No goals yet</h3>
          <p className="text-surface-600 mb-4">Create your first financial goal to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Create Goal
          </button>
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-surface-800">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingGoal(null)
                }}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field h-20 resize-none"
                  placeholder="Describe your goal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingGoal(null)
                  }}
                  className="flex-1 px-4 py-3 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default GoalsTab