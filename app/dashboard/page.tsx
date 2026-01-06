/**
 * Dashboard Page
 * Main money view - heart of Save2740 application
 */

import { Metadata } from 'next'
import { DashboardContainer } from '@/components/dashboard/dashboard-container'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard | Save2740',
  description: 'Your daily savings progress and goal tracking',
}

export default function DashboardPage() {
  const YEARLY_GOAL = 27400 // $27,400 yearly goal
  const DAILY_SAVINGS = 27.40 // $27.40 daily contribution

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Your daily savings journey towards ${YEARLY_GOAL.toLocaleString()}
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Daily Goal</p>
              <p className="text-2xl font-bold text-primary mt-1">
                ${DAILY_SAVINGS.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Yearly Goal</p>
              <p className="text-2xl font-bold text-primary mt-1">
                ${YEARLY_GOAL.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Contribution Method</p>
              <p className="text-2xl font-bold text-primary mt-1">
                Daily Auto-Debit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4">
        {/* Info Alert */}
        <Alert className="my-6 bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-brand-green" />
          <AlertDescription className="text-brand-green">
            <strong>Save2740</strong> helps you save $27.40 daily to reach your $27,400 yearly savings goal.
            {' '}
            This consistent approach builds financial discipline and security.
          </AlertDescription>
        </Alert>

        {/* Dashboard Container with all components */}
        <DashboardContainer 
          goalAmount={YEARLY_GOAL}
        />

        {/* Footer Info */}
        <div className="my-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">How Save2740 Works</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Save <strong>$27.40 daily</strong> through automatic debit from your linked account</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Track your progress toward the <strong>$27,400 yearly goal</strong> in real-time</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Maintain your <strong>savings streak</strong> and unlock achievement milestones</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Celebrate <strong>milestone achievements</strong> at $500, $1K, $2.5K, $5K, $7.5K, and $10K</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">5.</span>
              <span>Access advanced features like auto-debit setup, payment disputes, and wallet management</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
