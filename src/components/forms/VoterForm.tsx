
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Voter } from "@/lib/types";
import { parties } from "@/lib/types";
import { addVoter, updateVoter } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().optional(),
  age: z.coerce.number().optional(),
  party: z.enum(parties).optional(),
  address: z.string().optional(),
  peopleInHouse: z.coerce.number().optional(),
  designation: z.string().optional(),
  notes: z.string().optional(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

type VoterFormValues = z.infer<typeof formSchema>;

type VoterFormProps = {
  voter?: Voter | null;
  coords?: { lat: number; lng: number };
  onSuccess: (voter: Voter, mode: 'add' | 'edit') => void;
  onCancel: () => void;
};

export default function VoterForm({ voter, coords, onSuccess, onCancel }: VoterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mode = voter ? 'edit' : 'add';

  const form = useForm<VoterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: voter?.name ?? "",
      age: voter?.age,
      party: voter?.party,
      address: voter?.address ?? "",
      peopleInHouse: voter?.peopleInHouse,
      designation: voter?.designation ?? "",
      notes: voter?.notes ?? "",
      lat: voter?.lat ?? coords?.lat,
      lng: voter?.lng ?? coords?.lng,
    },
  });

  async function onSubmit(data: VoterFormValues) {
    setIsLoading(true);
    try {
      const submissionData = {
        name: data.name || "Unnamed",
        party: data.party || "White", // Default party if not selected
        lat: data.lat,
        lng: data.lng,
        age: data.age,
        address: data.address,
        peopleInHouse: data.peopleInHouse,
        designation: data.designation,
        notes: data.notes
      };

      if (mode === 'add') {
        const result = await addVoter(submissionData);
        if (result.success && result.voter) {
          toast({ title: "Success", description: "Voter added successfully." });
          onSuccess(result.voter, 'add');
        } else {
          throw new Error("Failed to add voter.");
        }
      } else if (voter) {
        const result = await updateVoter(voter.id, submissionData);
        if (result.success && result.voter) {
          toast({ title: "Success", description: "Voter updated successfully." });
          onSuccess(result.voter, 'edit');
        } else {
          throw new Error(result.error || "Failed to update voter.");
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="42" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="party"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party Affiliation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a party" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parties.map((partyName) => (
                      <SelectItem key={partyName} value={partyName}>
                        {partyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="peopleInHouse"
                render={({ field }) => (
                <FormItem>
                    <FormLabel># People in House</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Engineer, Doctor" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

         <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional information..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Add Voter' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
