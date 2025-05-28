import { motion } from 'framer-motion'

const BudgetsTab = ({ budgets }) => {
  return (
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
  )
}

export default BudgetsTab