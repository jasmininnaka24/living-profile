// src/pages/main/main.tsx
import { useState } from "react";
import Header from "@/components/Header";
import SearchCard from "@/components/sections/SearchCard";
import DiscoverCard from "@/components/sections/DiscoverCard";
import ChatPanel from "@/components/sections/ChatPanel";
import SkeletonCard from "@/components/sections/SkeletonCard";
import PlaceholderCard from "@/components/ui/PlaceholderCard";
import { fetchCharacterImage, unknownAvatar } from "@/lib/fetchCharacterImage";
import { fetchCharacterFacts } from "@/lib/fetchCharacterFacts";

type Status = "idle" | "loading" | "done";
type Result = {
  name: string;
  type: "Unknown" | "Fictional" | "Real";
  avatarUrl: string;
  facts: {
    background: string;           
    era: string;
    occupation: string;
    works: string[] | null;
    firstAppearance: string | null;
  };
};

export default function Main() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [chatKey, setChatKey] = useState(0); // remount ChatPanel to clear chats

  const doSearch = async (raw: string) => {
  const nextName = raw.trim();
  if (!nextName) return;

  const isSame =
    nextName.toLowerCase() === (result?.name ?? "").trim().toLowerCase();

  setStatus("loading");
  setResult(null); // <- clear previous result immediately so nothing shows while loading

  try {
    // fetch image + facts in parallel, and only proceed when BOTH finish
    const [imgUrl, facts] = await Promise.all([
      (async () => {
        const wikiImg = await fetchCharacterImage(nextName);
        return wikiImg ?? unknownAvatar(64);
      })(),
      fetchCharacterFacts(nextName),
    ]);

    // normalize works to string[]
    const worksArray = Array.isArray(facts?.notable_works)
      ? (facts!.notable_works as string[])
      : (facts?.notable_works
          ? String(facts.notable_works)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : []);

    setResult({
      name: nextName,
      type: "Fictional",
      avatarUrl: imgUrl,
      facts: {
        background: facts?.background ?? "N/A",     // ← add this
        era: facts?.era ?? "Unknown",
        occupation: facts?.occupation ?? "N/A",
        works: worksArray,
        firstAppearance: facts?.first_appearance ?? "N/A",
      },
    });

    if (!isSame) setChatKey((k) => k + 1);
  } catch (err) {
    console.error("Search failed:", err);
    // optional: show a toast here
    setResult(null);
  } finally {
    setStatus("done");
  }
  };


  return (
    <main>
      <Header title="Living Profiles" subtitle="AI Character Background and Conversation Platform" />

      <section className="mx-auto max-w-[100rem] px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <SearchCard loading={status === "loading"} onSearch={doSearch} />

            {status === "idle" && <PlaceholderCard />}
            {status === "loading" && <SkeletonCard />}
            {status === "done" && result && <DiscoverCard data={result} />}
          </div>

          {/* Right column */}
          <div>
            <ChatPanel
              key={chatKey}
              loading={status === "loading"}           // ← add this
              character={
                status === "done" && result
                  ? { name: result.name, avatarUrl: result.avatarUrl }
                  : undefined
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}
