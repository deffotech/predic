"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary
} from "@vis.gl/react-google-maps";

import { Button } from "@/components/ui/button";
import { MapPin, Loader2, MapPinPlus, Pencil, Trash2, User } from "lucide-react";

import { PARTY_COLORS } from "@/lib/constants";

const DEFAULT_PARTY_COLOR = "#333333";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import MapSearch from "./MapSearch";

/* ---------------------------------------------------------
   FRONTEND-ONLY MODE — NO BACKEND
--------------------------------------------------------- */

type Party = keyof typeof PARTY_COLORS;

type Voter = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  age: number;
  party: Party;
  address: string;
  peopleInHouse: number;
  designation: string;
  notes?: string;
};

const DUMMY_VOTERS: Voter[] = [
  {
    id: "1",
    name: "Ravi Kumar",
    lat: 12.9716,
    lng: 77.5946,
    age: 40,
    party: "Saffron",
    address: "Bangalore, MG Road",
    peopleInHouse: 4,
    designation: "Engineer",
    notes: "Supportive"
  },
  {
    id: "2",
    name: "Anjali Singh",
    lat: 19.076,
    lng: 72.8777,
    age: 32,
    party: "Red",
    address: "Mumbai, Andheri",
    peopleInHouse: 3,
    designation: "Teacher"
  }
];

type MapContainerProps = { apiKey: string };

type DialogState = {
  mode: "add" | "edit" | "view";
  voter: Voter | null;
  coords?: { lat: number; lng: number };
  address?: string;
} | null;

/* ---------------------------------------------------------
   MAIN CONTENT
--------------------------------------------------------- */

function MapContent() {
  const map = useMap();
  const searchParams = useSearchParams();

  const [voters] = useState<Voter[]>(DUMMY_VOTERS);
  const [dialogState, setDialogState] = useState<DialogState>(null);

  const [center] = useState({ lat: 20.5937, lng: 78.9629 });
  const [zoom] = useState(5);

  const geocoding = useMapsLibrary("geocoding");
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (geocoding) setGeocoder(new geocoding.Geocoder());
  }, [geocoding]);

  const getAddressFromCoords = useCallback(
    async (coords: { lat: number; lng: number }) => {
      if (!geocoder) return "Unknown address";
      try {
        const res = await geocoder.geocode({ location: coords });
        return res.results?.[0]?.formatted_address || "Unknown";
      } catch {
        return "Unknown address";
      }
    },
    [geocoder]
  );

  /* ---------------------------------------------------------
     ADD AT CURRENT LOCATION
  --------------------------------------------------------- */
  const openAddDialog = useCallback(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      const address = await getAddressFromCoords(coords);

      map?.panTo(coords);
      map?.setZoom(15);

      setDialogState({
        mode: "add",
        voter: null,
        coords,
        address
      });
    });
  }, [map, getAddressFromCoords]);

  useEffect(() => {
    if (searchParams.get("add") === "true") openAddDialog();
  }, [searchParams, openAddDialog]);

  /* ---------------------------------------------------------
     MAP CLICK = open add dialog
  --------------------------------------------------------- */
  const handleMapClick = async (ev: google.maps.MapMouseEvent) => {
    if (!ev.latLng) return;
    const coords = ev.latLng.toJSON();
    const address = await getAddressFromCoords(coords);

    setDialogState({
      mode: "add",
      voter: null,
      coords,
      address
    });
  };

  /* ---------------------------------------------------------
     VIEW / ADD dialog content
  --------------------------------------------------------- */
  const renderDialogContent = () => {
    if (!dialogState) return null;
    const { mode, voter } = dialogState;

    if (mode === "view" && voter) {
      const color = PARTY_COLORS[voter.party] ?? DEFAULT_PARTY_COLOR;

      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User /> Voter Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm mt-3">
            <div><strong>Name:</strong> {voter.name}</div>
            <div><strong>Age:</strong> {voter.age}</div>

            <div>
              <strong>Party:</strong>{" "}
              <Badge style={{ backgroundColor: color, color: "#fff" }}>
                {voter.party}
              </Badge>
            </div>

            <div><strong>Address:</strong> {voter.address}</div>
            <div><strong>People:</strong> {voter.peopleInHouse}</div>
            <div><strong>Job:</strong> {voter.designation}</div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button disabled size="sm" variant="outline">
              <Pencil className="w-4 h-4 mr-2" /> Edit (disabled)
            </Button>
            <Button disabled size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete (disabled)
            </Button>
          </div>
        </DialogContent>
      );
    }

    if (mode === "add") {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Voter (Frontend Only)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Backend API is disabled. Add action is unavailable.
          </p>
        </DialogContent>
      );
    }
  };

  /* ---------------------------------------------------------
     RENDER MAP UI
  --------------------------------------------------------- */
  return (
    <div className="w-full h-full relative">
      <MapSearch onPlaceSelect={() => {}} />

      <Map
        mapId="votemapper-map"
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        className="w-full h-full"
        // onClick={handleMapClick}
      >
        {voters.map((v) => {
          const color = PARTY_COLORS[v.party] ?? DEFAULT_PARTY_COLOR;

          return (
            <AdvancedMarker
              key={v.id}
              position={{ lat: v.lat, lng: v.lng }}
              onClick={() =>
                setDialogState({
                  mode: "view",
                  voter: v,
                  coords: { lat: v.lat, lng: v.lng }
                })
              }
            >
              <MapPin
                size={32}
                style={{ color, fill: color }}
              />
            </AdvancedMarker>
          );
        })}
      </Map>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="absolute bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
              onClick={openAddDialog}
            >
              <MapPinPlus size={32} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new voter</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={!!dialogState} onOpenChange={() => setDialogState(null)}>
        {renderDialogContent()}
      </Dialog>
    </div>
  );
}

/* ---------------------------------------------------------
   EXPORT
--------------------------------------------------------- */

export default function MapContainer({ apiKey }: MapContainerProps) {
  return (
    <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin" />}>
      <APIProvider apiKey={apiKey} libraries={["places", "geocoding", "marker"]}>
        <MapContent />
      </APIProvider>
    </Suspense>
  );
}
