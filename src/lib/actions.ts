"use server";

import { revalidatePath } from "next/cache";
import { voters } from "./data";
import type { NewVoter, UpdatableVoter, Voter } from "./types";

// Simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getVoters(): Promise<Voter[]> {
  await sleep(500); // Simulate DB call
  return voters;
}

export async function addVoter(voter: NewVoter) {
  await sleep(1000); // Simulate DB call
  const newVoter: Voter = {
    ...voter,
    id: (voters.length + 1).toString(),
    createdAt: new Date().toISOString(),
  };
  voters.push(newVoter);
  revalidatePath("/map");
  revalidatePath("/dashboard");
  return { success: true, voter: newVoter };
}

export async function updateVoter(id: string, voterUpdate: UpdatableVoter) {
  await sleep(1000); // Simulate DB call
  const voterIndex = voters.findIndex((v) => v.id === id);
  if (voterIndex === -1) {
    return { success: false, error: "Voter not found" };
  }
  voters[voterIndex] = { ...voters[voterIndex], ...voterUpdate };
  revalidatePath("/map");
  revalidatePath("/dashboard");
  return { success: true, voter: voters[voterIndex] };
}

export async function deleteVoter(id: string) {
  await sleep(1000); // Simulate DB call
  const voterIndex = voters.findIndex((v) => v.id === id);
  if (voterIndex === -1) {
    return { success: false, error: "Voter not found" };
  }
  voters.splice(voterIndex, 1);
  revalidatePath("/map");
  revalidatePath("/dashboard");
  return { success: true };
}