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

  // ✅ FIX — frontend-only fake voter
  async function onSubmit(data: VoterFormValues) {
    setIsLoading(true);

    // try {
    //   const fakeVoter: Voter = {
    //     id: voter?.id || String(Date.now()),  // unique for frontend
    //     name: data.name || "Unnamed",
    //     age: data.age ?? 0,
    //     party: data.party || "White",
    //     address: data.address ?? "",
    //     peopleInHouse: data.peopleInHouse ?? 0,
    //     designation: data.designation ?? "",
    //     notes: data.notes ?? "",
    //     lat: data.lat,
    //     lng: data.lng,
    //   };

    //   toast({
    //     title: "Frontend Mode",
    //     description: "Voter created locally (no backend).",
    //   });

    //   onSuccess(fakeVoter, mode);
    // } catch (e) {
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: "Something went wrong.",
    //   });
    // }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* your form UI continues here … */}
      </form>
    </Form>
  );
}
