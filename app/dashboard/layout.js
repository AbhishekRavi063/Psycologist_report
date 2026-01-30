// Dashboard layout component
// Provides navigation and logout functionality for all dashboard pages

import DashboardGuard from '@/components/DashboardGuard'
import DashboardNav from '@/components/DashboardNav'

export default function DashboardLayout({ children }) {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <DashboardNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
          {children}
        </main>
      </div>
    </DashboardGuard>
  )
}
