import { getVoters } from "@/lib/actions";
import MapContainer from "@/components/map/MapContainer";

export default async function MapPage() {
  const voters = await getVoters();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-semibold text-destructive">Configuration Error</h1>
        <p className="mt-2 text-muted-foreground">
          Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
        </p>
      </div>
    );
  }

  return <MapContainer initialVoters={voters} apiKey={apiKey} />;
}
