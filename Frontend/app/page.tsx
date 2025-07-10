"use client"

import { LoginPage } from "@/components/login-page"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/components/auth-context"

export default function App() {
  const { isAuthenticated, user, logout, loading } = useAuth()

  const handleLogin = (role: "super_admin" | "rd_department" | "other_department") => {
    // Login is handled by the auth context, this is just for the callback
  }

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardLayout userRole={user?.role || "rd_department"} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  )
}
