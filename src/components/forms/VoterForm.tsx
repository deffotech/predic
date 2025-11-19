"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Voter } from "@/lib/types";
import { parties } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
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
  address?: string;
  onSuccess: (voter: Voter, mode: "add" | "edit") => void;
  onCancel: () => void;
};

export default function VoterForm({ voter, coords, address, onSuccess, onCancel }: VoterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mode = voter ? "edit" : "add";

  const form = useForm<VoterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: voter?.name ?? "",
      age: voter?.age,
      party: voter?.party,
      address: voter?.address ?? address ?? "",
      peopleInHouse: voter?.peopleInHouse,
      designation: voter?.designation ?? "",
      notes: voter?.notes ?? "",
      lat: voter?.lat ?? coords?.lat,
      lng: voter?.lng ?? coords?.lng,
    },
  });

  useEffect(() => {
    if (coords) {
      form.setValue("lat", coords.lat);
      form.setValue("lng", coords.lng);
    }
  }, [coords, form]);

  useEffect(() => {
    if (address) {
      form.setValue("address", address);
    }
  }, [address, form]);

  // ✅ FRONTEND-ONLY: create a fake voter and return it to parent via onSuccess
  async function onSubmit(data: VoterFormValues) {
    setIsLoading(true);

    try {
      const fakeVoter: Voter = {
        id: voter?.id || String(Date.now()),
        name: data.name || "Unnamed",
        age: data.age ?? 0,
        party: (data.party as Voter['party']) || ("White" as any),
        address: data.address ?? "",
        peopleInHouse: data.peopleInHouse ?? 0,
        designation: data.designation ?? "",
        notes: data.notes ?? "",
        lat: data.lat,
        lng: data.lng,
      };

      toast({
        title: "Saved (local)",
        description: "Voter saved locally. No backend was called.",
      });

      onSuccess(fakeVoter, mode);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to save voter.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("name")} />
          </div>

          <div>
            <label className="text-sm font-medium">Age</label>
            <input type="number" className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("age", { valueAsNumber: true })} />
          </div>

          <div>
            <label className="text-sm font-medium">Party</label>
            <select className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("party")}>
              {parties.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">People In House</label>
            <input type="number" className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("peopleInHouse", { valueAsNumber: true })} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Address</label>
          <input className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("address")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Latitude</label>
            <input type="number" step="any" className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("lat", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm font-medium">Longitude</label>
            <input type="number" step="any" className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("lng", { valueAsNumber: true })} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Designation</label>
          <input className="mt-1 block w-full rounded-md border px-3 py-2" {...form.register("designation")} />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea className="mt-1 block w-full rounded-md border px-3 py-2" rows={3} {...form.register("notes")} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 border">Cancel</button>
          <button type="submit" disabled={isLoading} className="rounded-md bg-primary px-4 py-2 text-white">
            {isLoading ? "Saving..." : mode === "add" ? "Add Voter" : "Save"}
          </button>
        </div>
      </form>
    </Form>
  );
}
