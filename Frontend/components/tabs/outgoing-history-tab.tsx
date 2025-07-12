"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, Trash2, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecordDetailsModal } from "@/components/record-details-modal"
import { EditRecordModal } from "@/components/edit-record-modal"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface OutgoingHistoryTabProps {
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

export function OutgoingHistoryTab({ userRole }: OutgoingHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<OutgoingRecord | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [records, setRecords] = useState<OutgoingRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<OutgoingRecord | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchRecords()
  }, [pagination.currentPage])

  const fetchRecords = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/outgoing?page=${page}&limit=30`)
      setRecords(response.data.data?.records || [])
      setPagination({
        currentPage: response.data.data?.currentPage || 1,
        totalPages: response.data.data?.totalPages || 1,
        total: response.data.data?.total || 0,
        hasMore: response.data.data?.hasMore || false
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error?.[0]?.message || "Failed to fetch records",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const filteredHistory = records.filter((item) => {
    const matchesSearch =
      item.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesPriority = filterPriority === "all" || item.priority.toLowerCase() === filterPriority
    const matchesStatus = filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleViewDetails = (record: OutgoingRecord) => {
    setSelectedRecord(record)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (record: OutgoingRecord) => {
    if (userRole !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only super admins can edit records.",
        variant: "destructive",
      })
      return
    }
    setSelectedRecord(record)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (updatedRecord: any) => {
    try {
      const formData = new FormData()

      // Add all non-image fields
      Object.keys(updatedRecord).forEach(key => {
        if (key !== 'id' && key !== 'image' && updatedRecord[key] !== undefined && updatedRecord[key] !== '') {
          formData.append(key, updatedRecord[key])
        }
      })

      // Handle image separately - only upload if it's a new image (base64)
      if (updatedRecord.image && typeof updatedRecord.image === 'string' && updatedRecord.image.startsWith('data:')) {
        // Convert base64 to blob for upload
        const response = await fetch(updatedRecord.image)
        const blob = await response.blob()
        formData.append('image', blob, 'document.jpg')
      }
      // If image is a URL (existing image), don't include it in the update

      await apiClient.put(`/outgoing/${updatedRecord.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Refresh the records
      await fetchRecords(pagination.currentPage)

      toast({
        title: "Record Updated",
        description: `Record ${updatedRecord.qrCode} has been updated successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error?.[0]?.message || "Failed to update record",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (record: OutgoingRecord) => {
    if (userRole !== "super_admin") {
    toast({
        title: "Access Denied",
        description: "Only super admins can delete records.",
        variant: "destructive",
      })
      return
    }
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return

    setIsDeleting(recordToDelete.id)
    try {
      await apiClient.delete(`/outgoing/${recordToDelete.id}`)

      // Remove from local state
      setRecords(records.filter((record) => record.id !== recordToDelete.id))

    toast({
      title: "Record Deleted",
        description: `Record has been deleted successfully.`,
        variant: "destructive",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error?.[0]?.message || "Failed to delete record",
      variant: "destructive",
    })
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Outgoing History</h1>
        <Button
          onClick={() => fetchRecords(pagination.currentPage)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Search by QR code, destination, or other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by QR code, destination, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_dispatch">Pending Dispatch</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outgoing Letters History</CardTitle>
          <CardDescription>
            Complete list of all outgoing letters ({pagination.total} total records)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
            </div>
          ) : (
            <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR Code</TableHead>
                      <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono font-medium">{record.qrCode}</TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="truncate" title={record.department?.name || 'Unknown Department'}>
                            {record.department?.name || 'Unknown Department'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="truncate" title={record.to}>
                            {record.to}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={record.subject || 'No subject'}>
                            {record.subject || 'No subject'}
                          </div>
                    </TableCell>
                    <TableCell>
                          <Badge variant={getPriorityColor(record.priority)}>
                        {record.priority}
                      </Badge>
                    </TableCell>
                        <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                          <Badge variant={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(record)}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                            {userRole === "super_admin" && (
                              <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(record)}
                          className="h-8 w-8 p-0"
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                                  onClick={() => handleDeleteClick(record)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Delete Record"
                                  disabled={isDeleting === record.id}
                        >
                                  {isDeleting === record.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                          <Trash2 className="h-4 w-4" />
                                  )}
                        </Button>
                              </>
                            )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

              {filteredHistory.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No records found</h3>
              <p className="text-gray-500">No records match your search criteria. Try adjusting your filters.</p>
            </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total records)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <RecordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        record={selectedRecord}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        userRole={userRole}
      />

      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
        recordType="outgoing"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the outgoing record
              {recordToDelete && ` "${recordToDelete.qrCode}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
