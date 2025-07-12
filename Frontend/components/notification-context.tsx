"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/lib/api-client'

interface NotificationContextType {
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
  updateUnreadCount: (count: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get("/notifications/unread-count")
      setUnreadCount(response.data.data.unreadCount || 0)
    } catch (error: any) {
      console.log("Failed to fetch unread count:", error)
    }
  }

  const refreshUnreadCount = async () => {
    await fetchUnreadCount()
  }

  const updateUnreadCount = (count: number) => {
    setUnreadCount(count)
  }

  useEffect(() => {
    fetchUnreadCount()
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, updateUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 