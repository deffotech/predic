import { getVoters } from "@/lib/actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
    const voters = await getVoters();

    return(
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
            <DashboardClient initialVoters={voters} />
        </div>
    );
}
