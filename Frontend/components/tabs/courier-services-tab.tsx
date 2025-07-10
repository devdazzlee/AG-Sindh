"use client"

import { useState } from "react"
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
} from "@/components/ui/dialog"

export function CourierServicesTab() {
  const [courierServices, setCourierServices] = useState([
    {
      id: 1,
      name: "Fast Courier Service",
      code: "FCS",
      contactPerson: "Mr. Ahmed Khan",
      email: "contact@fastcourier.com",
      phone: "+92-21-1111111",
      address: "Main Street, Karachi",
      status: "Active",
      createdDate: "2024-01-01",
    },
    {
      id: 2,
      name: "Express Delivery",
      code: "EXP",
      contactPerson: "Ms. Sara Ali",
      email: "info@expressdelivery.com",
      phone: "+92-21-2222222",
      address: "Commercial Area, Lahore",
      status: "Active",
      createdDate: "2024-01-02",
    },
    {
      id: 3,
      name: "Quick Post",
      code: "QPS",
      contactPerson: "Mr. Hassan Raza",
      email: "support@quickpost.com",
      phone: "+92-21-3333333",
      address: "Business District, Islamabad",
      status: "Inactive",
      createdDate: "2024-01-03",
    },
  ])

  const [newCourier, setNewCourier] = useState({
    name: "",
    code: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddCourier = () => {
    const courier = {
      id: courierServices.length + 1,
      ...newCourier,
      status: "Active",
      createdDate: new Date().toISOString().split("T")[0],
    }
    setCourierServices([...courierServices, courier])
    setNewCourier({ name: "", code: "", contactPerson: "", email: "", phone: "", address: "" })
    setIsDialogOpen(false)
  }

  const handleDeleteCourier = (id: number) => {
    setCourierServices(courierServices.filter((courier) => courier.id !== id))
  }

  const toggleStatus = (id: number) => {
    setCourierServices(
      courierServices.map((courier) =>
        courier.id === id ? { ...courier, status: courier.status === "Active" ? "Inactive" : "Active" } : courier,
      ),
    )
  }

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
                    value={newCourier.name}
                    onChange={(e) => setNewCourier({ ...newCourier, name: e.target.value })}
                    placeholder="e.g., Swift Courier"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Service Code</Label>
                  <Input
                    id="code"
                    value={newCourier.code}
                    onChange={(e) => setNewCourier({ ...newCourier, code: e.target.value })}
                    placeholder="e.g., SWF"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newCourier.contactPerson}
                  onChange={(e) => setNewCourier({ ...newCourier, contactPerson: e.target.value })}
                  placeholder="e.g., Mr. John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCourier.email}
                  onChange={(e) => setNewCourier({ ...newCourier, email: e.target.value })}
                  placeholder="e.g., contact@courier.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCourier.phone}
                  onChange={(e) => setNewCourier({ ...newCourier, phone: e.target.value })}
                  placeholder="e.g., +92-21-1234567"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCourier.address}
                  onChange={(e) => setNewCourier({ ...newCourier, address: e.target.value })}
                  placeholder="e.g., Main Street, City"
                />
              </div>
              <Button onClick={handleAddCourier} className="w-full">
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
                  <TableCell className="font-medium">{courier.name}</TableCell>
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
                      onClick={() => toggleStatus(courier.id)}
                    >
                      {courier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteCourier(courier.id)}>
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
