"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, FileImage } from "lucide-react"

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Record Details - {record.qrCode || record.id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(record.priority)}>
                    {record.priority}
                  </Badge>
                  <Badge variant={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">QR Code</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{record.qrCode || record.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">From</label>
                  <p className="text-sm">{record.from}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">To Department</label>
                <p className="text-sm">{record.department?.name || record.to || 'Unknown Department'}</p>
              </div>

              {record.subject && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <p className="text-sm">{record.subject}</p>
                </div>
              )}

              {record.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm whitespace-pre-wrap">{record.description}</p>
                </div>
              )}

              {record.filing && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Filing</label>
                  <p className="text-sm">{record.filing}</p>
                </div>
              )}
            </div>

            {userRole === "super_admin" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    onEdit(record)
                    onClose()
                  }}
                  className="flex-1"
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
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Document Image</h3>
            {record.image ? (
              <div className="relative">
                <img
                  src={record.image}
                  alt="Document"
                  className="w-full h-auto max-h-[400px] object-contain border rounded-lg shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 border rounded-lg">
                  <div className="text-center">
                    <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Image not available</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-100 border rounded-lg">
                <div className="text-center">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
