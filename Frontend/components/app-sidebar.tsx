"use client"

import {
  Inbox,
  Send,
  History,
  Bell,
  Search,
  Truck,
  Building2,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  userRole: "super_admin" | "rd_department" | "other_department"
  isCollapsed: boolean
  onToggle: () => void
}

const superAdminTabs = [
  { id: "departments", title: "Departments", icon: Building2 },
  { id: "courier-services", title: "Courier Services", icon: Truck },
  { id: "settings", title: "Settings", icon: Settings },
  { id: "incoming", title: "Incoming", icon: Inbox },
  { id: "outgoing", title: "Outgoing", icon: Send },
  { id: "incoming-history", title: "Incoming History", icon: History },
  { id: "outgoing-history", title: "Outgoing History", icon: History },
  { id: "notification", title: "Notification", icon: Bell },
  { id: "letter-tracking", title: "Letter Tracking", icon: Search },
  { id: "courier-tracking", title: "Courier Tracking", icon: Truck },
]

const rdDepartmentTabs = [
  { id: "incoming", title: "Incoming", icon: Inbox },
  { id: "outgoing", title: "Outgoing", icon: Send },
  { id: "incoming-history", title: "Incoming History", icon: History },
  { id: "outgoing-history", title: "Outgoing History", icon: History },
  { id: "notification", title: "Notification", icon: Bell },
  { id: "letter-tracking", title: "Letter Tracking", icon: Search },
  { id: "courier-tracking", title: "Courier Tracking", icon: Truck },
]

const otherDepartmentTabs = [
  { id: "incoming", title: "Incoming", icon: Inbox },
  { id: "incoming-history", title: "Incoming History", icon: History },
  { id: "outgoing-history", title: "Outgoing History", icon: History },
  { id: "notification", title: "Notification", icon: Bell },
]

export function AppSidebar({ activeTab, setActiveTab, userRole, isCollapsed, onToggle }: AppSidebarProps) {
  const getTabs = () => {
    switch (userRole) {
      case "super_admin":
        return superAdminTabs
      case "rd_department":
        return rdDepartmentTabs
      case "other_department":
        return otherDepartmentTabs
      default:
        return rdDepartmentTabs
    }
  }

  const tabs = getTabs()

  const getRoleDisplayName = () => {
    switch (userRole) {
      case "super_admin":
        return "Super Admin"
      case "rd_department":
        return "RD Department"
      case "other_department":
        return "Other Department"
      default:
        return "User"
    }
  }

  const SidebarButton = ({ tab }: { tab: any }) => {
    const isActive = activeTab === tab.id
    const button = (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-11 px-3",
          isActive ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-100 text-gray-700",
          isCollapsed && "justify-center px-0",
        )}
        onClick={() => setActiveTab(tab.id)}
      >
        <tab.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span className="truncate">{tab.title}</span>}
      </Button>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{tab.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-800 truncate">Ag Sindh</h2>
              <Badge variant="secondary" className="text-xs mt-1">
                {getRoleDisplayName()}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {!isCollapsed && (
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Navigation</p>
          )}
          {tabs.map((tab) => (
            <SidebarButton key={tab.id} tab={tab} />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full justify-start gap-3 h-10 text-gray-600 hover:bg-gray-100",
            isCollapsed && "justify-center px-0",
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
