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
    era: string;
    occupation: string;
    works: string[] | null;
    firstAppearance: string | null;
  };
};

export default function Main() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);

  const doSearch = async (q: string) => {
    setStatus("loading");

    const wikiImg = await fetchCharacterImage(q);
    const avatarUrl = wikiImg ?? unknownAvatar(64);

    const facts = await fetchCharacterFacts(q);

    setResult({
      name: q,
      type: "Unknown",
      avatarUrl,
      facts: {
        era: facts?.eraLabel ?? "Unknown",
        occupation: facts?.occupations?.[0] ?? "N/A",
        works: null,
        firstAppearance: null,
      },
    });

    setStatus("done");
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
              character={
                status === "done" && result
                  ? { name: result.name, avatarUrl: result.avatarUrl }   // <-- pass it
                  : undefined
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}
