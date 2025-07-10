"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  userRole: "super_admin" | "rd_department" | "other_department"
  onLogout: () => void
}

export function DashboardLayout({ userRole, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("incoming")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          isCollapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn("flex-1 flex flex-col transition-all duration-300 ease-in-out", sidebarOpen ? "ml-64" : "ml-16")}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">{activeTab.replace("-", " ")}</h1>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <DashboardContent activeTab={activeTab} userRole={userRole} />
        </main>
      </div>
    </div>
  )
}
