'use client';

import { useState } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VoterForm from "@/components/forms/VoterForm";
import type { Voter } from "@/lib/types";

const DUMMY: Voter[] = [
    {
        id: "1",
        name: "Ravi Kumar",
        age: 40,
        party: "Saffron",
        address: "Bangalore, MG Road",
        peopleInHouse: 4,
        designation: "Engineer",
        notes: "Supportive",
        lat: 12.9716,
        lng: 77.5946,
        createdAt: new Date().toISOString(),
    },
];

export default function DashboardPage() {
    const [voters, setVoters] = useState<Voter[]>(DUMMY);
    const [open, setOpen] = useState(false);

    function handleAdd(voter: Voter, mode: "add" | "edit") {
        if (mode === "add") {
            setVoters((s) => [voter, ...s]);
        } else {
            setVoters((s) => s.map((v) => (v.id === voter.id ? voter : v)));
        }
        setOpen(false);
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div>
                    <Button onClick={() => setOpen(true)} variant="secondary">
                        Add Details
                    </Button>
                </div>
            </div>

            <DashboardClient initialVoters={voters} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Voter</DialogTitle>
                    </DialogHeader>
                    <VoterForm
                        onCancel={() => setOpen(false)}
                        onSuccess={handleAdd}
                        coords={undefined}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
