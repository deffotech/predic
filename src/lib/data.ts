import type { Voter } from "./types";

// In-memory store for demonstration purposes.
// In a real application, this would be a database like Firestore.
export let voters: Voter[] = [
  {
    id: "1",
    name: "John Doe",
    age: 45,
    party: "Red",
    address: "123 Main St, Los Angeles, CA",
    peopleInHouse: 4,
    designation: "Software Engineer",
    lat: 34.052235,
    lng: -118.243683,
    notes: "Lives in downtown LA.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    age: 32,
    party: "Green",
    address: "456 Oak Ave, Los Angeles, CA",
    peopleInHouse: 2,
    designation: "Environmental Scientist",
    lat: 34.062235,
    lng: -118.253683,
    notes: "Strong environmental advocate.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Peter Jones",
    age: 58,
    party: "Saffron",
    address: "789 Pine Ln, Los Angeles, CA",
    peopleInHouse: 1,
    designation: "Retired",
    lat: 34.042235,
    lng: -118.233683,
    notes: "",
    createdAt: new Date().toISOString(),
  },
];
