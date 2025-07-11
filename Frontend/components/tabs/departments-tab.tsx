"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Building2, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import apiClient from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast"
import { truncate } from "@/lib/utils"
import { z } from "zod";


const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().min(2, "Department code is required"),
  head: z.string().min(2, "Department head is required"),
  phone: z.string().min(5, "Phone is required"),
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const departmentEditSchema = departmentSchema.omit({ password: true }).extend({ password: z.string().optional() });

export function DepartmentsTab() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast()

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
    head: "",
    phone: "",
    username: "",
    password: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [editDepartment, setEditDepartment] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  console.log("editDepartment", editDepartment)
  const [deleteDepartmentId, setDeleteDepartmentId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Add form validation state
  const [addErrors, setAddErrors] = useState<any>({});
  const [isAddValid, setIsAddValid] = useState(false);
  const [addTouched, setAddTouched] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    const result = departmentSchema.safeParse(newDepartment);
    setAddErrors(result.success ? {} : result.error.flatten().fieldErrors);
    setIsAddValid(result.success);
  }, [newDepartment]);

  // Edit form validation state
  const [editErrors, setEditErrors] = useState<any>({});
  const [isEditValid, setIsEditValid] = useState(false);
  const [editTouched, setEditTouched] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    if (!editDepartment) {
      setEditErrors({});
      setIsEditValid(false);
      return;
    }
    const result = departmentEditSchema.safeParse(editDepartment);
    setEditErrors(result.success ? {} : result.error.flatten().fieldErrors);
    setIsEditValid(result.success);
  }, [editDepartment]);

  const handleAddDepartment = async () => {
    setAddTouched({
      name: true,
      code: true,
      head: true,
      phone: true,
      username: true,
      password: true,
    });
    setAddLoading(true);
    try {
      const res = await apiClient.post("/departments/create", {
        name: newDepartment.name,
        code: newDepartment.code,
        head: newDepartment.head,
        contact: newDepartment.phone, // or email+phone if you want to combine
        status: "active",
        username: newDepartment.username,
        password: newDepartment.password,
      });
      // Optionally, fetch departments again or add the new one to state
      fetchDepartments();
      setNewDepartment({ name: "", code: "", head: "", phone: "", username: "", password: "" });
      setIsDialogOpen(false);
    } catch (err: any) {
      console.log("err", err?.response?.data?.error)
      toast({
        title: "Error",
        description: err?.response?.data?.error,
        variant: "destructive",
      })
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/departments/${id}`);
      fetchDepartments();
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
      await apiClient.patch(`/departments/${id}/status`, { status: newStatus });
      fetchDepartments();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editDepartment) return;
    setEditTouched({
      name: true,
      code: true,
      head: true,
      phone: true,
      username: true,
      password: true,
    });
    setEditLoading(true);
    try {
      const updateData: any = {
        name: editDepartment.name,
        code: editDepartment.code,
        head: editDepartment.head,
        contact: editDepartment.phone,
        username: editDepartment.username,
      };
      if (editDepartment.password) {
        updateData.password = editDepartment.password;
      }
      await apiClient.put(`/departments/${editDepartment.id}`, updateData);
      fetchDepartments();
      setIsEditDialogOpen(false);
      toast({ title: "Success", description: "Department updated successfully." });
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

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/departments");
      setDepartments(res.data.departments);
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
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Departments Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>Add a new department account to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    onBlur={() => setAddTouched((prev) => ({ ...prev, name: true }))}
                    placeholder="e.g., Agriculture Department"
                  />
                  {addTouched.name && addErrors.name && (
                    <div className="text-red-500 text-xs mt-1">{addErrors.name[0]}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="code">Department Code</Label>
                  <Input
                    id="code"
                    value={newDepartment.code}
                    onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
                    onBlur={() => setAddTouched((prev) => ({ ...prev, code: true }))}
                    placeholder="e.g., AGR"
                  />
                  {addTouched.code && addErrors.code && (
                    <div className="text-red-500 text-xs mt-1">{addErrors.code[0]}</div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="head">Department Head</Label>
                <Input
                  id="head"
                  value={newDepartment.head}
                  onChange={(e) => setNewDepartment({ ...newDepartment, head: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, head: true }))}
                  placeholder="e.g., Dr. John Doe"
                />
                {addTouched.head && addErrors.head && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.head[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newDepartment.phone}
                  onChange={(e) => setNewDepartment({ ...newDepartment, phone: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="e.g., +92-21-1234567"
                />
                {addTouched.phone && addErrors.phone && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.phone[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newDepartment.username}
                  onChange={(e) => setNewDepartment({ ...newDepartment, username: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, username: true }))}
                  placeholder="e.g., dept_user"
                />
                {addTouched.username && addErrors.username && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.username[0]}</div>
                )}
              </div>
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showAddPassword ? "text" : "password"}
                  value={newDepartment.password}
                  onChange={(e) => setNewDepartment({ ...newDepartment, password: e.target.value })}
                  onBlur={() => setAddTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="Enter a strong password"
                />
                <button
                  type="button"
                  className="absolute right-2 bottom-[2px] -translate-y-1/2 text-gray-400"
                  onClick={() => setShowAddPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {addTouched.password && addErrors.password && (
                  <div className="text-red-500 text-xs mt-1">{addErrors.password[0]}</div>
                )}
              </div>
              <Button onClick={handleAddDepartment} className="w-full" disabled={addLoading || !isAddValid}>
                {addLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span> : null}
                Create Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Accounts
          </CardTitle>
          <CardDescription>Manage all department accounts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[50vh] flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No data found</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dept.code}</Badge>
                  </TableCell>
                  <TableCell>{dept.head}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{dept.email}</div>
                        <div className="text-gray-500">{truncate(dept.contact)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.status === "Active" ? "default" : "secondary"}
                      className="cursor-pointer"
                        onClick={() => toggleStatus(String(dept.id), dept.status.toLowerCase())}
                    >
                      {dept.status}
                    </Badge>
                  </TableCell>
                    <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditDepartment({
                              ...dept,
                              phone: dept.contact,
                              username: dept.user?.username || dept.username,
                              password: "", // always empty for security
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                        <Edit className="h-4 w-4" />
                      </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDeleteDepartmentId(String(dept.id));
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Edit the details of the department</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={editDepartment?.name}
                  onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                  onBlur={() => setEditTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="e.g., Agriculture Department"
                />
                {editTouched.name && editErrors.name && (
                  <div className="text-red-500 text-xs mt-1">{editErrors.name[0]}</div>
                )}
              </div>
              <div>
                <Label htmlFor="code">Department Code</Label>
                <Input
                  id="code"
                  value={editDepartment?.code}
                  onChange={(e) => setEditDepartment({ ...editDepartment, code: e.target.value })}
                  onBlur={() => setEditTouched((prev) => ({ ...prev, code: true }))}
                  placeholder="e.g., AGR"
                />
                {editTouched.code && editErrors.code && (
                  <div className="text-red-500 text-xs mt-1">{editErrors.code[0]}</div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="head">Department Head</Label>
              <Input
                id="head"
                value={editDepartment?.head}
                onChange={(e) => setEditDepartment({ ...editDepartment, head: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, head: true }))}
                placeholder="e.g., Dr. John Doe"
              />
              {editTouched.head && editErrors.head && (
                <div className="text-red-500 text-xs mt-1">{editErrors.head[0]}</div>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editDepartment?.phone}
                onChange={(e) => setEditDepartment({ ...editDepartment, phone: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, phone: true }))}
                placeholder="e.g., +92-21-1234567"
              />
              {editTouched.phone && editErrors.phone && (
                <div className="text-red-500 text-xs mt-1">{editErrors.phone[0]}</div>
              )}
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editDepartment?.username}
                onChange={(e) => setEditDepartment({ ...editDepartment, username: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, username: true }))}
                placeholder="e.g., dept_user"
              />
              {editTouched.username && editErrors.username && (
                <div className="text-red-500 text-xs mt-1">{editErrors.username[0]}</div>
              )}
            </div>
            <div className="relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showEditPassword ? "text" : "password"}
                value={editDepartment?.password}
                onChange={(e) => setEditDepartment({ ...editDepartment, password: e.target.value })}
                onBlur={() => setEditTouched((prev) => ({ ...prev, password: true }))}
                placeholder="Enter a strong password"
              />
              <button
                type="button"
                className="absolute right-2 bottom-[2px] -translate-y-1/2 text-gray-400"
                onClick={() => setShowEditPassword((v) => !v)}
                tabIndex={-1}
              >
                {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {editTouched.password && editErrors.password && (
                <div className="text-red-500 text-xs mt-1">{editErrors.password[0]}</div>
              )}
            </div>
            <Button onClick={handleUpdateDepartment} className="w-full" disabled={editLoading || !isEditValid}>
              {editLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span> : null}
              Update Department
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this department?</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteDepartmentId) {
                  await handleDeleteDepartment(deleteDepartmentId);
                  setIsDeleteDialogOpen(false);
                }
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full inline-block"></span> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
