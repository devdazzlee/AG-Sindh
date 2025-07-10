"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, Truck, AlertCircle } from "lucide-react"

interface LetterTrackingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function LetterTrackingTab({ userRole }: LetterTrackingTabProps) {
  const [statusFilter, setStatusFilter] = useState("all")

  // Hardcoded tracking data
  const trackingData = [
    {
      id: "QR001",
      type: "Incoming",
      from: "Education Department",
      to: "RD Department",
      subject: "Budget Allocation Request",
      status: "Collected",
      assignedDate: "2024-01-15",
      collectedDate: "2024-01-15",
      priority: "High",
    },
    {
      id: "QR002",
      type: "Incoming",
      from: "Water Department",
      to: "RD Department",
      subject: "Infrastructure Development",
      status: "Pending",
      assignedDate: "2024-01-14",
      collectedDate: null,
      priority: "Medium",
    },
    {
      id: "OUT001",
      type: "Outgoing",
      from: "RD Department",
      to: "Courier Service",
      subject: "Document Delivery",
      status: "Handled to Courier",
      assignedDate: "2024-01-15",
      collectedDate: "2024-01-15",
      priority: "High",
    },
    {
      id: "OUT002",
      type: "Outgoing",
      from: "RD Department",
      to: "Education Department",
      subject: "Budget Approval",
      status: "Not Collected",
      assignedDate: "2024-01-14",
      collectedDate: null,
      priority: "Medium",
    },
    {
      id: "QR003",
      type: "Incoming",
      from: "Health Department",
      to: "RD Department",
      subject: "Medical Equipment Purchase",
      status: "In Progress",
      assignedDate: "2024-01-13",
      collectedDate: null,
      priority: "High",
    },
  ]

  const filteredData = trackingData.filter(
    (item) => statusFilter === "all" || item.status.toLowerCase().includes(statusFilter.toLowerCase()),
  )

  const updateStatus = (id: string, newStatus: string) => {
    // This would typically update the database
    alert(`Status updated for ${id} to: ${newStatus}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
      case "handled to courier":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
      case "not collected":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "in progress":
        return <Truck className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
      case "handled to courier":
        return "bg-green-100 text-green-800"
      case "pending":
      case "not collected":
        return "bg-yellow-100 text-yellow-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Letter Tracking</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Letter Status</CardTitle>
          <CardDescription>Monitor the status of incoming and outgoing letters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="not_collected">Not Collected</SelectItem>
                <SelectItem value="handled_to_courier">Handled to Courier</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QR Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From/To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {item.from}</div>
                      <div className="text-gray-500">To: {item.to}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.subject}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.priority === "High" ? "destructive" : item.priority === "Medium" ? "default" : "secondary"
                      }
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.assignedDate}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => updateStatus(item.id, value)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collected">Collected</SelectItem>
                        <SelectItem value="not_collected">Not Collected</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="handled_to_courier">Handled to Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No tracking records found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
