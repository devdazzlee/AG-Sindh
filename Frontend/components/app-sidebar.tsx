"use client";
import {
  Inbox,
  Send,
  History,
  Bell,
  Search,
  Truck,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: "super_admin" | "rd_department" | "other_department";
  unreadNotifications?: number;
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
];

const rdDepartmentTabs = [
  { id: "incoming", title: "Incoming", icon: Inbox },
  { id: "outgoing", title: "Outgoing", icon: Send },
  { id: "incoming-history", title: "Incoming History", icon: History },
  { id: "outgoing-history", title: "Outgoing History", icon: History },
  { id: "notification", title: "Notification", icon: Bell },
  { id: "letter-tracking", title: "Letter Tracking", icon: Search },
  { id: "courier-tracking", title: "Courier Tracking", icon: Truck },
];

const otherDepartmentTabs = [
  { id: "incoming", title: "Incoming", icon: Inbox },
  { id: "incoming-history", title: "Incoming History", icon: History },
  { id: "outgoing-history", title: "Outgoing History", icon: History },
  { id: "notification", title: "Notification", icon: Bell },
];

export function AppSidebar({
  activeTab,
  setActiveTab,
  userRole,
  unreadNotifications = 0,
}: AppSidebarProps) {
  const { state: sidebarState, toggleSidebar } = useSidebar(); // Use useSidebar hook
  const isCollapsed = sidebarState === "collapsed";

  const getTabs = () => {
    switch (userRole) {
      case "super_admin":
        return superAdminTabs;
      case "rd_department":
        return rdDepartmentTabs;
      case "other_department":
        return otherDepartmentTabs;
      default:
        return rdDepartmentTabs;
    }
  };
  const tabs = getTabs();

  const SidebarButton = ({ tab }: { tab: any }) => {
    const isActive = activeTab === tab.id;
    const showNotificationBadge =
      tab.id === "notification" && unreadNotifications > 0;

    const buttonContent = (
      <>
        <div className="relative">
          <tab.icon className="h-5 w-5 flex-shrink-0" />
          {showNotificationBadge && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </Badge>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center justify-between flex-1">
            <span className="truncate">{tab.title}</span>
            {showNotificationBadge && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </Badge>
            )}
          </div>
        )}
      </>
    );

    const button = (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-11 px-3 relative",
          isActive
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "hover:bg-gray-100 text-gray-700",
          isCollapsed && "justify-center px-0"
        )}
        onClick={() => setActiveTab(tab.id)}
      >
        {buttonContent}
      </Button>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{tab.title}</p>
              {showNotificationBadge && (
                <p className="text-xs text-red-600 mt-1">
                  {unreadNotifications} unread notification
                  {unreadNotifications !== 1 ? "s" : ""}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return button;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center w-full max-h-24">
          {" "}
          {/* max-h-24 = 6rem = 96px */}
          <Image
            src={"/Logo2.png"} // Using placeholder as original image not provided
            alt="Logo"
            className="w-full h-auto object-contain"
            width={300}
            height={96}
          />
        </div>
      </div>
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {!isCollapsed && (
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
              Navigation
            </p>
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
          onClick={toggleSidebar} // Use toggleSidebar from useSidebar
          className={cn(
            "w-full justify-start gap-3 h-10 text-gray-600 hover:bg-gray-100",
            isCollapsed && "justify-center px-0"
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
  );
}
