// src/lib/fetchCharacterFacts.ts
type Facts = {
  background: string;
  notable_works: string;
  occupation: string;
  first_appearance: string;
  era: string;
};

// Call your FastAPI character profile API
export async function fetchCharacterFacts(name: string): Promise<Facts | null> {
  try {
    const res = await fetch("http://127.0.0.1:8000/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_name: name,
        force_tool: true
      })
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Ensure it has all required fields
    return {
      background: data.background ?? "N/A",
      notable_works: data.notable_works ?? "N/A",
      occupation: data.occupation ?? "N/A",
      first_appearance: data.first_appearance ?? "N/A",
      era: data.era ?? "N/A"
    };
  } catch (err) {
    console.error("Error fetching character facts:", err);
    return null;
  }
}
