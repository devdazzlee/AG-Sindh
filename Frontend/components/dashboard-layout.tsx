"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard-content";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import apiClient from "@/lib/api-client";

interface DashboardLayoutProps {
  userRole: "super_admin" | "rd_department" | "other_department";
  onLogout: () => void;
}

export function DashboardLayout({ userRole, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("incoming");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
    // Set up interval to fetch unread notifications every 60 seconds (increased from 30)
    const interval = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications/unread-count");
      setUnreadNotifications(response.data.data.unreadCount || 0);
    } catch (error) {
      console.log("Failed to fetch unread notifications:", error);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="offcanvas">
        {" "}
        {/* Use "offcanvas" for mobile responsiveness */}
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          unreadNotifications={unreadNotifications}
        />
      </Sidebar>
      {/* Main Content */}
      <SidebarInset>
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />{" "}
            {/* Use SidebarTrigger for toggling */}
            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {activeTab.replace("-", " ")}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex items-center gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <DashboardContent activeTab={activeTab} userRole={userRole} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
