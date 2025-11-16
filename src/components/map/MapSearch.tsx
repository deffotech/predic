
"use client";

import { useRef, useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type MapSearchProps = {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
};

export default function MapSearch({ onPlaceSelect }: MapSearchProps) {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        fields: ["geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      onPlaceSelect(autocomplete.getPlace());
    });

    setPlaceAutocomplete(autocomplete);
  }, [places, onPlaceSelect]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a location"
          className="w-full pl-10 shadow-md"
        />
      </div>
    </div>
  );
}
