import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from './ApperIcon'
import TransactionsTab from './TransactionsTab'
import BudgetsTab from './BudgetsTab'
import AnalyticsTab from './AnalyticsTab'

const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('transactions')
  
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
                  ? 'bg-blue-600 text-white shadow-card'
                  : 'text-surface-600 hover:text-blue-600 hover:bg-surface-50'
              }`}


            >
              <ApperIcon name={tab.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'transactions' && (
          <TransactionsTab 
            transactions={transactions}
            setTransactions={setTransactions}
            budgets={budgets}
            setBudgets={setBudgets}
          />
        )}
        
        {activeTab === 'budgets' && (
          <BudgetsTab budgets={budgets} />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsTab transactions={transactions} budgets={budgets} />
        )}
      </AnimatePresence>
    </section>
  )
}

export default MainFeature