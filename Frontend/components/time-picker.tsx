"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TimePicker({ value, onChange, placeholder = "Select time", disabled }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(value ? value.split(":")[0] : "09")
  const [minutes, setMinutes] = useState(value ? value.split(":")[1] : "00")
  const [period, setPeriod] = useState(value && Number.parseInt(value.split(":")[0]) >= 12 ? "PM" : "AM")

  const formatTime = (h: string, m: string, p: string) => {
    const hour24 = p === "PM" && h !== "12" ? (Number.parseInt(h) + 12).toString() : p === "AM" && h === "12" ? "00" : h
    return `${hour24.padStart(2, "0")}:${m.padStart(2, "0")}`
  }

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return placeholder
    const [h, m] = timeString.split(":")
    const hour12 =
      Number.parseInt(h) === 0 ? 12 : Number.parseInt(h) > 12 ? Number.parseInt(h) - 12 : Number.parseInt(h)
    const period = Number.parseInt(h) >= 12 ? "PM" : "AM"
    return `${hour12}:${m} ${period}`
  }

  const handleTimeSelect = () => {
    const timeString = formatTime(hours, minutes, period)
    onChange?.(timeString)
    setIsOpen(false)
  }

  const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i === 0 ? 12 : i
      return hour.toString().padStart(2, "0")
    })
  }

  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime(value || "")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="text-sm font-medium">Select Time</div>
          <div className="flex items-center space-x-2">
            <div className="space-y-2">
              <Label className="text-xs">Hour</Label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-16 p-2 border rounded text-sm"
              >
                {generateHours().map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-6">:</div>
            <div className="space-y-2">
              <Label className="text-xs">Minute</Label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-16 p-2 border rounded text-sm"
              >
                {generateMinutes().map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Period</Label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-16 p-2 border rounded text-sm"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleTimeSelect}>
              Set Time
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
