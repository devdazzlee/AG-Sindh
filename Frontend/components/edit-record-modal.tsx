"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, Upload, X, FileImage, Loader2, Edit, Save, User, Building, AlertTriangle, FileText, Hash } from "lucide-react"
import { CameraModal } from "@/components/camera-modal"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"

interface EditRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSave: (record: any) => void
  recordType?: "incoming" | "outgoing"
}

export function EditRecordModal({ isOpen, onClose, record, onSave, recordType }: EditRecordModalProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    priority: "",
    subject: "",
    description: "",
    filing: "",
  })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen])

  useEffect(() => {
    if (record) {
      setFormData({
        from: record.from || "",
        to: record.to || "",
        priority: record.priority || "",
        subject: record.subject || "",
        description: record.description || "",
        filing: record.filing || "",
      })
      setCapturedImage(record.image || null)
    }
  }, [record])

  const fetchDepartments = async () => {
    setIsLoadingDepartments(true)
    try {
      const response = await apiClient.get("/departments")
      setDepartments(response.data.departments || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDepartments(false)
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
      const updatedRecord = {
        ...record,
        ...formData,
        image: capturedImage,
      }
      await onSave(updatedRecord)
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update record.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  // Get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept ? dept.name : departmentId
  }

  // Get department ID by name
  const getDepartmentId = (departmentName: string) => {
    const dept = departments.find(d => d.name === departmentName)
    return dept ? dept.id : departmentName
  }

  if (!record) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div>Edit Record</div>
                <div className="text-sm font-mono text-blue-600 mt-1">{record.qrCode || record.id}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Header with Current Status */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-700">Editing Mode</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Current Priority:</span>
                  <Badge variant={getPriorityColor(record.priority)} className="px-3 py-1">
                    {record.priority}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Modified</div>
                <div className="font-medium">{new Date(record.updatedAt || record.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Record Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* QR Code Display */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        QR Code
                      </label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="font-mono text-sm font-medium text-gray-800 break-all">{record.qrCode || record.id}</p>
                      </div>
                    </div>

                    {/* From and To Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recordType === "outgoing" ? (
                        // Outgoing: From is department dropdown, To is text input
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="edit-from" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              From Department *
                            </Label>
                            <Select 
                              value={formData.from} 
                              onValueChange={(value) => handleInputChange("from", value)}
                              disabled={isLoadingDepartments}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department"} />
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
                          <div className="space-y-2">
                            <Label htmlFor="edit-to" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              To *
                            </Label>
                            <Input
                              id="edit-to"
                              value={formData.to}
                              onChange={(e) => handleInputChange("to", e.target.value)}
                              placeholder="Enter destination"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      ) : (
                        // Incoming: From is text input, To is department dropdown
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="edit-from" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              From *
                            </Label>
                            <Input
                              id="edit-from"
                              value={formData.from}
                              onChange={(e) => handleInputChange("from", e.target.value)}
                              placeholder="Sender name"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-to" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              To Department *
                            </Label>
                            <Select 
                              value={formData.to} 
                              onValueChange={(value) => handleInputChange("to", value)}
                              disabled={isLoadingDepartments}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department"} />
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
                        </>
                      )}
                    </div>

                    {/* Priority Field */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-priority" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Priority *
                      </Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subject Field */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-subject" className="text-sm font-semibold text-gray-600">Subject</Label>
                      <Input
                        id="edit-subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Enter letter subject"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description and Filing Fields - Only for incoming records */}
                    {recordType !== "outgoing" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-600">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Enter detailed description"
                            rows={4}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-filing" className="text-sm font-semibold text-gray-600">Filing Reference</Label>
                          <Input
                            id="edit-filing"
                            value={formData.filing}
                            onChange={(e) => handleInputChange("filing", e.target.value)}
                            placeholder="Enter filing information"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Document Image */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileImage className="h-5 w-5 text-blue-600" />
                      Document Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Upload Controls */}
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        onClick={() => setIsCameraOpen(true)} 
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="h-4 w-4" />
                        Camera
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => document.getElementById("edit-file-upload")?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>
                      <input id="edit-file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>

                    {/* Image Display */}
                    {capturedImage ? (
                      <div className="relative group">
                        <div className="overflow-hidden rounded-lg border shadow-sm">
                          <img
                            src={capturedImage}
                            alt="Document"
                            className="w-full h-auto max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCapturedImage(null)}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center p-6">
                          <div className="p-4 bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <FileImage className="h-8 w-8 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">No Document Image</h3>
                          <p className="text-sm text-gray-500">Use camera or upload to add document image</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={onClose} 
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Capture Document"
      />
    </>
  )
}
