"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Camera,
  Scan,
  CheckCircle,
  Clock,
  Truck,
  Loader2,
  QrCode,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import { CameraModal } from "@/components/camera-modal";
import { QRScannerModal } from "@/components/qr-scanner-modal";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";

interface CourierTrackingTabProps {
  userRole: "super_admin" | "rd_department" | "other_department";
}

interface CourierTrackingRecord {
  id: string;
  from: string;
  to: string;
  priority: string;
  subject?: string;
  qrCode: string;
  status: "PENDING_DISPATCH" | "DISPATCHED" | "DELIVERED" | "RETURNED";
  createdAt: string;
  dispatchedDate?: string;
  deliveredDate?: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  type: "incoming" | "outgoing";
}

export function CourierTrackingTab({ userRole }: CourierTrackingTabProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedQR, setScannedQR] = useState("");
  const [scannedLetter, setScannedLetter] = useState<any>(null);
  const [isHandingToCourier, setIsHandingToCourier] = useState(false);
  const [courierRecords, setCourierRecords] = useState<CourierTrackingRecord[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourierRecords();
  }, []);

  const fetchCourierRecords = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/outgoing/courier/tracking");
      setCourierRecords(response.data.records || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courier tracking records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    setScannedQR(qrCode);
    setScannedLetter(null); // Reset previous letter details

    try {
      // Try to fetch letter details to show current status
      const response = await apiClient.get(`/outgoing/qr/${qrCode}`);
      if (response.data.record) {
        setScannedLetter(response.data.record);
        toast({
          title: "QR Code Scanned",
          description: `Found letter: ${
            response.data.record.subject || "No subject"
          } (Status: ${response.data.record.status})`,
        });
      }
    } catch (error: any) {
      console.log("Error", error?.response?.data?.error);
      toast({
        title: "QR Code Failed",
        description: `${error?.response?.data?.error}`,
        variant: "destructive",
      });
    }
  };

  const handleHandToCourier = async () => {
    if (!scannedQR) {
      toast({
        title: "No QR Code",
        description: "Please scan a QR code first.",
        variant: "destructive",
      });
      return;
    }

    setIsHandingToCourier(true);
    try {
      // Call the fast QR code status update API
      const response = await apiClient.patch(
        `/outgoing/qr/${scannedQR}/status`,
        {
          status: "DISPATCHED",
        }
      );

      if (response.data.success) {
        if (response.data.statusChanged) {
          toast({
            title: "Letter Handed to Courier Successfully!",
            description: response.data.message,
          });
          // Refresh the records list to show updated status
          fetchCourierRecords();
        } else {
          toast({
            title: "Status Already Updated",
            description: response.data.message,
            variant: "default",
          });
        }
        setScannedQR("");
        setScannedLetter(null);
      } else {
        toast({
          title: "Handover Failed",
          description:
            response.data.error || "Failed to hand letter to courier",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Letter Not Found",
          description:
            "No outgoing letter found with this QR code. Please check the QR code and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Handover Failed",
          description:
            error.response?.data?.error ||
            "Failed to hand letter to courier. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsHandingToCourier(false);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    // Handle captured image if needed
    toast({
      title: "Document Captured",
      description: "Document image captured successfully!",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "DISPATCHED":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "PENDING_DISPATCH":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "RETURNED":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800";
      case "PENDING_DISPATCH":
        return "bg-yellow-100 text-yellow-800";
      case "RETURNED":
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-bold">Courier Tracking</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchCourierRecords}
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
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code to Hand to Courier
          </CardTitle>
          <CardDescription>
            Scan the QR code on outgoing letters before handing them to courier
            services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Camera
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
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                  {scannedQR}
                </p>
              </div>
              {scannedLetter && (
                <div className="mt-3 p-3 bg-white rounded border border-green-100">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Subject:
                      </span>
                      <span className="text-sm text-gray-900">
                        {scannedLetter.subject || "No subject"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        From:
                      </span>
                      <span className="text-sm text-gray-900">
                        {scannedLetter.department?.name || "Unknown Department"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        To:
                      </span>
                      <span className="text-sm text-gray-900">
                        {scannedLetter.to}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Current Status:
                      </span>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Ready to Scan
              </h3>
              <p className="text-gray-600 mb-3">
                Point your camera at the QR code on the outgoing letter
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Ensure good lighting</p>
                <p>• Hold the QR code steady</p>
                <p>• Keep the code clearly visible</p>
              </div>
            </div>
          </div>

          {scannedLetter?.status === "DISPATCHED" ? (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-center">
              <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Letter Already Dispatched
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                This letter has already been handed to courier and is in
                transit.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScannedQR("");
                  setScannedLetter(null);
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan New QR Code
              </Button>
            </div>
          ) : scannedLetter?.status === "DELIVERED" ? (
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg text-center">
              <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Letter Already Delivered
              </h3>
              <p className="text-sm text-green-700 mb-4">
                This letter has already been delivered to the recipient.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScannedQR("");
                  setScannedLetter(null);
                }}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan New QR Code
              </Button>
            </div>
          ) : scannedLetter?.status === "PENDING_DISPATCH" ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center mb-4">
                <div className="bg-white rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-green-800 mb-1">
                  Ready to Hand to Courier
                </h3>
                <p className="text-xs text-green-700">
                  This letter can be handed to courier service
                </p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!scannedQR || isHandingToCourier}
                onClick={handleHandToCourier}
              >
                {isHandingToCourier ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Handing to Courier...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-2" />
                    Hand to Courier
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Courier Tracking Records</CardTitle>
          <CardDescription>
            Track letters assigned to courier services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table className="responsive-table">
              <TableHeader className="md:table-header-group">
                <TableRow>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Dispatched Date</TableHead>
                  <TableHead>Delivered Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courierRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No courier tracking records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  courierRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-gray-50 md:table-row"
                    >
                      <TableCell
                        className="font-mono text-sm"
                        data-label="QR Code"
                      >
                        {record.qrCode}
                      </TableCell>
                      <TableCell data-label="To">
                      <div
                            className="truncate"
                            title={record.to}
                          >
                           {record.to}
                          </div>
                      </TableCell>
                      <TableCell className="md:max-w-[200px]" data-label="From">
                        <div className="text-sm">
                          <div
                            className="truncate"
                            title={
                              record.department?.name || "Unknown Department"
                            }
                          >

                            {record.department?.name || "Unknown Department"}
                          </div>
                          
                        </div>
                      </TableCell>
                      <TableCell
                        className="md:max-w-[200px] truncate"
                        data-label="Subject"
                      >
                        {record.subject || "No subject"}
                      </TableCell>
                      <TableCell data-label="Priority">
                        <Badge variant={getPriorityColor(record.priority)}>
                          {record.priority}
                        </Badge>
                      </TableCell>
                      <TableCell data-label="Status">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {record.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-label="Created Date">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(record.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-label="Dispatched Date">
                        {record.dispatchedDate ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(
                                record.dispatchedDate
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {new Date(
                                record.dispatchedDate
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell data-label="Delivered Date">
                        {record.deliveredDate ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(
                                record.deliveredDate
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {new Date(
                                record.deliveredDate
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
        title="Scan QR Code for Courier"
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Capture Document"
      />
    </div>
  );
}
