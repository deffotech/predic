
'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { NewVoter, UpdatableVoter, Voter } from './types';

// This function now uses a server-side initialized Firebase instance
async function getFirestoreInstance() {
  const { firestore } = initializeFirebase();
  return firestore;
}

export async function getVoters(): Promise<Voter[]> {
  const db = await getFirestoreInstance();
  const votersCol = collection(db, 'voters');
  const voterSnapshot = await getDocs(votersCol);
  const votersList = voterSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      age: data.age,
      party: data.party,
      address: data.address,
      peopleInHouse: data.peopleInHouse,
      designation: data.designation,
      lat: data.lat,
      lng: data.lng,
      notes: data.notes,
      // Convert Firestore Timestamp to ISO string
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    } as Voter;
  });
  return votersList;
}

export async function addVoter(voter: NewVoter) {
  try {
    const db = await getFirestoreInstance();
    const docRef = await addDoc(collection(db, 'voters'), {
      ...voter,
      createdAt: serverTimestamp(),
    });

    // Fetch the newly created document to return it
    const newDoc = await getDoc(docRef);
    if (!newDoc.exists()) {
       return { success: false, error: "Failed to fetch newly created voter." };
    }
    
    const newVoterData = newDoc.data();
    const newVoter: Voter = {
        id: newDoc.id,
        ...voter,
        // Convert timestamp to string for client
        createdAt: newVoterData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    };
    
    revalidatePath('/map');
    revalidatePath('/dashboard');
    return { success: true, voter: newVoter };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error adding voter:', message);
    return { success: false, error: message };
  }
}

export async function updateVoter(id: string, voterUpdate: UpdatableVoter) {
   try {
    const db = await getFirestoreInstance();
    const voterRef = doc(db, 'voters', id);
    await updateDoc(voterRef, {
        ...voterUpdate,
        updatedAt: serverTimestamp()
    });

    const updatedDoc = await getDoc(voterRef);
     if (!updatedDoc.exists()) {
       return { success: false, error: "Voter not found after update." };
    }

    const updatedData = updatedDoc.data();
    const updatedVoter: Voter = {
        id: updatedDoc.id,
        name: updatedData.name,
        age: updatedData.age,
        party: updatedData.party,
        address: updatedData.address,
        peopleInHouse: updatedData.peopleInHouse,
        designation: updatedData.designation,
        lat: updatedData.lat,
        lng: updatedData.lng,
        notes: updatedData.notes,
        createdAt: updatedData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    };


    revalidatePath('/map');
    revalidatePath('/dashboard');
    return { success: true, voter: updatedVoter };
  } catch (error) {
     const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error updating voter:', message);
    return { success: false, error: message };
  }
}

export async function deleteVoter(id: string) {
   try {
    const db = await getFirestoreInstance();
    await deleteDoc(doc(db, 'voters', id));
    revalidatePath('/map');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
     const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error deleting voter:', message);
    return { success: false, error: message };
  }
}
