"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Upload, Scan, QrCode, Loader2, X, FileImage, Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CameraModal } from "@/components/camera-modal"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import { QRGenerator } from "@/components/qr-generator"
import { TimePicker } from "@/components/time-picker"

interface IncomingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function IncomingTab({ userRole }: IncomingTabProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    priority: "",
    receivedDate: "",
    receivedTime: "",
    subject: "",
    description: "",
    filing: "",
  })

  const [qrGenerated, setQrGenerated] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedQR, setScannedQR] = useState("")
  const { toast } = useToast()
  const [receivedDate, setReceivedDate] = useState<Date>()
  const [qrData, setQrData] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        toast({
          title: "File Uploaded",
          description: "Image uploaded successfully.",
        })
      }
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScanQR = async () => {
    setIsScanning(true)
    try {
      // Simulate QR scanning
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const scannedCode = "QR" + Math.random().toString(36).substr(2, 6).toUpperCase()
      setScannedQR(scannedCode)

      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned QR code: ${scannedCode}`,
      })
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to scan QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = () => {
    if (!formData.from || !formData.to || !formData.priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Letter Saved",
      description: "Incoming letter has been saved successfully.",
    })

    // Reset form
    setFormData({
      from: "",
      to: "",
      priority: "",
      receivedDate: "",
      receivedTime: "",
      subject: "",
      description: "",
      filing: "",
    })
    setCapturedImage(null)
    setQrGenerated(false)
  }

  // Hardcoded data for RD Department incoming records
  const incomingRecords = [
    {
      id: "QR001",
      from: "Education Department",
      to: "RD Department",
      priority: "High",
      date: "2024-01-15",
      subject: "Budget Allocation Request",
      status: "Pending",
    },
    {
      id: "QR002",
      from: "Water Department",
      to: "RD Department",
      priority: "Medium",
      date: "2024-01-14",
      subject: "Infrastructure Development",
      status: "In Progress",
    },
    {
      id: "QR003",
      from: "Health Department",
      to: "RD Department",
      priority: "High",
      date: "2024-01-13",
      subject: "Medical Equipment Purchase",
      status: "Completed",
    },
  ]

  if (userRole === "other_department") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scan QR Code to Collect Letter
            </CardTitle>
            <CardDescription>Scan the QR code from RD Department to collect your assigned letter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => setIsCameraOpen(true)} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Scan with Camera
              </Button>
              <Button
                variant="outline"
                onClick={handleScanQR}
                disabled={isScanning}
                className="flex items-center gap-2 bg-transparent"
              >
                {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                {isScanning ? "Scanning..." : "Use Scanner"}
              </Button>
            </div>

            {scannedQR && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-800 font-medium">
                    Scanned QR Code: <span className="font-mono">{scannedQR}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Point camera at QR code to scan</p>
              <p className="text-sm text-gray-500">Make sure the QR code is clearly visible and well-lit</p>
            </div>

            <Button
              className="w-full"
              disabled={!scannedQR}
              onClick={() => {
                toast({
                  title: "Status Updated",
                  description: "Letter status updated to 'Collected' successfully.",
                })
                setScannedQR("")
              }}
            >
              Update Status to Collected
            </Button>
          </CardContent>
        </Card>

        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
          title="Scan QR Code"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Add New Incoming Letter
            </CardTitle>
            <CardDescription>Scan or upload letter and fill the required information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Capture Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Document Image</Label>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => setIsCameraOpen(true)} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleScanQR}
                  disabled={isScanning}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                  {isScanning ? "Scanning..." : "Scanner"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {capturedImage ? (
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured document"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 bg-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No image captured</p>
                  <p className="text-sm text-gray-500">Use camera, scanner, or upload to add document image</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From *</Label>
                <Input
                  id="from"
                  value={formData.from}
                  onChange={(e) => handleInputChange("from", e.target.value)}
                  placeholder="Sender name"
                />
              </div>
              <div>
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                  placeholder="Recipient name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Received Date</Label>
                <DatePicker date={receivedDate} onDateChange={setReceivedDate} placeholder="Select received date" />
              </div>
              <div>
                <Label htmlFor="receivedTime">Received Time</Label>
                <TimePicker
                  value={formData.receivedTime}
                  onChange={(time) => handleInputChange("receivedTime", time)}
                  placeholder="Select received time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Letter subject"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Letter description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="filing">Filing</Label>
              <Input
                id="filing"
                value={formData.filing}
                onChange={(e) => handleInputChange("filing", e.target.value)}
                placeholder="Filing information"
              />
            </div>

            <div className="pt-4 border-t">
              <QRGenerator
                data={`${formData.from}-${formData.to}-${formData.subject}-${Date.now()}`}
                onGenerated={(qr) => setQrData(qr)}
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSubmit} variant="outline" className="ml-auto bg-transparent">
                Save Letter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Incoming Records</CardTitle>
            <CardDescription>List of recently added incoming letters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomingRecords.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{record.id}</span>
                    <Badge
                      variant={
                        record.priority === "High"
                          ? "destructive"
                          : record.priority === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {record.priority}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{record.subject}</p>
                  <p className="text-sm text-gray-600 mb-2">From: {record.from}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{record.date}</span>
                    <Badge variant="outline">{record.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Capture Document"
      />
    </div>
  )
}
