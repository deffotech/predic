import { type Party } from "./types";

export const AppName = "VoteMapper";

export const PARTY_COLORS: Record<Party, string> = {
  Saffron: "#FF9933",
  Red: "#E63946",
  Black: "#212529",
  White: "#F8F9FA",
  Yellow: "#FFCA3A",
  Green: "#2A9D8F",
};

// CSS-friendly HSL values for use in chart configurations
export const PARTY_COLORS_HSL: Record<Party, string> = {
    Saffron: "34 100% 60%",
    Red: "355 79% 55%",
    Black: "210 10% 23%",
    White: "210 17% 98%",
    Yellow: "45 100% 62%",
    Green: "172 58% 38%",
}
