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
import { X, AlertCircle, QrCode, RotateCcw, Check } from "lucide-react";
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
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const { toast } = useToast();

  // enumerate & pick back camera when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setScanCount(0);
    setScannedCode(null);

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const cams = devices.filter((d) => d.kind === "videoinput");
        const back = cams.find((d) => /back|rear|environment/i.test(d.label));
        setDeviceId(back?.deviceId || cams[0]?.deviceId);
        setIsScanning(true);
      })
      .catch((e) => {
        console.error("Could not enumerate devices", e);
        setError("Could not find any camera.");
      });
  }, [isOpen]);

  // handle scan & errors
  const handleScan = useCallback(
    (err: any, result: any) => {
      setScanCount((c) => c + 1);

      if (err) {
        console.debug("QRScan error:", err.name, err.message);
        const isPermissionError =
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError" ||
          err.name === "NotReadableError";

        if (isPermissionError) {
          setError("Camera access failed. Please check permissions.");
          toast({
            title: "Camera error",
            description:
              err.name === "NotAllowedError"
                ? "Permission denied. Please grant camera access in your browser settings."
                : err.message,
            variant: "destructive",
          });
          setIsScanning(false);
        }
        // otherwise ignore “no code found” errors
        return;
      }

      if (result?.text?.trim()) {
        const code = result.text.trim();
        console.log("QR Code scanned:", code);
        setScannedCode(code);
        setError(null);
        setIsScanning(false);
        toast({
          title: "QR Code Detected!",
          description: code,
        });
      }
    },
    [toast]
  );

  const handleRetry = () => {
    setError(null);
    setScanCount(0);
    setScannedCode(null);
    setIsScanning(true);
  };

  const handleConfirm = () => {
    if (scannedCode) {
      onScan(scannedCode);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    setError(null);
    setScanCount(0);
    setScannedCode(null);
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
              : scannedCode
              ? "QR Code detected! Review and confirm."
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
                <Button variant="outline" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            ) : scannedCode ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <QrCode className="h-12 w-12 mb-4 text-green-400" />
                <p className="text-lg font-semibold mb-2">QR Code Detected!</p>
                <p className="text-sm text-gray-300 break-all font-mono">
                  {scannedCode}
                </p>
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

            {!error && !scannedCode && (
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
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
