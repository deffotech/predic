
"use client";
import MapContainer from "@/components/map/MapContainer";

export default function MapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-semibold text-destructive">Configuration Error</h1>
        <p className="mt-2 text-muted-foreground">
          Google Maps API key is missing. Please create a `.env.local` file and add<br />
          `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY`
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
     <MapContainer apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} />

    </div>
  );
}
