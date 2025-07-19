"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw, Check, AlertCircle, SwitchCamera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
  title?: string
}

export function CameraModal({ isOpen, onClose, onCapture, title = "Capture Image" }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

// Helper: Get camera deviceId for facingMode
const getCameraDeviceId = async (facingMode: "user" | "environment") => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  // Some Android devices swap front/back. Try to match by label as fallback.
  const search = facingMode === "user" ? /front/i : /back|environment/i;
  let found = videoDevices.find((device) => search.test(device.label));
  if (!found && videoDevices.length > 1) {
    // fallback: pick 0 or 1
    found = videoDevices[facingMode === "user" ? 0 : 1];
  }
  return found?.deviceId;
};

const startCamera = async () => {
  try {
    setError(null);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    let constraints: MediaStreamConstraints = {
      video: { facingMode: { ideal: facingMode } }
    };

    // Try to use deviceId for better compatibility
    const deviceId = await getCameraDeviceId(facingMode);
    if (deviceId) {
      constraints = { video: { deviceId: { exact: deviceId } } };
    }

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    setStream(mediaStream);

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
  } catch (err: any) {
    console.log("Camera error:", err);
    setError("Camera access failed. Please allow camera permission.");
  }
};

const switchCamera = async () => {
  setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  stopCamera();
  setTimeout(startCamera, 200); // wait a bit for stream to stop
};

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

 

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedImage(imageData)
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      handleClose()
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setError(null)
    onClose()
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera()
    }
    return () => stopCamera()
  }, [isOpen, facingMode])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{capturedImage ? "Review your image" : "Position document and capture"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center text-white p-4">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                  <p>{error}</p>
                  <Button onClick={startCamera} className="mt-4 bg-transparent" variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : capturedImage ? (
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <Button onClick={switchCamera} className="absolute top-4 right-4 bg-black/50" size="sm">
                  <SwitchCamera className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center gap-4">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={handleRetake}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" />
                  Use Image
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={captureImage} disabled={!!error}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
