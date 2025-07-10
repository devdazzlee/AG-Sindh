import { IncomingTab } from "./tabs/incoming-tab"
import { OutgoingTab } from "./tabs/outgoing-tab"
import { IncomingHistoryTab } from "./tabs/incoming-history-tab"
import { OutgoingHistoryTab } from "./tabs/outgoing-history-tab"
import { NotificationTab } from "./tabs/notification-tab"
import { LetterTrackingTab } from "./tabs/letter-tracking-tab"
import { CourierTrackingTab } from "./tabs/courier-tracking-tab"
import { DepartmentsTab } from "./tabs/departments-tab"
import { CourierServicesTab } from "./tabs/courier-services-tab"
import { SettingsTab } from "./tabs/settings-tab"

interface DashboardContentProps {
  activeTab: string
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function DashboardContent({ activeTab, userRole }: DashboardContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case "incoming":
        return <IncomingTab userRole={userRole} />
      case "outgoing":
        return <OutgoingTab userRole={userRole} />
      case "incoming-history":
        return <IncomingHistoryTab userRole={userRole} />
      case "outgoing-history":
        return <OutgoingHistoryTab userRole={userRole} />
      case "notification":
        return <NotificationTab userRole={userRole} />
      case "letter-tracking":
        return <LetterTrackingTab userRole={userRole} />
      case "courier-tracking":
        return <CourierTrackingTab userRole={userRole} />
      case "departments":
        return <DepartmentsTab />
      case "courier-services":
        return <CourierServicesTab />
      case "settings":
        return <SettingsTab />
      default:
        return <IncomingTab userRole={userRole} />
    }
  }

  return <div className="space-y-6">{renderContent()}</div>
}
