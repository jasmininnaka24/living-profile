// src/lib/fetchCharacterFacts.ts
import { request } from "./api";

export type Facts = {
  background: string;
  notable_works: string | string[] | null; 
  occupation: string;
  first_appearance: string | null;
  era: string;
};

export async function fetchCharacterFacts(name: string): Promise<Facts | null> {
  const character_name = name.trim();
  if (!character_name) return null;

  try {
    const data = await request<Facts>("/character", {
      method: "POST",
      body: JSON.stringify({ character_name, force_tool: true }),
    });

    // Normalize & add safe fallbacks
    const background =
      (data.background && data.background.trim()) || "N/A";
    const occupation =
      (data.occupation && data.occupation.trim()) || "N/A";
    const first_appearance =
      (data.first_appearance && String(data.first_appearance).trim()) || "N/A";
    const era = (data.era && data.era.trim()) || "Unknown";

    // notable_works may be an array or a string; keep as-is (your Main handles both)
    const notable_works =
      Array.isArray((data as any).notable_works)
        ? (data as any).notable_works
        : (data.notable_works ?? "N/A");

    return {
      background,
      notable_works,
      occupation,
      first_appearance,
      era,
    };
  } catch (err) {
    console.error("Error fetching character facts:", err);
    return null;
  }
}
