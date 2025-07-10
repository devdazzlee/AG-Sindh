"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Truck, FileText, Clock } from "lucide-react"

interface NotificationTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function NotificationTab({ userRole }: NotificationTabProps) {
  // Hardcoded notifications data
  const notifications = [
    {
      id: 1,
      type: "incoming",
      title: "New Incoming Letter",
      message: "Education Department has sent a new letter regarding budget allocation",
      time: "2 minutes ago",
      read: false,
      icon: Mail,
      priority: "high",
    },
    {
      id: 2,
      type: "outgoing",
      title: "Letter Assigned to Courier",
      message: "Letter OUT001 has been assigned to courier service for delivery",
      time: "15 minutes ago",
      read: false,
      icon: Truck,
      priority: "medium",
    },
    {
      id: 3,
      type: "collection",
      title: "Letter Collected",
      message: "Water Department has collected their assigned letter QR002",
      time: "1 hour ago",
      read: true,
      icon: FileText,
      priority: "low",
    },
    {
      id: 4,
      type: "incoming",
      title: "High Priority Letter",
      message: "Health Department has sent an urgent letter about medical equipment",
      time: "2 hours ago",
      read: true,
      icon: Mail,
      priority: "high",
    },
    {
      id: 5,
      type: "system",
      title: "System Update",
      message: "Letter tracking system has been updated with new features",
      time: "1 day ago",
      read: true,
      icon: Bell,
      priority: "low",
    },
  ]

  const getNotificationsByRole = () => {
    if (userRole === "other_department") {
      return notifications.filter(
        (n) => n.type === "incoming" || (n.message.includes("assigned") && n.message.includes("Department")),
      )
    }
    return notifications
  }

  const filteredNotifications = getNotificationsByRole()
  const unreadCount = filteredNotifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const IconComponent = notification.icon
          return (
            <Card key={notification.id} className={`${!notification.read ? "border-blue-200 bg-blue-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      notification.priority === "high"
                        ? "bg-red-100 text-red-600"
                        : notification.priority === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            notification.priority === "high"
                              ? "destructive"
                              : notification.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h3>
            <p className="text-gray-500">You're all caught up! No new notifications at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
