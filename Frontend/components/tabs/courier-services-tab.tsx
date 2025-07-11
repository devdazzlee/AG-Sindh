"use client"

import { useState, useEffect } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast"; // adjust if your toast import is different
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Truck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import apiClient from "@/lib/api-client"

export function CourierServicesTab() {
  const [courierServices, setCourierServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newCourier, setNewCourier] = useState({
    serviceName: "",
    code: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });
  const [addErrors, setAddErrors] = useState<any>({});
  const [addTouched, setAddTouched] = useState<{ [key: string]: boolean }>({});
  const [addLoading, setAddLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editCourier, setEditCourier] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isEditValid, setIsEditValid] = useState(false);
  const [editErrors, setEditErrors] = useState<any>({});
  const [editTouched, setEditTouched] = useState<{ [key: string]: boolean }>({});

  const courierSchema = z.object({
    serviceName: z.string().min(2, "Service Name is required"),
    code: z.string().min(2, "Code is required"),
    contactPerson: z.string().min(2, "Contact Person is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(5, "Phone is required"),
    address: z.string().min(2, "Address is required"),
  });

  const [isAddValid, setIsAddValid] = useState(false);

  useEffect(() => {
    const result = courierSchema.safeParse(newCourier);
    setAddErrors(result.success ? {} : result.error.flatten().fieldErrors);
    setIsAddValid(result.success);
  }, [newCourier]);

  useEffect(() => {
    if (!editCourier) {
      setEditErrors({});
      setIsEditValid(false);
      return;
    }
    const result = courierSchema.safeParse(editCourier);
    setEditErrors(result.success ? {} : result.error.flatten().fieldErrors);
    setIsEditValid(result.success);
  }, [editCourier]);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/couriers");
      setCourierServices(res.data.couriers);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const handleAddCourier = async () => {
    setAddTouched({
      serviceName: true,
      code: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
    });
    if (!isAddValid) return;
    setAddLoading(true);
    try {
      await apiClient.post("/couriers/create", { ...newCourier, status: "active" });
      fetchCouriers();
      setNewCourier({ serviceName: "", code: "", contactPerson: "", email: "", phone: "", address: "" });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Courier added successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteCourier = async (id: string) => {
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/couriers/${id}`);
      fetchCouriers();
      setIsDeleteDialogOpen(false);
      toast({ title: "Success", description: "Courier deleted." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await apiClient.patch(`/couriers/${id}/status`, { status: newStatus });
      fetchCouriers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourier = async () => {
    if (!editCourier) return;
    setEditLoading(true);
    try {
      await apiClient.put(`/couriers/${editCourier.id}`, editCourier);
      fetchCouriers();
      setIsEditDialogOpen(false);
      toast({ title: "Success", description: "Courier updated successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courier Services Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Courier Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Courier Service</DialogTitle>
              <DialogDescription>Register a new courier service provider</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={newCourier.serviceName}
                    onChange={(e) => setNewCourier({ ...newCourier, serviceName: e.target.value })}
                    onBlur={() => setAddTouched((prev) => ({ ...prev, serviceName: true }))}
                    placeholder="e.g., Swift Courier"
                  />
                  {addTouched.serviceName && addErrors.serviceName && (
                    <div className="text-red-500 text-xs mt-1">{addErrors.serviceName[0]}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="code">Service Code</Label>
                  <Input
                    id="code"
                    value={newCourier.code}
                    onChange={(e) => setNewCourier({ ...newCourier, code: e.target.value })}
                    onBlur={() => setAddTouched((prev) => ({ ...prev, code: true }))}
                    placeholder="e.g., SWF"
                  />
                  {addTouched.code && addErrors.code && (
                    <div className="text-red-500 text-xs mt-1">{addErrors.code[0]}</div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newCourier.contactPerson}
                  onChange={(e) => setNewCourier({ ...newCourier, contactPerson: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, contactPerson: true }))}
                  placeholder="e.g., Mr. John Doe"
                />
                {addTouched.contactPerson && addErrors.contactPerson && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.contactPerson[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCourier.email}
                  onChange={(e) => setNewCourier({ ...newCourier, email: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="e.g., contact@courier.com"
                />
                {addTouched.email && addErrors.email && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.email[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCourier.phone}
                  onChange={(e) => setNewCourier({ ...newCourier, phone: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="e.g., +92-21-1234567"
                />
                {addTouched.phone && addErrors.phone && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.phone[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCourier.address}
                  onChange={(e) => setNewCourier({ ...newCourier, address: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, address: true }))}
                  placeholder="e.g., Main Street, City"
                />
                {addTouched.address && addErrors.address && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.address[0]}</div>
                )}
              </div>
              <Button onClick={handleAddCourier} className="w-full" disabled={addLoading || !isAddValid}>
                {addLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span> : null}
                Add Courier Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Courier Service Providers
          </CardTitle>
          <CardDescription>Manage all registered courier service providers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[50vh] flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : courierServices.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No data found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courierServices.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell className="font-medium">{courier.serviceName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{courier.code}</Badge>
                    </TableCell>
                    <TableCell>{courier.contactPerson}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{courier.email}</div>
                        <div className="text-gray-500">{courier.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{courier.address}</TableCell>
                    <TableCell>
                      <Badge
                        variant={courier.status === "Active" ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(courier.id, courier.status)}
                      >
                        {courier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditCourier(courier);
                            setIsEditDialogOpen(true);
                            setEditTouched({});
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDeleteId(String(courier.id));
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this courier?</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDeleteCourier(deleteId)}
              disabled={deleteLoading}
            >
              {deleteLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Courier Service</DialogTitle>
            <DialogDescription>Edit the details of the courier service</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={editCourier?.serviceName || ""}
                  onChange={(e) => setEditCourier({ ...editCourier, serviceName: e.target.value })}
                  onBlur={() => setEditTouched((prev) => ({ ...prev, serviceName: true }))}
                  placeholder="e.g., Swift Courier"
                />
                {editTouched.serviceName && editErrors.serviceName && (
                  <div className="text-red-500 text-xs mt-1">{editErrors.serviceName[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="code">Service Code</Label>
                <Input
                  id="code"
                  value={editCourier?.code || ""}
                  onChange={(e) => setEditCourier({ ...editCourier, code: e.target.value })}
                  onBlur={() => setEditTouched((prev) => ({ ...prev, code: true }))}
                  placeholder="e.g., SWF"
                />
                {editTouched.code && editErrors.code && (
                  <div className="text-red-500 text-xs mt-1">{editErrors.code[0]}</div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={editCourier?.contactPerson || ""}
                onChange={(e) => setEditCourier({ ...editCourier, contactPerson: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, contactPerson: true }))}
                placeholder="e.g., Mr. John Doe"
              />
              {editTouched.contactPerson && editErrors.contactPerson && (
                <div className="text-red-500 text-xs mt-1">{editErrors.contactPerson[0]}</div>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editCourier?.email || ""}
                onChange={(e) => setEditCourier({ ...editCourier, email: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, email: true }))}
                placeholder="e.g., contact@courier.com"
              />
              {editTouched.email && editErrors.email && (
                <div className="text-red-500 text-xs mt-1">{editErrors.email[0]}</div>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editCourier?.phone || ""}
                onChange={(e) => setEditCourier({ ...editCourier, phone: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, phone: true }))}
                placeholder="e.g., +92-21-1234567"
              />
              {editTouched.phone && editErrors.phone && (
                <div className="text-red-500 text-xs mt-1">{editErrors.phone[0]}</div>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editCourier?.address || ""}
                onChange={(e) => setEditCourier({ ...editCourier, address: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, address: true }))}
                placeholder="e.g., Main Street, City"
              />
              {editTouched.address && editErrors.address && (
                <div className="text-red-500 text-xs mt-1">{editErrors.address[0]}</div>
              )}
            </div>
            <Button onClick={handleUpdateCourier} className="w-full" disabled={editLoading || !isEditValid}>
              {editLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span> : null}
              Update Courier Service
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
