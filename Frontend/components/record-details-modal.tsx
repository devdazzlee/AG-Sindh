"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileImage, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  Hash,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Archive,
  Send
} from "lucide-react"

interface RecordDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit: (record: any) => void
  onDelete: (record: any) => void
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function RecordDetailsModal({ isOpen, onClose, record, onEdit, onDelete, userRole }: RecordDetailsModalProps) {
  if (!record) return null

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
    switch (status.toLowerCase()) {
      case 'received':
      case 'pending':
        return 'default'
      case 'transferred':
      case 'in progress':
      case 'dispatched':
      case 'handled to courier':
        return 'secondary'
      case 'collected':
      case 'delivered':
        return 'outline'
      case 'archived':
      case 'returned':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'transferred':
      case 'in progress':
      case 'dispatched':
      case 'handled to courier':
        return <Send className="h-4 w-4" />
      case 'collected':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'archived':
      case 'returned':
        return <Archive className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Invalid Date"
    }
  }

  const isTrackingRecord = record.type === "incoming" || record.type === "outgoing"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div>Record Details</div>
              <div className="text-sm font-mono text-blue-600 mt-1">{record.qrCode || record.id}</div>
              {isTrackingRecord && (
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {record.type} Letter
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Header with Status and Priority */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(record.status)}
                <span className="font-medium text-gray-700">Status:</span>
                <Badge variant={getStatusColor(record.status)} className="px-3 py-1">
                  {record.status}
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Priority:</span>
                <Badge variant={getPriorityColor(record.priority)} className="px-3 py-1">
                  {record.priority}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Created</div>
              <div className="font-medium">{formatDate(record.createdAt)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        QR Code
                      </label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="font-mono text-sm font-medium text-gray-800 break-all">{record.qrCode || record.id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        From
                      </label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm font-medium text-gray-800 break-words">{record.from}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        To
                      </label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm font-medium text-gray-800 break-words">
                          {isTrackingRecord ? record.to : (record.department?.name || record.to || 'Unknown Department')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {isTrackingRecord ? 'Assigned Date' : 'Received Date'}
                      </label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(isTrackingRecord ? record.assignedDate : record.receivedDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {record.subject && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600">Subject</label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm text-gray-800 break-words">{record.subject}</p>
                      </div>
                    </div>
                  )}

                  {record.description && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600">Description</label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{record.description}</p>
                      </div>
                    </div>
                  )}

                  {record.filing && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600">Filing Reference</label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm font-medium text-gray-800 break-words">{record.filing}</p>
                      </div>
                    </div>
                  )}

                  {/* Additional dates for tracking records */}
                  {isTrackingRecord && record.type === "outgoing" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {record.dispatchedDate && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-600">Dispatched Date</label>
                          <div className="p-3 bg-gray-50 border rounded-lg">
                            <p className="text-sm font-medium text-gray-800">{formatDate(record.dispatchedDate)}</p>
                          </div>
                        </div>
                      )}
                      {record.deliveredDate && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-600">Delivered Date</label>
                          <div className="p-3 bg-gray-50 border rounded-lg">
                            <p className="text-sm font-medium text-gray-800">{formatDate(record.deliveredDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isTrackingRecord && record.type === "incoming" && record.collectedDate && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600">Collected Date</label>
                      <div className="p-3 bg-gray-50 border rounded-lg">
                        <p className="text-sm font-medium text-gray-800">{formatDate(record.collectedDate)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons - Only show for non-tracking records */}
              {userRole === "super_admin" && !isTrackingRecord && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          onEdit(record)
                          onClose()
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Record
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onDelete(record)
                          onClose()
                        }}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                <CardContent>
                  {record.image ? (
                    <div className="relative group">
                      <div className="overflow-hidden rounded-lg border shadow-sm">
                        <img
                          src={record.image}
                          alt="Document"
                          className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="text-center p-6">
                            <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-medium">Image not available</p>
                            <p className="text-xs text-gray-400 mt-1">The document image could not be loaded</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(record.image, '_blank')}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center p-6">
                        <div className="p-4 bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <FileImage className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Document Image</h3>
                        <p className="text-sm text-gray-500">This record doesn't have an attached document image</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Record Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <span className="text-sm text-gray-600">{formatDate(record.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {isTrackingRecord ? 'Assigned' : 'Received'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(isTrackingRecord ? record.assignedDate : record.receivedDate)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
