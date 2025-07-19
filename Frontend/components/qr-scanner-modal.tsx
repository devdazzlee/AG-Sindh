// components/QRScannerModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import QrReader from "react-qr-barcode-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, Check, AlertCircle, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (qrCode: string) => void;
  title?: string;
}

export function QRScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Scan QR Code",
}: QRScannerModalProps) {
  const [deviceId, setDeviceId] = useState<string>();
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 1) When opened, enumerate video inputs and pick a back camera if available
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setScanCount(0);
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        // look for labels containing "back"/"rear"/"environment"
        const back = videoInputs.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        setDeviceId(back?.deviceId || videoInputs[0]?.deviceId);
        setIsScanning(true);
      })
      .catch((e) => {
        console.error("Camera enumeration failed", e);
        setError("Could not access any camera devices.");
      });
  }, [isOpen]);

  // 2) Handle scan updates & errors
  const handleScan = useCallback(
    (err: any, result: any) => {
      setScanCount((c) => c + 1);

      if (err) {
        // non‑critical QR‑not‑found glitches
        if (err.name === "NotFoundException") return;

        console.error("QR Scan error:", err);
        setError("Camera access failed. Please check permissions.");
        toast({
          title: "Camera error",
          description:
            err.name === "NotAllowedError"
              ? "Permission denied."
              : err.message || "Failed to access camera.",
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      if (result?.text?.trim()) {
        const code = result.text.trim();
        onScan(code);
        setIsScanning(false);
      }
    },
    [onScan, toast]
  );

  const handleRetry = () => {
    setError(null);
    setScanCount(0);
    setIsScanning(true);
  };

  const handleClose = () => {
    setIsScanning(false);
    setError(null);
    setScanCount(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {error
              ? "Error accessing camera"
              : isScanning
              ? "Point your camera at a QR code"
              : "Scan complete or cancelled."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              isScanning && (
                <QrReader
                  onUpdate={handleScan}
                  delay={200}
                  videoConstraints={
                    deviceId ? { deviceId: { exact: deviceId } } : undefined
                  }
                  stopStream={!isScanning}
                />
              )
            )}
            {/* overlay info */}
            {!error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white">
                <QrCode className="h-16 w-16 mb-4 text-gray-400" />
                <p className="text-lg">Point camera at QR code</p>
                <p className="text-sm text-gray-400 mt-2">
                  Attempts: {scanCount}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {!error && (
              <div className="flex items-center text-sm text-gray-500">
                <QrCode className="h-4 w-4 mr-2" />
                {isScanning ? `Scanning… (${scanCount})` : "Idle"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
