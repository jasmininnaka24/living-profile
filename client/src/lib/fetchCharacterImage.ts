export async function fetchCharacterImage(name: string): Promise<string | null> {
  const title = encodeURIComponent(name.trim());
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();

    if (data?.type === "disambiguation") return null;

    const big = data?.originalimage?.source as string | undefined;
    const thumb = data?.thumbnail?.source as string | undefined;
    if (big) return big;
    if (thumb) return thumb;
    return null;
  } catch {
    return null;
  }
}

// deterministic fallback avatar (same name → same face)
export function unknownAvatar(size = 64): string {
  return `https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg`; 
  // Or any local /public/unknown.png file:
  // return `/unknown.png`;
}