
import { getVoters } from "@/lib/actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

// This page is now mostly a client component container.
// initialVoters can be passed for faster initial load, but the component
// will switch to a real-time stream from Firestore.

export default async function DashboardPage() {
    const initialVoters = await getVoters();

    return(
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
            <DashboardClient initialVoters={initialVoters} />
        </div>
    );
}
