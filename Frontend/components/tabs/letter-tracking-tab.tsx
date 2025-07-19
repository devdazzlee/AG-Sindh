"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { RecordDetailsModal } from "@/components/record-details-modal";
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

interface LetterTrackingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department";
}

interface TrackingRecord {
  id: string;
  qrCode: string;
  type: "incoming" | "outgoing";
  from: string;
  to: string;
  subject?: string;
  priority: string;
  status: string;
  createdAt: string;
  assignedDate: string;
  collectedDate?: string;
  dispatchedDate?: string;
  deliveredDate?: string;
  image?: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  courierService?: {
    id: string;
    serviceName: string;
    code: string;
  };
}

interface TrackingStats {
  incoming: {
    pending: number;
    inProgress: number;
    collected: number;
    archived: number;
    total: number;
  };
  outgoing: {
    pending: number;
    handledToCourier: number;
    delivered: number;
    returned: number;
    total: number;
  };
  total: number;
}

export function LetterTrackingTab({ userRole }: LetterTrackingTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingRecord[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TrackingRecord | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });
  const [statusUpdateDialog, setStatusUpdateDialog] = useState({
    isOpen: false,
    record: null as TrackingRecord | null,
    newStatus: "",
    oldStatus: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchTrackingData();
    fetchTrackingStats();
  }, [statusFilter, typeFilter, priorityFilter, pagination.currentPage]);

  const fetchTrackingData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "30",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const response = await apiClient.get(`/tracking?${params.toString()}`);
      setTrackingData(response.data.data.records || []);
      setPagination({
        currentPage: response.data.data.pagination.currentPage,
        totalPages: response.data.data.pagination.totalPages,
        total: response.data.data.pagination.total,
        hasMore: response.data.data.pagination.hasMore,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch tracking data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrackingStats = async () => {
    try {
      const response = await apiClient.get("/tracking/stats/overview");
      setStats(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch tracking stats:", error);
    }
  };

  const handleStatusUpdate = (record: TrackingRecord, newStatus: string) => {
    setStatusUpdateDialog({
      isOpen: true,
      record,
      newStatus,
      oldStatus: record.status,
    });
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdateDialog.record) return;

    setIsUpdating(statusUpdateDialog.record.id);
    try {
      await apiClient.put("/tracking/status", {
        recordId: statusUpdateDialog.record.id,
        recordType: statusUpdateDialog.record.type,
        newStatus: statusUpdateDialog.newStatus,
      });

      toast({
        title: "Status Updated",
        description: `Letter status updated from "${statusUpdateDialog.oldStatus}" to "${statusUpdateDialog.newStatus}" successfully.`,
      });

      // Refresh data
      fetchTrackingData();
      fetchTrackingStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
      setStatusUpdateDialog({
        isOpen: false,
        record: null,
        newStatus: "",
        oldStatus: "",
      });
    }
  };

  const handleViewDetails = (record: TrackingRecord) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in progress":
      case "handled to courier":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "archived":
      case "returned":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
      case "handled to courier":
        return "bg-blue-100 text-blue-800";
      case "archived":
      case "returned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getAvailableStatuses = (recordType: string, currentStatus: string) => {
    if (recordType === "incoming") {
      return ["pending", "in progress", "collected", "archived"].filter(
        (status) => status !== currentStatus.toLowerCase()
      );
    } else {
      return ["pending", "handled to courier", "delivered", "returned"].filter(
        (status) => status !== currentStatus.toLowerCase()
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const filteredData = trackingData.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subject &&
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Letter Tracking</h1>
        <Button
          onClick={() => {
            fetchTrackingData();
            fetchTrackingStats();
          }}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Letters
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Incoming</p>
                  <p className="text-2xl font-bold">{stats.incoming.total}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outgoing</p>
                  <p className="text-2xl font-bold">{stats.outgoing.total}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {stats.incoming.pending + stats.outgoing.pending}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Track Letter Status</CardTitle>
          <CardDescription>
            Monitor the status of incoming and outgoing letters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by QR code, from, to, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="handled to courier">
                  Handled to Courier
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading tracking data...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="responsive-table">
                  <TableHeader className="md:table-header-group">
                    <TableRow>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From/To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Courier Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-gray-50 md:table-row"
                      >
                        <TableCell className="font-mono" data-label="QR Code">
                          {item.qrCode}
                        </TableCell>
                        <TableCell data-label="Type">
                          <Badge
                            variant={
                              item.type === "incoming" ? "default" : "secondary"
                            }
                          >
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="md:max-w-[200px]"
                          data-label="From/To"
                        >
                          <div className="text-sm">
                            <div className="truncate" title={item.from}>
                              From: {item.from}
                            </div>
                            <div
                              className="text-gray-500 truncate"
                              title={item.to}
                            >
                              To: {item.to}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className="md:max-w-[200px]"
                          data-label="Subject"
                        >
                          <div
                            className="truncate"
                            title={item.subject || "No subject"}
                          >
                            {item.subject || "No subject"}
                          </div>
                        </TableCell>
                        <TableCell data-label="Priority">
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Courier Service">
                          {item.courierService ? (
                            <div
                              className="truncate"
                              title={item.courierService.serviceName}
                            >
                              {item.courierService.serviceName}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell data-label="Status">
                          <div className="flex items-center justify-end gap-2">
                            {getStatusIcon(item.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell data-label="Assigned Date">
                          {formatDate(item.assignedDate)}
                        </TableCell>
                        <TableCell data-label="Actions">
                          <div className="flex md:flex-row flex-col-reverse gap-1 md:items-center items-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(item)}
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Select
                            
                              onValueChange={(value) =>
                                handleStatusUpdate(item, value)
                              }
                              disabled={isUpdating === item.id}
                            >
                              <SelectTrigger className="md:w-[130px] w-[100px]">
                                <SelectValue
                                  placeholder={
                                    isUpdating === item.id
                                      ? "Updating..."
                                      : "Update"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStatuses(
                                  item.type,
                                  item.status
                                ).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {/* {userRole === "super_admin" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  // onClick={() => handleEdit(item)}
                                  className="h-8 w-8 p-0"
                                  title="Edit Record"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  // onClick={() => handleDeleteClick(item)}
                                  disabled={isUpdating === item.id} // Using isUpdating for delete loading state
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  title="Delete Record"
                                >
                                  {isUpdating === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )} */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredData.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No tracking records found.
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing page {pagination.currentPage} of{" "}
                    {pagination.totalPages} ({pagination.total} total records)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
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
        onEdit={() => {}} // No edit functionality
        onDelete={() => {}} // No delete functionality
        userRole={userRole}
      />

      {/* Status Update Confirmation Dialog */}
      <AlertDialog
        open={statusUpdateDialog.isOpen}
        onOpenChange={(open) =>
          !open && setStatusUpdateDialog((prev) => ({ ...prev, isOpen: false }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the status of letter{" "}
              <span className="font-mono font-medium">
                {statusUpdateDialog.record?.qrCode}
              </span>{" "}
              from{" "}
              <span className="font-medium text-yellow-600">
                "{statusUpdateDialog.oldStatus}"
              </span>{" "}
              to{" "}
              <span className="font-medium text-green-600">
                "{statusUpdateDialog.newStatus}"
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusUpdate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
