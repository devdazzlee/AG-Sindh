"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, FileText, AlertCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RecordDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit?: (record: any) => void
  onDelete?: (id: string) => void
}

export function RecordDetailsModal({ isOpen, onClose, record, onEdit, onDelete }: RecordDetailsModalProps) {
  const { toast } = useToast()

  if (!record) return null

  const handleEdit = () => {
    if (onEdit) {
      onEdit(record)
      toast({
        title: "Edit Mode",
        description: "Opening edit form for this record.",
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this record?")) {
      onDelete(record.id)
      toast({
        title: "Record Deleted",
        description: "The record has been deleted successfully.",
        variant: "destructive",
      })
      onClose()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
      case "collected":
        return "bg-green-100 text-green-800"
      case "in progress":
      case "in transit":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Letter Details
          </DialogTitle>
          <DialogDescription>Complete information about this letter record</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{record.subject || "No Subject"}</h3>
              <p className="text-sm text-gray-500 font-mono">{record.id}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getPriorityColor(record.priority)}>{record.priority}</Badge>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">From</p>
                  <p className="text-sm text-gray-600">{record.from}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">To</p>
                  <p className="text-sm text-gray-600">{record.to}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <Badge variant={getPriorityColor(record.priority)} className="mt-1">
                    {record.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-gray-600">{record.date || record.assignedDate}</p>
                </div>
              </div>

              {record.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-gray-600">{record.time}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(record.description || record.courierService || record.destination) && (
            <>
              <Separator />
              <div className="space-y-4">
                {record.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{record.description}</p>
                  </div>
                )}

                {record.courierService && (
                  <div>
                    <p className="text-sm font-medium mb-2">Courier Service</p>
                    <p className="text-sm text-gray-600">{record.courierService}</p>
                  </div>
                )}

                {record.destination && (
                  <div>
                    <p className="text-sm font-medium mb-2">Destination</p>
                    <p className="text-sm text-gray-600">{record.destination}</p>
                  </div>
                )}

                {record.filing && (
                  <div>
                    <p className="text-sm font-medium mb-2">Filing</p>
                    <p className="text-sm text-gray-600">{record.filing}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tracking Information */}
          {(record.letterCode || record.scannedDate || record.collectedDate) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Tracking Information</h4>

                {record.letterCode && (
                  <div>
                    <p className="text-sm font-medium">Letter Code</p>
                    <p className="text-sm text-gray-600 font-mono">{record.letterCode}</p>
                  </div>
                )}

                {record.scannedDate && (
                  <div>
                    <p className="text-sm font-medium">Scanned Date</p>
                    <p className="text-sm text-gray-600">{record.scannedDate}</p>
                  </div>
                )}

                {record.collectedDate && (
                  <div>
                    <p className="text-sm font-medium">Collected Date</p>
                    <p className="text-sm text-gray-600">{record.collectedDate}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="bg-transparent">
              Close
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
