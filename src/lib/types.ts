
export const parties = ["Saffron", "Red", "Black", "White", "Yellow", "Green"] as const;

export type Party = (typeof parties)[number];

export type Voter = {
  id: string;
  name: string;
  age: number;
  party: Party;
  address: string;
  peopleInHouse: number;
  designation: string;
  notes?: string;
  lat: number;
  lng: number;
  createdAt: string;
};

export type NewVoter = Omit<Voter, "id" | "createdAt">;
export type UpdatableVoter = Partial<Omit<Voter, "id" | "createdAt">>;
