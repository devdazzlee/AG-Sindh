"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordDetailsModal } from "@/components/record-details-modal";
import { EditRecordModal } from "@/components/edit-record-modal";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IncomingHistoryTabProps {
  userRole: "super_admin" | "rd_department" | "other_department";
}

interface IncomingRecord {
  id: string;
  from: string;
  to: string;
  priority: string;
  subject?: string;
  description?: string;
  filing?: string;
  qrCode: string;
  status: "RECEIVED" | "TRANSFERRED" | "COLLECTED" | "ARCHIVED";
  image?: string;
  createdAt: string;
  receivedDate: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
}

export function IncomingHistoryTab({ userRole }: IncomingHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<IncomingRecord | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [records, setRecords] = useState<IncomingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<IncomingRecord | null>(
    null
  );
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, [pagination.currentPage]);

  const fetchRecords = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/incoming?page=${page}&limit=30`);
      setRecords(response.data.records || []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error?.[0]?.message ||
          "Failed to fetch records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const filteredHistory = records.filter((item) => {
    const matchesSearch =
      item.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subject &&
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority =
      filterPriority === "all" ||
      item.priority.toLowerCase() === filterPriority;
    const matchesStatus =
      filterStatus === "all" ||
      item.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleViewDetails = (record: IncomingRecord) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (record: IncomingRecord) => {
    if (userRole !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only super admins can edit records.",
        variant: "destructive",
      });
      return;
    }
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedRecord: any) => {
    try {
      const formData = new FormData();

      // Add all non-image fields
      Object.keys(updatedRecord).forEach((key) => {
        if (
          key !== "id" &&
          key !== "image" &&
          updatedRecord[key] !== undefined &&
          updatedRecord[key] !== ""
        ) {
          formData.append(key, updatedRecord[key]);
        }
      });

      // Handle image separately - only upload if it's a new image (base64)
      if (
        updatedRecord.image &&
        typeof updatedRecord.image === "string" &&
        updatedRecord.image.startsWith("data:")
      ) {
        // Convert base64 to blob for upload
        const response = await fetch(updatedRecord.image);
        const blob = await response.blob();
        formData.append("image", blob, "document.jpg");
      }
      // If image is a URL (existing image), don't include it in the update

      await apiClient.put(`/incoming/${updatedRecord.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh the records
      await fetchRecords(pagination.currentPage);

      toast({
        title: "Record Updated",
        description: `Record ${updatedRecord.qrCode} has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error?.[0]?.message ||
          "Failed to update record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (record: IncomingRecord) => {
    if (userRole !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only super admins can delete records.",
        variant: "destructive",
      });
      return;
    }
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    setIsDeleting(recordToDelete.id);
    try {
      await apiClient.delete(`/incoming/${recordToDelete.id}`);

      // Remove from local state
      setRecords(records.filter((record) => record.id !== recordToDelete.id));

      toast({
        title: "Record Deleted",
        description: `Record has been deleted successfully.`,
        variant: "destructive",
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Record Not Found",
          description: "This record has already been deleted or doesn't exist.",
          variant: "destructive",
        });
        // Refresh the records list to sync with server
        fetchRecords(pagination.currentPage);
      } else {
        toast({
          title: "Error",
          description:
            error.response?.data?.error?.[0]?.message ||
            "Failed to delete record",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return "default";
      case "TRANSFERRED":
        return "secondary";
      case "COLLECTED":
        return "outline";
      case "ARCHIVED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-bold">Incoming History</h1>
        <Button
          variant="outline"
          onClick={() => fetchRecords(1)}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Search by QR code, date, or other criteria
          </CardDescription>
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
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Letters History</CardTitle>
          <CardDescription>
            Complete list of all incoming letters ({pagination.total} total
            records, page {pagination.currentPage} of {pagination.totalPages})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="responsive-table">
                  <TableHeader className="md:table-header-group">
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
                      <TableRow
                        key={record.id}
                        className="hover:bg-gray-50 md:table-row"
                      >
                        <TableCell
                          className="font-mono font-medium"
                          data-label="QR Code"
                        >
                          {record.qrCode}
                        </TableCell>
                        <TableCell className="md:max-w-[150px]" data-label="From">
                          <div className="truncate" title={record.from}>
                            {record.from}
                          </div>
                        </TableCell>
                        <TableCell className="md:max-w-[150px]" data-label="To">
                          <div
                            className="truncate"
                            title={record.department?.name || "Unknown"}
                          >
                            {record.department?.name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell
                          className="md:max-w-[200px]"
                          data-label="Subject"
                        >
                          <div
                            className="truncate"
                            title={record.subject || "No subject"}
                          >
                            {record.subject || "No subject"}
                          </div>
                        </TableCell>
                        <TableCell data-label="Priority">
                          <Badge variant={getPriorityColor(record.priority)}>
                            {record.priority}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Date">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell data-label="Status">
                          <Badge variant={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Actions">
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
                                  disabled={isDeleting === record.id}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  title="Delete Record"
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing page {pagination.currentPage} of{" "}
                    {pagination.totalPages} ({pagination.total} total records)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.currentPage === pageNum
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {!isLoading && filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No records found
              </h3>
              <p className="text-gray-500">
                No records match your search criteria. Try adjusting your
                filters.
              </p>
            </div>
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
        recordType="incoming"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              record{" "}
              <span className="font-mono font-medium">
                {recordToDelete?.qrCode}
              </span>{" "}
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting === recordToDelete?.id}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting === recordToDelete?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Record"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
