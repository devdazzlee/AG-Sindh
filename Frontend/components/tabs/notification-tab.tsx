"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Truck, FileText, Clock, Loader2, RefreshCw, Trash2, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-context"
import apiClient from "@/lib/api-client"

interface NotificationTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

interface Notification {
  id: string
  message: string
  isRead: boolean
  createdAt: string
  incoming?: {
    id: string
    qrCode: string
    subject?: string
    priority: string
    department?: {
      name: string
    }
  }
  department?: {
    id: string
    name: string
  }
}

export function NotificationTab({ userRole }: NotificationTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0)
  const { toast } = useToast()
  const { unreadCount, refreshUnreadCount, updateUnreadCount } = useNotifications()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Play sound when unread count increases
  useEffect(() => {
    if (isSoundEnabled && unreadCount > previousUnreadCount && previousUnreadCount > 0) {
      playNotificationSound()
    }
    setPreviousUnreadCount(unreadCount)
  }, [unreadCount, isSoundEnabled, previousUnreadCount])

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error)
        })
      }
    } catch (error) {
      console.log('Audio play failed:', error)
    }
  }

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/notifications")
      setNotifications(response.data.data.notifications || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
      
      // Update unread count
      updateUnreadCount(Math.max(0, unreadCount - 1))
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true)
    try {
      await apiClient.patch("/notifications/mark-all-read")
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      
      // Update unread count to 0
      updateUnreadCount(0)
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mark all notifications as read",
        variant: "destructive",
      })
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`)
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      // Update unread count if it was unread
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.isRead) {
        updateUnreadCount(Math.max(0, unreadCount - 1))
      }
      
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled)
    toast({
      title: isSoundEnabled ? "Sound Disabled" : "Sound Enabled",
      description: isSoundEnabled ? "Notification sounds are now off" : "Notification sounds are now on",
    })
  }

  const getNotificationIcon = (message: string) => {
    if (message.toLowerCase().includes('incoming')) return Mail
    if (message.toLowerCase().includes('courier') || message.toLowerCase().includes('delivery')) return Truck
    if (message.toLowerCase().includes('collected') || message.toLowerCase().includes('status')) return FileText
    return Bell
  }

  const getNotificationPriority = (message: string, incoming?: any) => {
    if (incoming?.priority) {
      return incoming.priority.toLowerCase()
    }
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('high priority')) return 'high'
    if (message.toLowerCase().includes('medium')) return 'medium'
    return 'low'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/mixkit-bell-notification-933.wav" type="audio/wav" />
      </audio>

      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            variant="outline"
            onClick={toggleSound}
            size="sm"
            title={isSoundEnabled ? "Disable sound" : "Enable sound"}
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead || unreadCount === 0}
          >
            {isMarkingAllRead ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Marking...
              </>
            ) : (
              "Mark All as Read"
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h3>
                <p className="text-gray-500">You're all caught up! No new notifications at this time.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.message)
              const priority = getNotificationPriority(notification.message, notification.incoming)
              
              return (
                <Card key={notification.id} className={`${!notification.isRead ? "border-blue-200 bg-blue-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          priority === "high"
                            ? "bg-red-100 text-red-600"
                            : priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">
                            {notification.incoming?.subject || 'Incoming Letter'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                priority === "high"
                                  ? "destructive"
                                  : priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {priority}
                            </Badge>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        {notification.incoming?.qrCode && (
                          <p className="text-sm text-gray-500 mb-2">
                            QR Code: <span className="font-mono">{notification.incoming.qrCode}</span>
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
