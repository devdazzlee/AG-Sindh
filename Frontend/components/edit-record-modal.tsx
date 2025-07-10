"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { useToast } from "@/hooks/use-toast"

interface EditRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSave: (updatedRecord: any) => void
}

export function EditRecordModal({ isOpen, onClose, record, onSave }: EditRecordModalProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    subject: "",
    priority: "",
    description: "",
    filing: "",
    date: "",
    time: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date>()
  const { toast } = useToast()

  useEffect(() => {
    if (record) {
      setFormData({
        from: record.from || "",
        to: record.to || "",
        subject: record.subject || "",
        priority: record.priority || "",
        description: record.description || "",
        filing: record.filing || "",
        date: record.date || "",
        time: record.time || "",
      })

      if (record.date) {
        setSelectedDate(new Date(record.date))
      }
    }
  }, [record])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.from || !formData.to || !formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const updatedRecord = {
      ...record,
      ...formData,
      date: selectedDate ? selectedDate.toISOString().split("T")[0] : formData.date,
    }

    onSave(updatedRecord)
    toast({
      title: "Record Updated",
      description: "Record has been updated successfully.",
    })
    onClose()
  }

  if (!record) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>Update the information for record {record.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">From *</Label>
              <Input
                id="from"
                value={formData.from}
                onChange={(e) => handleInputChange("from", e.target.value)}
                placeholder="Sender name"
              />
            </div>
            <div>
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                value={formData.to}
                onChange={(e) => handleInputChange("to", e.target.value)}
                placeholder="Recipient name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Letter subject"
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <DatePicker date={selectedDate} onDateChange={setSelectedDate} placeholder="Select date" />
            </div>
            <div>
              <Label>Time</Label>
              <TimePicker
                value={formData.time}
                onChange={(time) => handleInputChange("time", time)}
                placeholder="Select time"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Letter description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="filing">Filing</Label>
            <Input
              id="filing"
              value={formData.filing}
              onChange={(e) => handleInputChange("filing", e.target.value)}
              placeholder="Filing information"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
