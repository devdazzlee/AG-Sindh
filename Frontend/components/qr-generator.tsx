"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRGeneratorProps {
  data: string
  onGenerated?: (qrCode: string) => void
}

export function QRGenerator({ data, onGenerated }: QRGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const { toast } = useToast()

  const generateQR = async () => {
    if (!data) {
      toast({
        title: "Error",
        description: "No data to generate QR code",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Use QR Server API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`

      // Create image element to load QR code
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = qrUrl
      })

      // Create canvas and draw QR code
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, 200, 200)
        ctx.drawImage(img, 0, 0, 200, 200)

        const qrDataUrl = canvas.toDataURL("image/png")
        setQrCode(qrDataUrl)

        if (onGenerated) {
          onGenerated(qrDataUrl)
        }

        toast({
          title: "Success",
          description: "QR code generated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrCode) return

    const link = document.createElement("a")
    link.download = `QR_${Date.now()}.png`
    link.href = qrCode
    link.click()

    toast({
      title: "Downloaded",
      description: "QR code downloaded successfully",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={generateQR} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
          {isGenerating ? "Generating..." : "Generate QR"}
        </Button>

        {qrCode && (
          <Button variant="outline" onClick={downloadQR}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      {qrCode && (
        <div className="border rounded-lg p-4 bg-white inline-block">
          <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-32 h-32" />
        </div>
      )}
    </div>
  )
}
