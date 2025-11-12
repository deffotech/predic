
"use client";

import { useState, useMemo } from 'react';
import type { Voter, Party } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Users, Vote, CheckCircle, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { PARTY_COLORS, PARTY_COLORS_HSL } from '@/lib/constants';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

type DashboardClientProps = {
  initialVoters: Voter[];
};

export default function DashboardClient({ initialVoters }: DashboardClientProps) {
  const firestore = useFirestore();
  const votersQuery = useMemoFirebase(() => firestore && collection(firestore, 'voters'), [firestore]);
  const { data: voters, isLoading: isLoadingVoters } = useCollection<Voter>(votersQuery);

  const stats = useMemo(() => {
    const voterData = voters || [];
    const partyCounts = voterData.reduce((acc, voter) => {
      acc[voter.party] = (acc[voter.party] || 0) + 1;
      return acc;
    }, {} as Record<Party, number>);

    const totalVoters = voterData.length;

    const leadingParty = Object.entries(partyCounts).reduce(
      (leader, [party, count]) => (count > leader.count ? { party: party as Party, count } : leader),
      { party: null as Party | null, count: 0 }
    );
    
    const chartData = Object.entries(partyCounts).map(([party, count]) => ({
        party,
        count,
        fill: `var(--color-${party})`
    })).sort((a, b) => b.count - a.count);

    return { totalVoters, leadingParty, chartData };
  }, [voters]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    Object.keys(PARTY_COLORS_HSL).forEach(party => {
        config[party] = {
            label: party,
            color: `hsl(${PARTY_COLORS_HSL[party as Party]})`
        };
    });
    return config;
  }, []);

  const handleExport = () => {
    const dataToExport = voters || [];
    const headers = ['ID', 'Name', 'Age', 'Party', 'Address', '# People', 'Designation', 'Latitude', 'Longitude', 'Notes', 'Date Added'];
    const rows = dataToExport.map(v => [v.id, v.name, v.age, v.party, `"${v.address}"`, v.peopleInHouse, v.designation, v.lat, v.lng, v.notes?.replace(/"/g, '""') || '', v.createdAt].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voter_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingVoters ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalVoters}</div>
            <p className="text-xs text-muted-foreground">Total data points collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leading Party</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingVoters ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.leadingParty.party ? (
                <>
                <div className="text-2xl font-bold">{stats.leadingParty.party}</div>
                <p className="text-xs text-muted-foreground">with {stats.leadingParty.count} predicted votes</p>
                </>
             ) : (
                <>
                <div className="text-2xl font-bold">No Data</div>
                <p className="text-xs text-muted-foreground">Add voters to see predictions</p>
                </>
             )}
          </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Export Data</CardTitle>
                <CardDescription>Download all collected data as a CSV file.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-end">
                <Button onClick={handleExport} className="w-full" disabled={isLoadingVoters || !voters || voters.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                </Button>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Party Support Overview</CardTitle>
          <CardDescription>A summary of predicted votes for each party.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={stats.chartData}>
              <XAxis dataKey="party" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Voter Data</CardTitle>
          <CardDescription>A detailed list of all collected voter information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingVoters ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : voters && voters.length > 0 ? voters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell className="font-medium">{voter.name}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: PARTY_COLORS[voter.party], color: voter.party === 'White' || voter.party === 'Yellow' ? '#000' : '#fff' }}>
                        {voter.party}
                      </Badge>
                    </TableCell>
                    <TableCell>{voter.address}</TableCell>
                    <TableCell>{voter.designation}</TableCell>
                    <TableCell className="text-right">{format(new Date(voter.createdAt), 'PP')}</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No voter data available. Start by adding voters on the map.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
