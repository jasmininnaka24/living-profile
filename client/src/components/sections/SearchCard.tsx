import { useState } from "react";
import Card from "@/components/ui/Card";

type Props = { loading?: boolean; onSearch: (q: string) => void };


export default function SearchCard({ loading, onSearch }: Props) {
  const [query, setQuery] = useState("");
  const canSearch = !!query.trim() && !loading;

const handleSearch = () => {
  const q = query.trim();
  if (!q) return;
  onSearch(q);          // parent decides whether to clear or keep
};

  return (
    <Card className="px-6 py-10">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-ink">Search for a Character</h3>
        <p className="text-xs text-muted">
          Enter any real or fictional character name (e.g., "Sherlock Holmes", "Albert Einstein")
        </p>
      </div>

      <div className={`mt-4 flex items-center ${loading ? "gap-2" : "gap-3"}`}>
        <div className="flex-1">
          <div
            className="
              flex items-center gap-2 rounded-lg border border-inputBorder bg-inputBg px-3 py-2
              transition-all duration-200 ease-out
              focus-within:border-lineStrong focus-within:ring-1 focus-within:ring-lineStrong
              focus-within:bg-surface focus-within:shadow-[0_6px_18px_rgba(17,24,39,0.06)]
            "
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-subtle">
              <path fill="currentColor" d="M10 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12m0-2a8 8 0 0 0 0 16a7.9 7.9 0 0 0 4.9-1.7l4.4 4.4l1.4-1.4l-4.4-4.4A8 8 0 0 0 10 2"/>
            </svg>

            <input
              className="w-full bg-transparent text-sm text-ink placeholder-subtle outline-none"
              placeholder="Enter character name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={!canSearch}
          aria-busy={loading}
          className={`
            flex items-center justify-center rounded-md font-medium text-sm
            focus:outline-none focus:ring-2 focus:ring-lineStrong
            transition-all duration-300 ease-in-out
            ${loading ? "w-10 h-10 p-0" : "px-4 h-10"}
            ${
              loading
                ? "bg-btn text-btnText cursor-wait"
                : !!query.trim()
                  ? "bg-black text-white hover:bg-gray-900 active:scale-95 cursor-pointer"
                  : "bg-gray-400 text-white cursor-not-allowed"
            }
          `}
          style={{ minWidth: loading ? "2.5rem" : "5.75rem" }}
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-white/90" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-25" />
              <path d="M4 12a8 8 0 0 1 8-8v2a6 6 0 0 0-6 6H4z" fill="currentColor" className="opacity-90" />
            </svg>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </Card>
  );
}
