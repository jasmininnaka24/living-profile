// src/lib/fetchCharacterFacts.ts
type Facts = {
  birthYear?: number | null;
  deathYear?: number | null;
  occupations?: string[];     // e.g., ["Theoretical physicist"]
  eraLabel?: string;          // e.g., "20th Century (1879–1955)"
};

// 1) Get the Wikidata QID from Wikipedia
async function getWikidataIdFromWikipedia(title: string): Promise<string | null> {
  const t = encodeURIComponent(title.trim());
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageprops&titles=${t}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    const first = pages ? pages[Object.keys(pages)[0]] : null;
    return first?.pageprops?.wikibase_item ?? null;
  } catch {
    return null;
  }
}

// 2) Pull birth/death (P569, P570) + occupations (P106) from Wikidata
export async function fetchCharacterFacts(name: string): Promise<Facts | null> {
  const qid = await getWikidataIdFromWikipedia(name);
  if (!qid) return null;

  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const entity = data?.entities?.[qid];
    if (!entity) return null;

    const claims = entity.claims || {};
    const dob = claims.P569?.[0]?.mainsnak?.datavalue?.value?.time as string | undefined; // e.g., "+1879-03-14T00:00:00Z"
    const dod = claims.P570?.[0]?.mainsnak?.datavalue?.value?.time as string | undefined;

    const birthYear = dob ? parseInt(dob.slice(1, 5), 10) : null;
    const deathYear = dod ? parseInt(dod.slice(1, 5), 10) : null;

    // Occupations are items referenced by P106
    const occIds: string[] =
      (claims.P106 || [])
        .map((c: any) => c.mainsnak?.datavalue?.value?.id)
        .filter(Boolean) ?? [];

    // Resolve occupation labels (fetch once for all ids)
    let occupations: string[] = [];
    if (occIds.length) {
      const occUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&ids=${occIds.join(
        "|"
      )}&props=labels&languages=en`;
      const occRes = await fetch(occUrl);
      if (occRes.ok) {
        const occData = await occRes.json();
        occupations = occIds
          .map((id) => occData?.entities?.[id]?.labels?.en?.value)
          .filter(Boolean);
      }
    }

    // Build era label from birth/death year
    const century = (y?: number | null) =>
      y ? `${Math.floor((y - 1) / 100) + 1}th Century` : "Unknown";
    const eraLabel =
      birthYear
        ? `${century(birthYear)} (${birthYear}${deathYear ? `–${deathYear}` : "–"})`
        : deathYear
        ? `${century(deathYear)} (${deathYear})`
        : "Unknown";

    return { birthYear, deathYear, occupations, eraLabel };
  } catch {
    return null;
  }
}
