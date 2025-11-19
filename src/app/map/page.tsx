
"use client";
import MapContainer from "@/components/map/MapContainer";
import { Button } from "@/components/ui/button";
import { AlertCircle, MapPin } from "lucide-react";

export default function MapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "AIzaSyAfadPhzJvlM7FIJwO706RsFFDznmDNaZU") {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
        <div className="max-w-md w-full bg-background border rounded-lg p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <h1 className="text-2xl font-semibold">Map Demo Mode</h1>
          <p className="text-muted-foreground">
            To use the interactive Google Maps feature, add your own API key to `.env.local`:
          </p>
          <code className="block bg-muted p-3 rounded text-sm text-left break-all">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
          </code>
          <div className="space-y-3 mt-6 pt-4 border-t">
            <p className="text-sm font-medium">Demo Voter Locations:</p>
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <strong>Ravi Kumar</strong> - Bangalore, MG Road
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <strong>Anjali Singh</strong> - Mumbai, Andheri
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Interactive map will be available once you add a valid Google Maps API key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
     <MapContainer apiKey={apiKey} />
    </div>
  );
}
