import { motion } from 'framer-motion'
import Chart from 'react-apexcharts'
import ApperIcon from './ApperIcon'

const AnalyticsTab = ({ transactions, budgets }) => {
  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Rent', 'Groceries', 'Transportation', 'Entertainment', 'Dining Out', 'Utilities', 'Healthcare', 'Shopping', 'Other']
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

  return (
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
  )
}

export default AnalyticsTab