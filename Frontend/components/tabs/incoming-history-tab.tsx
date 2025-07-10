"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecordDetailsModal } from "@/components/record-details-modal"
import { EditRecordModal } from "@/components/edit-record-modal"
import { useToast } from "@/hooks/use-toast"

interface IncomingHistoryTabProps {
  userRole: "super_admin" | "rd_department" | "other_department"
}

export function IncomingHistoryTab({ userRole }: IncomingHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [records, setRecords] = useState([
    {
      id: "QR001",
      from: "Education Department",
      to: "RD Department",
      priority: "High",
      date: "2024-01-15",
      time: "10:30 AM",
      subject: "Budget Allocation Request",
      status: "Collected",
      description: "Request for additional budget allocation for school infrastructure development project",
      filing: "EDU/2024/001",
    },
    {
      id: "QR002",
      from: "Water Department",
      to: "RD Department",
      priority: "Medium",
      date: "2024-01-14",
      time: "02:15 PM",
      subject: "Infrastructure Development",
      status: "Pending",
      description: "Proposal for water supply infrastructure development in rural areas",
      filing: "WAT/2024/002",
    },
    {
      id: "QR003",
      from: "Health Department",
      to: "RD Department",
      priority: "High",
      date: "2024-01-13",
      time: "09:45 AM",
      subject: "Medical Equipment Purchase",
      status: "In Progress",
      description: "Request for approval of medical equipment purchase for district hospital",
      filing: "HLT/2024/003",
    },
    {
      id: "QR004",
      from: "Transport Department",
      to: "RD Department",
      priority: "Low",
      date: "2024-01-12",
      time: "04:20 PM",
      subject: "Vehicle Maintenance",
      status: "Completed",
      description: "Request for vehicle maintenance budget approval for official vehicles",
      filing: "TRP/2024/004",
    },
    {
      id: "QR005",
      from: "Agriculture Department",
      to: "RD Department",
      priority: "Medium",
      date: "2024-01-11",
      time: "11:00 AM",
      subject: "Crop Insurance Scheme",
      status: "Collected",
      description: "Proposal for new crop insurance scheme implementation for farmers",
      filing: "AGR/2024/005",
    },
  ])

  const { toast } = useToast()

  const filteredHistory = records.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "all" || item.priority.toLowerCase() === filterPriority
    const matchesStatus = filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setSelectedRecord(record)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = (updatedRecord: any) => {
    setRecords(records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
    toast({
      title: "Record Updated",
      description: `Record ${updatedRecord.id} has been updated successfully.`,
    })
  }

  const handleDelete = (id: string) => {
    setRecords(records.filter((record) => record.id !== id))
    toast({
      title: "Record Deleted",
      description: `Record ${id} has been deleted successfully.`,
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Incoming History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Search by QR code, date, or other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by QR code, department, or subject..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Letters History</CardTitle>
          <CardDescription>Complete list of all incoming letters ({filteredHistory.length} records)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR Code</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-medium">{record.id}</TableCell>
                    <TableCell>{record.from}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={record.subject}>
                      {record.subject}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.status}</Badge>
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
                          onClick={() => handleDelete(record.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No records found</h3>
              <p className="text-gray-500">No records match your search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <RecordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        record={selectedRecord}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
