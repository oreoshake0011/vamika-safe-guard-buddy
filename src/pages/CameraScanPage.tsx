import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Wifi, Bluetooth, Camera, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BleClient } from "@capacitor-community/bluetooth-le";

// Global for WiFiWizard2
declare global {
  interface Window {
    WifiWizard2: any;
  }
}

type DetectedDevice = {
  id: string;
  name: string;
  type: "wifi" | "bluetooth";
  signalStrength: number;
  isSuspicious: boolean;
};

const CameraScanPage = () => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const { toast } = useToast();

  const signalLabel = (value: number) => {
    if (value > 80) return "Strong";
    if (value > 50) return "Medium";
    return "Weak";
  };

  const scanBluetooth = async (): Promise<DetectedDevice[]> => {
    try {
      await BleClient.initialize();
      const results: DetectedDevice[] = [];

      await BleClient.requestLEScan({}, (result) => {
        results.push({
          id: result.device.deviceId || crypto.randomUUID(),
          name: result.device.name || "Unknown Device",
          type: "bluetooth",
          signalStrength: result.rssi || 0,
          isSuspicious: result.device.name?.toLowerCase().includes("cam") || false,
        });
      });

      return new Promise((resolve) => {
        setTimeout(async () => {
          await BleClient.stopLEScan();
          resolve(results);
        }, 8000);
      });
    } catch (error) {
      console.error("Bluetooth scan error:", error);
      return [];
    }
  };

  const scanWiFi = async (): Promise<DetectedDevice[]> => {
    try {
      const networks = await window.WifiWizard2.scan();
      return networks.map((net: any) => ({
        id: net.BSSID,
        name: net.SSID || "Hidden Network",
        type: "wifi",
        signalStrength: net.level,
        isSuspicious: net.SSID === "" || net.capabilities.includes("WPS"),
      }));
    } catch (error) {
      console.error("WiFi scan error:", error);
      return [];
    }
  };

  const startScan = async () => {
    setScanning(true);
    setScanComplete(false);
    setDevices([]);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    const [bt, wifi] = await Promise.all([scanBluetooth(), scanWiFi()]);
    const all = [...bt, ...wifi];

    setDevices(all);
    setScanning(false);
    setScanComplete(true);

    const suspicious = all.filter((d) => d.isSuspicious).length;
    toast({
      title: suspicious > 0 ? "Suspicious Devices Detected" : "Scan Complete",
      description:
        suspicious > 0
          ? `${suspicious} suspicious device(s) found.`
          : "No suspicious devices detected.",
      variant: suspicious > 0 ? "destructive" : "default",
    });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Scan Nearby Devices</h1>
          <p className="text-muted-foreground text-sm">
            Detect Bluetooth and WiFi signals nearby
          </p>
        </div>

        <div className="flex flex-col items-center bg-card border rounded-xl p-6 mb-6">
          <div
            className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-primary/10 ${
              scanning ? "animate-pulse" : ""
            }`}
          >
            <Camera className="h-16 w-16 text-primary" />
            {scanning && (
              <div className="absolute inset-0 rounded-full border-4 border-primary border-dashed animate-spin"></div>
            )}
          </div>

          {scanning && (
            <div className="w-full mb-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center mt-2">Scanning... {progress}%</p>
            </div>
          )}

          <Button onClick={startScan} disabled={scanning} className="w-full">
            {scanning ? "Scanning..." : scanComplete ? "Scan Again" : "Start Scan"}
          </Button>
        </div>

        {scanComplete && (
          <>
            <div className="mb-4 space-y-3">
              <h2 className="font-medium text-lg">Devices Found</h2>

              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`p-3 rounded-lg border ${
                    device.isSuspicious
                      ? "border-destructive/60 bg-destructive/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {device.type === "wifi" ? (
                        <Wifi className="h-4 w-4 text-primary" />
                      ) : (
                        <Bluetooth className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{device.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {device.type} • Signal: {signalLabel(device.signalStrength)}
                        </p>
                      </div>
                    </div>
                    {device.isSuspicious && (
                      <span className="text-xs text-destructive font-semibold px-2 py-0.5 bg-destructive/10 rounded-full">
                        Suspicious
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                Safety Tips
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Unfamiliar names may indicate hidden cameras</li>
                <li>• "Hidden Network" or strong WPS signals can be suspicious</li>
                <li>• Disable WiFi/Bluetooth in unsafe environments</li>
                <li>• Regularly scan in hotel rooms or rentals</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CameraScanPage;
