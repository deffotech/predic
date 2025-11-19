'use client'

import { Button } from "@/components/ui/button";
import { AppName } from "@/lib/constants";
import { ArrowRight, LayoutDashboard, Map, MapPin, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VoterForm from "@/components/forms/VoterForm";
import type { Voter } from "@/lib/types";

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);

  const handleFormSubmit = (voter: Voter, mode: "add" | "edit") => {
    console.log("Voter saved:", voter);
    setFormOpen(false);
  };
  return (
    <>
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20"
        >
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-accent"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"
        ></div>

        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground/80 to-foreground">
            {AppName}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualize and predict voting patterns with real-time, geo-tagged data collection.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="group w-full sm:w-auto">
              <Link href="/map">
                <Map className="mr-2" />
                Enter The Map
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button onClick={() => setFormOpen(true)} size="lg" variant="outline" className="w-full sm:w-auto">
              <PlusCircle className="mr-2" />
              Add Details
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/map">
                <MapPin className="mr-2" />
                Place a Marker
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Voter Details</DialogTitle>
          </DialogHeader>
          <VoterForm
            onCancel={() => setFormOpen(false)}
            onSuccess={handleFormSubmit}
            coords={undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
