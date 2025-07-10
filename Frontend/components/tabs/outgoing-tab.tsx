"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Upload, Scan, Loader2, X, FileImage, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CameraModal } from "@/components/camera-modal"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import { QRGenerator } from "@/components/qr-generator"
import { TimePicker } from "@/components/time-picker"

interface OutgoingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function OutgoingTab({ userRole }: OutgoingTabProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    priority: "",
    receivedDate: "",
    receivedTime: "",
    subject: "",
  })

  const [qrGenerated, setQrGenerated] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()
  const [receivedDate, setReceivedDate] = useState<Date>()

  const handleGenerateQR = async () => {
    if (!formData.from || !formData.to || !formData.priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in From, To, and Priority fields before generating QR code.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingQR(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const qrCode = `OUT${Date.now().toString().slice(-6)}`
      setQrGenerated(true)

      toast({
        title: "QR Code Generated",
        description: `Outgoing QR Code ${qrCode} generated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingQR(false)
    }
  }

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
      reader.readAsDataURL(file)
    }
  }

  const handleScanQR = async () => {
    setIsScanning(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Document Scanned",
        description: "Document scanned successfully.",
      })
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to scan document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Hardcoded data for outgoing records
  const outgoingRecords = [
    {
      id: "OUT001",
      from: "RD Department",
      to: "Courier Service",
      priority: "High",
      date: "2024-01-15",
      subject: "Document Delivery",
      status: "Dispatched",
    },
    {
      id: "OUT002",
      from: "RD Department",
      to: "Education Department",
      priority: "Medium",
      date: "2024-01-14",
      subject: "Budget Approval",
      status: "In Transit",
    },
    {
      id: "OUT003",
      from: "RD Department",
      to: "Water Department",
      priority: "Low",
      date: "2024-01-13",
      subject: "Project Update",
      status: "Delivered",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Add Outgoing Letter
            </CardTitle>
            <CardDescription>Process letters from other departments to courier or other departments</CardDescription>
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
                  onClick={() => document.getElementById("outgoing-file-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <input
                  id="outgoing-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From *</Label>
                <Select value={formData.from} onValueChange={(value) => handleInputChange("from", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education Department</SelectItem>
                    <SelectItem value="water">Water Department</SelectItem>
                    <SelectItem value="health">Health Department</SelectItem>
                    <SelectItem value="transport">Transport Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to">To *</Label>
                <Select value={formData.to} onValueChange={(value) => handleInputChange("to", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courier">Courier Service</SelectItem>
                    <SelectItem value="education">Education Department</SelectItem>
                    <SelectItem value="water">Water Department</SelectItem>
                    <SelectItem value="health">Health Department</SelectItem>
                    <SelectItem value="transport">Transport Department</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="receivedDate">Received Date</Label>
                <DatePicker date={receivedDate} onDateChange={setReceivedDate} />
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

            <div className="pt-4 border-t">
              <QRGenerator
                data={
                  formData.from && formData.to && formData.priority
                    ? `OUT-${formData.from}-${formData.to}-${formData.priority}-${Date.now()}`
                    : ""
                }
                onGenerated={(qr) => {
                  setQrGenerated(true)
                  toast({
                    title: "QR Generated",
                    description: "Outgoing QR code generated successfully",
                  })
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Outgoing Records</CardTitle>
            <CardDescription>List of recently processed outgoing letters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outgoingRecords.map((record) => (
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
                  <p className="text-sm text-gray-600 mb-2">To: {record.to}</p>
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
