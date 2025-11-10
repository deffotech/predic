"use client";

import { useState, useEffect, useCallback } from "react";
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

type MapContainerProps = {
  initialVoters: Voter[];
  apiKey: string;
};

type DialogState = {
  mode: 'add' | 'edit' | 'view';
  voter: Voter | null;
  coords?: { lat: number; lng: number };
} | null;

export default function MapContainer({ initialVoters, apiKey }: MapContainerProps) {
  const [voters, setVoters] = useState(initialVoters);
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India
  const [zoom, setZoom] = useState(5);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setZoom(12);
      },
      () => {
        // Handle error or user denial. Default center is already set.
        console.info("Could not get user location, defaulting to center.");
      }
    );
  }, []);
  
  const handleDialogClose = () => setDialogState(null);

  const handleFormSuccess = (updatedVoter: Voter, mode: 'add' | 'edit') => {
    if (mode === 'add') {
      setVoters(prev => [...prev, updatedVoter]);
    } else {
      setVoters(prev => prev.map(v => v.id === updatedVoter.id ? updatedVoter : v));
    }
    handleDialogClose();
  };

  const handleAddClick = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDialogState({ 
            mode: 'add', 
            voter: null, 
            coords: { lat: position.coords.latitude, lng: position.coords.longitude }
        });
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Could not get your location. Please enable location services.",
        });
      }
    );
  };
  
  const handleDelete = async (voterId: string) => {
    setIsDeleting(true);
    const result = await deleteVoter(voterId);
    if (result.success) {
      setVoters(prev => prev.filter(v => v.id !== voterId));
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
                <div className="space-y-4 py-4">
                    <p><strong>Name:</strong> {voter.name}</p>
                    <p><strong>Age:</strong> {voter.age}</p>
                    <p><strong>Party:</strong> <Badge style={{ backgroundColor: PARTY_COLORS[voter.party], color: voter.party === 'White' || voter.party === 'Yellow' ? '#000' : '#fff' }}>{voter.party}</Badge></p>
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add New Voter' : 'Edit Voter'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'add' ? 'A new voter will be added at your current location.' : 'Update the voter\'s information.'}
                    </DialogDescription>
                </DialogHeader>
                <VoterForm 
                    voter={voter} 
                    coords={dialogState.coords} 
                    onSuccess={(updatedVoter) => handleFormSuccess(updatedVoter, mode)}
                    onCancel={handleDialogClose}
                />
            </DialogContent>
        )
    }

    return null
  }

  return (
    <div className="w-full h-full">
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
        >
          {voters.map((voter) => (
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
              aria-label="Add Voter"
            >
              <Plus size={32} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Voter</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={!!dialogState} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
        {renderDialogContent()}
      </Dialog>
    </div>
  );
}
