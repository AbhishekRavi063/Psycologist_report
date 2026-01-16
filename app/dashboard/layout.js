// Dashboard layout component
// Provides navigation and logout functionality for all dashboard pages

import DashboardGuard from '@/components/DashboardGuard'
import DashboardNav from '@/components/DashboardNav'

export default function DashboardLayout({ children }) {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </DashboardGuard>
  )
}
