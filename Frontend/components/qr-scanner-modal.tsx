"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, RotateCcw, Check, AlertCircle, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QrReader from "react-qr-barcode-scanner"

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (qrCode: string) => void
  title?: string
}

export function QRScannerModal({ isOpen, onClose, onScan, title = "Scan QR Code" }: QRScannerModalProps) {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanCount, setScanCount] = useState(0)
  const { toast } = useToast()

  const handleScan = useCallback((err: any, result: any) => {
    // Increment scan count for debugging
    setScanCount(prev => prev + 1)
    
    if (err) {
      // Only log actual errors, not "no QR code found" messages
      if (err.name && err.name !== "NotFoundException") {
        console.error("QR Scan error:", err)
        setError("Camera access failed. Please check permissions.")
      }
      return
    }

    if (result && result.text && result.text.trim()) {
      console.log("QR Code successfully scanned:", result.text)
      setScannedCode(result.text.trim())
      setError(null)
      setIsScanning(false)
      
      // Show success toast
      toast({
        title: "QR Code Detected!",
        description: `Scanned: ${result.text.trim()}`,
      })
    }
  }, [toast])

  const handleConfirm = () => {
    if (scannedCode) {
      onScan(scannedCode)
      handleClose()
    }
  }

  const handleClose = () => {
    setScannedCode(null)
    setError(null)
    setIsScanning(false)
    setScanCount(0)
    onClose()
  }

  const handleRetry = () => {
    setScannedCode(null)
    setError(null)
    setIsScanning(true)
    setScanCount(0)
  }

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true)
      setError(null)
      setScanCount(0)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {scannedCode 
              ? "QR Code detected! Review and confirm." 
              : "Point your camera at a QR code to scan"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center text-white p-4">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                  <p>{error}</p>
                  <Button onClick={handleRetry} className="mt-4 bg-transparent" variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : scannedCode ? (
              <div className="absolute inset-0 flex items-center justify-center text-white p-4">
                <div className="text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <p className="text-lg font-semibold mb-2">QR Code Detected!</p>
                  <p className="text-sm text-gray-300 break-all font-mono">{scannedCode}</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {isScanning && (
                  <QrReader
                    onUpdate={handleScan}
                    width="100%"
                    height="100%"
                    delay={50}
                    facingMode="environment"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">Point camera at QR code</p>
                    <p className="text-sm text-gray-400 mt-2">Make sure the QR code is clearly visible</p>
                    <p className="text-xs text-gray-500 mt-1">Scan attempts: {scanCount}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {scannedCode ? (
              <>
                <Button variant="outline" onClick={handleRetry}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Scan Again
                </Button>
                <Button onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" />
                  Use QR Code
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <div className="text-sm text-gray-500 flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scanning for QR codes... ({scanCount} attempts)
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 