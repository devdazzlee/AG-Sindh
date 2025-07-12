"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Upload, Scan, QrCode, Loader2, X, FileImage, Inbox, Plus, RefreshCw, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CameraModal } from "@/components/camera-modal"
import { QRScannerModal } from "@/components/qr-scanner-modal"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import apiClient from "@/lib/api-client"

interface IncomingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

interface IncomingRecord {
  id: string
  from: string
  to: string
  priority: string
  subject?: string
  description?: string
  filing?: string
  qrCode: string
  status: "RECEIVED" | "TRANSFERRED" | "COLLECTED" | "ARCHIVED"
  image?: string
  createdAt: string
  receivedDate: string
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

export function IncomingTab({ userRole }: IncomingTabProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    priority: "",
    subject: "",
    description: "",
    filing: "",
  })

  const [qrGenerated, setQrGenerated] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedQR, setScannedQR] = useState("")
  const [isCollecting, setIsCollecting] = useState(false)
  const [scannedLetter, setScannedLetter] = useState<any>(null)
  const { toast } = useToast()
  const [receivedDate, setReceivedDate] = useState<Date>()
  const [qrData, setQrData] = useState("")
  const [departments, setDepartments] = useState<any[]>([])
  const [uniqueQR, setUniqueQR] = useState(generateUniqueQR());
  const [incomingRecords, setIncomingRecords] = useState<IncomingRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchDepartments()
    fetchIncomingRecords()
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

  const fetchIncomingRecords = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/incoming")
      setIncomingRecords(response.data.records || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch incoming records",
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

  const handleQRScan = async (qrCode: string) => {
    setScannedQR(qrCode)
    setScannedLetter(null) // Reset previous letter details
    
    try {
      // Try to fetch letter details to show current status
      const response = await apiClient.get(`/incoming/qr/${qrCode}`)
      if (response.data.record) {
        setScannedLetter(response.data.record)
        toast({
          title: "QR Code Scanned",
          description: `Found letter: ${response.data.record.subject || 'No subject'} (Status: ${response.data.record.status})`,
        })
      } else {
        toast({
          title: "QR Code Scanned",
          description: `Successfully scanned QR code: ${qrCode}`,
        })
      }
    } catch (error) {
      // If letter not found, still show QR code scanned
      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned QR code: ${qrCode}`,
      })
    }
  }

  const handleCollectLetter = async () => {
    if (!scannedQR) {
      toast({
        title: "No QR Code",
        description: "Please scan a QR code first.",
        variant: "destructive",
      })
      return
    }

    setIsCollecting(true)
    try {
      // Call the fast QR code status update API
      const response = await apiClient.patch(`/incoming/qr/${scannedQR}/status`, {
        status: "COLLECTED"
      })

      if (response.data.success) {
        if (response.data.statusChanged) {
          toast({
            title: "Letter Collected Successfully!",
            description: response.data.message,
          })
          // Refresh the records list to show updated status
          fetchIncomingRecords()
        } else {
          toast({
            title: "Status Already Updated",
            description: response.data.message,
            variant: "default",
          })
        }
        setScannedQR("")
        setScannedLetter(null)
      } else {
        toast({
          title: "Collection Failed",
          description: response.data.error || "Failed to collect letter",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Letter Not Found",
          description: "No incoming letter found with this QR code. Please check the QR code and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Collection Failed",
          description: error.response?.data?.error || "Failed to collect letter. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsCollecting(false)
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
      formDataToSend.append('description', formData.description)
      formDataToSend.append('filing', formData.filing)
      formDataToSend.append('qrCode', uniqueQR)
      
      if (capturedImage) {
        // Convert base64 to blob for upload
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        formDataToSend.append('image', blob, 'document.jpg')
      }

      const response = await apiClient.post("/incoming", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast({
        title: "Success",
        description: "Incoming letter has been saved successfully.",
      })

      // Reset form
      setFormData({
        from: "",
        to: "",
        priority: "",
        subject: "",
        description: "",
        filing: "",
      })
      setCapturedImage(null)
      setQrGenerated(false)
      setUniqueQR(generateUniqueQR())
      
      // Refresh the records list
      fetchIncomingRecords()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error?.[0]?.message || "Failed to save incoming letter",
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
                  <h3>Incoming Letter QR Code</h3>
                  <div class="qr-code">
                    <img src="${qrDataUrl}" alt="QR Code" style="width: 150px; height: 150px;" />
                  </div>
                  <div class="qr-info">
                    <p><strong>QR Code:</strong> ${uniqueQR}</p>
                    <p><strong>From:</strong> ${formData.from}</p>
                    <p><strong>To:</strong> ${departments.find(d => d.id === formData.to)?.name || formData.to}</p>
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
      case 'RECEIVED':
        return 'default'
      case 'TRANSFERRED':
        return 'secondary'
      case 'COLLECTED':
        return 'outline'
      case 'ARCHIVED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

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
              <Button onClick={() => setIsQRScannerOpen(true)} className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Scan QR Code
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
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-800 font-medium">
                    QR Code Scanned Successfully
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">QR Code:</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">{scannedQR}</p>
                </div>
                {scannedLetter && (
                  <div className="mt-3 p-3 bg-white rounded border border-green-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Subject:</span>
                        <span className="text-sm text-gray-900">{scannedLetter.subject || 'No subject'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">From:</span>
                        <span className="text-sm text-gray-900">{scannedLetter.from}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">To:</span>
                        <span className="text-sm text-gray-900">{scannedLetter.department?.name || 'Unknown Department'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Current Status:</span>
                        <Badge variant={getStatusColor(scannedLetter.status)}>
                          {scannedLetter.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="max-w-sm mx-auto">
                <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
                  <QrCode className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Scan</h3>
                <p className="text-gray-600 mb-3">Point your camera at the QR code on the incoming letter</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Ensure good lighting</p>
                  <p>• Hold the QR code steady</p>
                  <p>• Keep the code clearly visible</p>
                </div>
              </div>
            </div>

            {scannedLetter?.status === "COLLECTED" ? (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-center">
                <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <Check className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Letter Already Collected</h3>
                <p className="text-sm text-blue-700 mb-4">
                  This letter has already been collected and marked as complete.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScannedQR("")
                    setScannedLetter(null)
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan New QR Code
                </Button>
              </div>
            ) : scannedLetter?.status === "ARCHIVED" ? (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg text-center">
                <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <X className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Letter Already Archived</h3>
                <p className="text-sm text-gray-700 mb-4">
                  This letter has been archived and is no longer available for collection.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScannedQR("")
                    setScannedLetter(null)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan New QR Code
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center mb-4">
                  <div className="bg-white rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <QrCode className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-green-800 mb-1">Ready to Collect</h3>
                  <p className="text-xs text-green-700">This letter can be marked as collected</p>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!scannedQR || isCollecting}
                  onClick={handleCollectLetter}
                >
                  {isCollecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Collecting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Collected
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={handleQRScan}
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
                <Select value={formData.to} onValueChange={(value) => handleInputChange("to", value)}>
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
                <CardTitle>Recent Incoming Records</CardTitle>
                <CardDescription>List of recently added incoming letters</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchIncomingRecords}
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
                {incomingRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No incoming records found
                  </div>
                ) : (
                  incomingRecords.slice(0, 3).map((record) => (
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
                      <p className="text-sm text-gray-600 truncate" title={record.from}>
                        From: {record.from}
                      </p>
                      <p className="text-sm text-gray-600 truncate" title={record.department?.name || 'Unknown Department'}>
                        To: {record.department?.name || 'Unknown Department'}
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