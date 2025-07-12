"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Upload, Scan, Loader2, X, FileImage, Send, QrCode, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CameraModal } from "@/components/camera-modal"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import { QRGenerator } from "@/components/qr-generator"
import { TimePicker } from "@/components/time-picker"
import apiClient from "@/lib/api-client"

interface OutgoingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

interface OutgoingRecord {
  id: string
  from: string
  to: string
  priority: string
  subject?: string
  qrCode: string
  status: "PENDING_DISPATCH" | "DISPATCHED" | "DELIVERED" | "RETURNED"
  image?: string
  createdAt: string
  dispatchedDate?: string
  deliveredDate?: string
  department?: {
    id: string
    name: string
    code: string
  }
}

const generateUniqueQR = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // fallback for environments without crypto.randomUUID
    return Math.random().toString(36).substr(2, 9) + Date.now();
  }
};

export function OutgoingTab({ userRole }: OutgoingTabProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    priority: "",
    subject: "",
  })

  const [qrGenerated, setQrGenerated] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()
  const [receivedDate, setReceivedDate] = useState<Date>()
  const [qrData, setQrData] = useState("")
  const [departments, setDepartments] = useState<any[]>([])
  const [uniqueQR, setUniqueQR] = useState(generateUniqueQR());
  const [outgoingRecords, setOutgoingRecords] = useState<OutgoingRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchDepartments()
    fetchOutgoingRecords()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get("/departments")
      setDepartments(response.data.departments || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      })
    }
  }

  const fetchOutgoingRecords = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/outgoing")
      setOutgoingRecords(response.data.data?.records || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch outgoing records",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const handleSubmit = async () => {
    if (!formData.from || !formData.to || !formData.priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('from', formData.from)
      formDataToSend.append('to', formData.to)
      formDataToSend.append('priority', formData.priority)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('qrCode', uniqueQR)
      
      if (capturedImage) {
        // Convert base64 to blob for upload
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        formDataToSend.append('image', blob, 'document.jpg')
      }

      const response = await apiClient.post("/outgoing", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast({
        title: "Success",
        description: "Outgoing letter has been saved successfully.",
      })

      // Reset form
      setFormData({
        from: "",
        to: "",
        priority: "",
        subject: "",
      })
      setCapturedImage(null)
      setQrGenerated(false)
      setUniqueQR(generateUniqueQR())
      
      // Refresh the records list
      fetchOutgoingRecords()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error?.[0]?.message || "Failed to save outgoing letter",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateQRAndSave = async () => {
    if (!formData.from || !formData.to || !formData.priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingQR(true)
    try {
      // Generate QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uniqueQR)}`
      
      // Create image element to load QR code
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = qrUrl
      })

      // Create canvas and draw QR code
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, 200, 200)
        ctx.drawImage(img, 0, 0, 200, 200)

        const qrDataUrl = canvas.toDataURL("image/png")
        setQrData(qrDataUrl)

        // Print QR code automatically
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>QR Code - ${uniqueQR}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: Arial, sans-serif; 
                    text-align: center;
                  }
                  .qr-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                  }
                  .qr-code {
                    border: 1px solid #ccc;
                    padding: 10px;
                  }
                  .qr-info {
                    margin-top: 10px;
                    font-size: 12px;
                  }
                  @media print {
                    body { margin: 0; }
                    .qr-container { page-break-inside: avoid; }
                  }
                </style>
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                      setTimeout(function() {
                        window.close();
                      }, 1000);
                    }, 500);
                  };
                </script>
              </head>
              <body>
                <div class="qr-container">
                  <h3>Outgoing Letter QR Code</h3>
                  <div class="qr-code">
                    <img src="${qrDataUrl}" alt="QR Code" style="width: 150px; height: 150px;" />
                  </div>
                  <div class="qr-info">
                    <p><strong>QR Code:</strong> ${uniqueQR}</p>
                    <p><strong>From:</strong> ${departments.find(d => d.id === formData.from)?.name || formData.from}</p>
                    <p><strong>To:</strong> ${formData.to}</p>
                    <p><strong>Priority:</strong> ${formData.priority}</p>
                    <p><strong>Subject:</strong> ${formData.subject || 'N/A'}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                </div>
              </body>
            </html>
          `)
          printWindow.document.close()
        }

        toast({
          title: "QR Code Generated",
          description: "QR code has been generated and printed successfully.",
        })

        // Now save the letter
        await handleSubmit()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_DISPATCH':
        return 'default'
      case 'DISPATCHED':
        return 'secondary'
      case 'DELIVERED':
        return 'outline'
      case 'RETURNED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Filter records based on user role
  const getFilteredRecords = () => {
    if (userRole === "super_admin") {
      return outgoingRecords; // Super admin sees all records
    } else if (userRole === "rd_department") {
      return outgoingRecords; // RD department sees all records
    } else {
      // Other departments only see records from their department
      return outgoingRecords.filter(record => record.from === departments.find(d => d.id === record.from)?.id);
    }
  }

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
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} {dept.code ? `(${dept.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                  placeholder="Enter destination"
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
              <Button 
                onClick={handleGenerateQRAndSave} 
                disabled={isGeneratingQR || isSubmitting}
                className="w-full"
              >
                {isGeneratingQR || isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isGeneratingQR ? "Generating QR..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR & Save Letter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
            <CardTitle>Recent Outgoing Records</CardTitle>
            <CardDescription>List of recently processed outgoing letters</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchOutgoingRecords}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
            <div className="space-y-4">
                {getFilteredRecords().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No outgoing records found
                  </div>
                ) : (
                  getFilteredRecords().slice(0, 3).map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-medium">{record.qrCode}</span>
                        <Badge variant={getPriorityColor(record.priority)}>
                      {record.priority}
                    </Badge>
                  </div>
                      <p className="font-medium text-gray-900 truncate" title={record.subject || 'No subject'}>
                        {record.subject || 'No subject'}
                      </p>
                      <p className="text-sm text-gray-600 truncate" title={record.department?.name || 'Unknown Department'}>
                        From: {record.department?.name || 'Unknown Department'}
                      </p>
                      <p className="text-sm text-gray-600 truncate" title={record.to}>
                        To: {record.to}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                  </div>
                </div>
                  ))
                )}
            </div>
            )}
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
