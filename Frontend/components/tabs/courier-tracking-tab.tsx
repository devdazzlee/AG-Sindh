"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Camera, Scan, CheckCircle, Clock, Truck, Loader2 } from "lucide-react"
import { CameraModal } from "@/components/camera-modal"

interface CourierTrackingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function CourierTrackingTab({ userRole }: CourierTrackingTabProps) {
  const [scanMode, setScanMode] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Hardcoded courier tracking data
  const courierData = [
    {
      id: "OUT001",
      letterCode: "QR001",
      destination: "Education Department",
      courierService: "Fast Courier",
      subject: "Budget Allocation Documents",
      status: "Ready for Courier",
      priority: "High",
      assignedDate: "2024-01-15",
      scannedDate: null,
    },
    {
      id: "OUT002",
      letterCode: "QR002",
      destination: "Water Department",
      courierService: "Express Delivery",
      subject: "Infrastructure Approval",
      status: "Handed to Courier",
      priority: "Medium",
      assignedDate: "2024-01-14",
      scannedDate: "2024-01-14",
    },
    {
      id: "OUT003",
      letterCode: "QR003",
      destination: "Health Department",
      courierService: "Quick Post",
      subject: "Medical Equipment Approval",
      status: "In Transit",
      priority: "High",
      assignedDate: "2024-01-13",
      scannedDate: "2024-01-13",
    },
    {
      id: "OUT004",
      letterCode: "QR004",
      destination: "Transport Department",
      courierService: "Fast Courier",
      subject: "Vehicle Maintenance Budget",
      status: "Delivered",
      priority: "Low",
      assignedDate: "2024-01-12",
      scannedDate: "2024-01-12",
    },
  ]

  const handleScan = async (id: string) => {
    setIsScanning(true)
    // Simulate scanning process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsScanning(false)
    alert(`Letter ${id} scanned successfully and handed to courier!`)
  }

  const handleCameraCapture = (imageData: string) => {
    // Handle captured image
    alert("Document captured successfully!")
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "handed to courier":
      case "in transit":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "ready for courier":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "handed to courier":
      case "in transit":
        return "bg-blue-100 text-blue-800"
      case "ready for courier":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courier Tracking</h1>
      </div>

      {scanMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <Scan className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Scanning in Progress...</h3>
              <p className="text-blue-600">Please wait while we process the scan</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scan Before Courier Handover</CardTitle>
          <CardDescription>Scan letters before giving them to courier service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={() => setIsCameraOpen(true)} className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan with Camera
            </Button>
            <Button
              variant="outline"
              onClick={() => handleScan("manual")}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
              {isScanning ? "Scanning..." : "Use Scanner"}
            </Button>
          </div>

          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center mb-6">
            <p className="text-gray-500">Scan QR code on letter before handing to courier</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Courier Tracking Records</CardTitle>
          <CardDescription>Track letters assigned to courier services</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Letter Code</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Courier Service</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courierData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.letterCode}</TableCell>
                  <TableCell>{item.destination}</TableCell>
                  <TableCell>{item.courierService}</TableCell>
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
                    {item.status === "Ready for Courier" ? (
                      <Button
                        size="sm"
                        onClick={() => handleScan(item.id)}
                        disabled={isScanning}
                        className="flex items-center gap-2"
                      >
                        {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                        {isScanning ? "Scanning..." : "Scan & Hand to Courier"}
                      </Button>
                    ) : (
                      <Badge variant="outline">
                        {item.scannedDate ? `Scanned: ${item.scannedDate}` : "Not Scanned"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {courierData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No courier tracking records found.</div>
          )}
        </CardContent>
      </Card>
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Scan Document"
      />
    </div>
  )
}
