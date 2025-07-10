"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DepartmentsTab() {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Education Department",
      code: "EDU",
      head: "Dr. Ahmad Ali",
      email: "education@agsindh.gov.pk",
      phone: "+92-21-1234567",
      status: "Active",
      createdDate: "2024-01-01",
    },
    {
      id: 2,
      name: "Water Department",
      code: "WAT",
      head: "Eng. Fatima Khan",
      email: "water@agsindh.gov.pk",
      phone: "+92-21-2345678",
      status: "Active",
      createdDate: "2024-01-02",
    },
    {
      id: 3,
      name: "Health Department",
      code: "HLT",
      head: "Dr. Muhammad Hassan",
      email: "health@agsindh.gov.pk",
      phone: "+92-21-3456789",
      status: "Active",
      createdDate: "2024-01-03",
    },
    {
      id: 4,
      name: "Transport Department",
      code: "TRP",
      head: "Mr. Ali Raza",
      email: "transport@agsindh.gov.pk",
      phone: "+92-21-4567890",
      status: "Inactive",
      createdDate: "2024-01-04",
    },
  ])

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
    head: "",
    email: "",
    phone: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddDepartment = () => {
    const department = {
      id: departments.length + 1,
      ...newDepartment,
      status: "Active",
      createdDate: new Date().toISOString().split("T")[0],
    }
    setDepartments([...departments, department])
    setNewDepartment({ name: "", code: "", head: "", email: "", phone: "" })
    setIsDialogOpen(false)
  }

  const handleDeleteDepartment = (id: number) => {
    setDepartments(departments.filter((dept) => dept.id !== id))
  }

  const toggleStatus = (id: number) => {
    setDepartments(
      departments.map((dept) =>
        dept.id === id ? { ...dept, status: dept.status === "Active" ? "Inactive" : "Active" } : dept,
      ),
    )
  }

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
                    placeholder="e.g., Agriculture Department"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Department Code</Label>
                  <Input
                    id="code"
                    value={newDepartment.code}
                    onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
                    placeholder="e.g., AGR"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="head">Department Head</Label>
                <Input
                  id="head"
                  value={newDepartment.head}
                  onChange={(e) => setNewDepartment({ ...newDepartment, head: e.target.value })}
                  placeholder="e.g., Dr. John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDepartment.email}
                  onChange={(e) => setNewDepartment({ ...newDepartment, email: e.target.value })}
                  placeholder="e.g., dept@agsindh.gov.pk"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newDepartment.phone}
                  onChange={(e) => setNewDepartment({ ...newDepartment, phone: e.target.value })}
                  placeholder="e.g., +92-21-1234567"
                />
              </div>
              <Button onClick={handleAddDepartment} className="w-full">
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
                      <div className="text-gray-500">{dept.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.status === "Active" ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(dept.id)}
                    >
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{dept.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteDepartment(dept.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
