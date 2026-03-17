'use client'

import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
