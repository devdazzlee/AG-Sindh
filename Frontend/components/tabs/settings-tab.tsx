"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Shield, Database } from "lucide-react"

export function SettingsTab() {
  const [settings, setSettings] = useState({
    systemName: "Ag Sindh Dashboard",
    adminEmail: "admin@agsindh.gov.pk",
    notificationsEnabled: true,
    autoBackup: true,
    qrCodeExpiry: "30",
    maxFileSize: "10",
    sessionTimeout: "60",
  })

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // This would typically save to database
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <Button onClick={handleSaveSettings}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Configure basic system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => handleSettingChange("systemName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange("adminEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Notifications</Label>
                <p className="text-sm text-gray-500">Receive system notifications</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-gray-500">Automatically backup data daily</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and access settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="qrCodeExpiry">QR Code Expiry (days)</Label>
              <Input
                id="qrCodeExpiry"
                type="number"
                value={settings.qrCodeExpiry}
                onChange={(e) => handleSettingChange("qrCodeExpiry", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange("maxFileSize", e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Change Admin Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Maintenance
            </CardTitle>
            <CardDescription>System maintenance and backup options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full bg-transparent">
              Backup Database
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Clear System Logs
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Export Reports
            </Button>
            <Separator />
            <div className="text-sm text-gray-500">
              <p>Last Backup: 2024-01-15 10:30 AM</p>
              <p>System Version: 1.0.0</p>
              <p>Database Size: 45.2 MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
