
"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Voter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Loader2, X, Trash2, Pencil, User, MapPinPlus, Info } from "lucide-react";
import { PARTY_COLORS } from "@/lib/constants";
import VoterForm from "@/components/forms/VoterForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteVoter } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

type MapContainerProps = {
  initialVoters: Voter[];
  apiKey: string;
};

type DialogState = {
  mode: 'add' | 'edit' | 'view';
  voter: Voter | null;
  coords?: { lat: number; lng: number };
} | null;

function MapContent({ initialVoters, apiKey }: MapContainerProps) {
  const firestore = useFirestore();
  const votersQuery = useMemoFirebase(() => firestore && collection(firestore, 'voters'), [firestore]);
  const { data: voters, isLoading: isLoadingVoters } = useCollection<Voter>(votersQuery);

  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India
  const [zoom, setZoom] = useState(5);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const openAddDialogAtCurrentLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(newCoords);
        setZoom(15);
        setDialogState({ 
            mode: 'add', 
            voter: null, 
            coords: newCoords
        });
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Could not get your location. Please enable location services and grant permission.",
        });
      }
    );
  }, [toast]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
        openAddDialogAtCurrentLocation();
    } else {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                });
                setZoom(12);
            },
            () => {
                console.info("Could not get user location, defaulting to center.");
            }
        );
    }
  }, [search_params, openAddDialogAtCurrentLocation]);
  
  const handleDialogClose = () => setDialogState(null);

  const handleFormSuccess = (updatedVoter: Voter, mode: 'add' | 'edit') => {
    // No need to update local state, useCollection handles it
    handleDialogClose();
  };
  
  const handleMapClick = (ev: google.maps.MapMouseEvent) => {
    if (ev.latLng) {
      setDialogState({ 
        mode: 'add', 
        voter: null, 
        coords: ev.latLng.toJSON() 
      });
    }
  };

  const handleAddClick = () => {
    openAddDialogAtCurrentLocation();
  };
  
  const handleDelete = async (voterId: string) => {
    setIsDeleting(true);
    const result = await deleteVoter(voterId);
    if (result.success) {
      toast({ title: "Success", description: "Voter data deleted." });
      handleDialogClose();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsDeleting(false);
  };

  const renderDialogContent = () => {
    if (!dialogState) return null;

    const { mode, voter } = dialogState;

    if (mode === 'view' && voter) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><User /> Voter Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm">
                    <p><strong>Name:</strong> {voter.name}</p>
                    <p><strong>Age:</strong> {voter.age}</p>
                    <p><strong>Party:</strong> <Badge style={{ backgroundColor: PARTY_COLORS[voter.party], color: voter.party === 'White' || voter.party === 'Yellow' ? '#000' : '#fff' }}>{voter.party}</Badge></p>
                    <p><strong>Address:</strong> {voter.address}</p>
                    <p><strong># in House:</strong> {voter.peopleInHouse}</p>
                    <p><strong>Designation:</strong> {voter.designation}</p>
                    <p><strong>Notes:</strong> {voter.notes || 'N/A'}</p>
                </div>
                <div className="flex justify-end gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the voter's data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(voter.id)} disabled={isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" size="sm" onClick={() => setDialogState({ mode: 'edit', voter, coords: {lat: voter.lat, lng: voter.lng} })}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </div>
            </DialogContent>
        )
    }

    if(mode === 'add' || mode === 'edit') {
        return (
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add New Voter' : 'Edit Voter'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'add' ? 'Enter the details for the new voter at the selected location.' : 'Update the voter\'s information.'}
                    </DialogDescription>
                </DialogHeader>
                <VoterForm 
                    voter={voter} 
                    coords={dialogState.coords} 
                    onSuccess={(updatedVoter, mode) => {
                        handleFormSuccess(updatedVoter, mode);
                        // Center map on new voter
                        if (mode === 'add') {
                            setCenter({ lat: updatedVoter.lat, lng: updatedVoter.lng });
                            setZoom(15);
                        }
                    }}
                    onCancel={handleDialogClose}
                />
            </DialogContent>
        )
    }

    return null
  }

  return (
    <div className="w-full h-full relative">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={"votemapper-map"}
          center={center}
          zoom={zoom}
          onCenterChanged={(e) => setCenter(e.detail.center)}
          onZoomChanged={(e) => setZoom(e.detail.zoom)}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          className="w-full h-full"
          onClick={handleMapClick}
        >
          {isLoadingVoters && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Loader2 className="h-10 w-10 animate-spin" /></div>}
          {voters?.map((voter) => (
            <AdvancedMarker
              key={voter.id}
              position={{ lat: voter.lat, lng: voter.lng }}
              onClick={() => setDialogState({ mode: 'view', voter, coords: { lat: voter.lat, lng: voter.lng } })}
            >
              <MapPin style={{ color: PARTY_COLORS[voter.party], fill: PARTY_COLORS[voter.party] }} size={36} />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="absolute bottom-6 right-6 z-10 shadow-lg rounded-full h-16 w-16"
              onClick={handleAddClick}
              aria-label="Add Voter At Current Location"
            >
              <MapPinPlus size={32} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Voter At Current Location</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={!!dialogState} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
        {renderDialogContent()}
      </Dialog>
    </div>
  );
}


export default function MapContainer(props: MapContainerProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
      <MapContent {...props} />
    </Suspense>
  )
}
