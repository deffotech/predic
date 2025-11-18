'use client';

import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
    const initialVoters: any[] = [];

    return(
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
            <DashboardClient initialVoters={initialVoters} />
        </div>
    );
}
