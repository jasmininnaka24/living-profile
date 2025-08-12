import Card from "@/components/ui/Card";
import { ReactNode } from "react";

/* ---------- Types ---------- */
export type CharacterResult = {
  name: string;
  type?: "Fictional" | "Real" | "Unknown";
  avatarUrl?: string | null;
  facts?: {
    background?: string | null;
    works?: string[] | null;
    occupation?: string | null;
    firstAppearance?: string | null;
    era?: string | null;
  };
  sourcesCount?: number;
};

type Props = { data?: CharacterResult };

/* ---------- Small bits ---------- */
function Fact({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-5 w-5 rounded-md border border-line flex items-center justify-center">
        {icon ?? null}
      </div>
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        <div className="text-sm text-muted">{value}</div>
      </div>
    </div>
  );
}

function Row({ title, items, icon }: { title: string; items: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-subtle">{icon}</div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="text-xs text-muted text-center leading-5">{items}</div>
    </div>
  );
}

/* ---------- Placeholder (no data) ---------- */
function Placeholder() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-canvas">
        <svg width="28" height="28" viewBox="0 0 24 24" className="text-subtle">
          <path
            fill="currentColor"
            d="M10 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12m0-2a8 8 0 0 0 0 16a7.9 7.9 0 0 0 4.9-1.7l4.4 4.4l1.4-1.4l-4.4-4.4A8 8 0 0 0 10 2"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-ink">Discover Characters</h3>
      <p className="mt-2 text-sm text-muted">
        Search for any real or fictional character to explore their background and start a conversation.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <Row
          title="Historical Figures"
          items="Einstein, Shakespeare, Cleopatra"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m-7 8a7 7 0 0 1 14 0z" />
            </svg>
          }
        />
        <Row
          title="Literary Characters"
          items="Sherlock Holmes, Elizabeth Bennet"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4 5h16v2H4zm0 4h10v2H4zm0 4h16v2H4z" />
            </svg>
          }
        />
        <Row
          title="Pop Culture Icons"
          items="Batman, Gandalf, Hermione"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="currentColor" d="m12 2l1.9 5.9H20l-4.9 3.6l1.9 5.9L12 13.8L7 17.4l1.9-5.9L4 7.9h6.1z" />
            </svg>
          }
        />
      </div>
    </Card>
  );
}

/* ---------- Result (has data) ---------- */
function Result({ data }: { data: CharacterResult }) {
  const {
    name,
    type = "Fictional",
    avatarUrl,
    facts,
    sourcesCount = 0,
  } = data;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <img
        src={
            avatarUrl ||
            `https://i.pravatar.cc/64?img=${Math.floor(Math.random() * 70) + 1}`
        }
        alt={name}
        className="h-14 w-14 rounded-full object-cover"
        />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-ink">{data.name}</h2>

          {/* badge */}
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {data.type
                ? data.type
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ")
                : "N/A"}
          </span>
        </div>

        {/* Era + Occupation row (this is the new bit) */}
        <div className="mt-1 flex items-center gap-5 text-sm text-muted">
          {/* Era */}
          <span className="inline-flex items-center gap-1">
            <svg
              className="h-4 w-4 text-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{data.facts?.era ?? "Unknown"}</span>
          </span>

          {/* Occupation */}
          <span className="inline-flex items-center gap-1">
            <svg
              className="h-4 w-4 text-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{data.facts.occupation
                ? data.facts.occupation
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ")
                : "N/A"}</span>
          </span>
        </div>
      </div>
    </div>


      {/* Background */}
      <h3 className="mt-6 text-sm font-semibold text-ink">Background</h3>
      <p className="mt-2 text-sm text-gray-700">
        {facts?.background ??
          `I don't have detailed information about "${name}" in my database. This could be a lesser-known figure or a spelling variation.`}
      </p>

      {/* Quick Facts */}
    <div className="mt-6 rounded-xl border border-line bg-surface p-7">
        <h4 className="text-sm font-semibold text-ink">Quick Facts</h4>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-6">
        {/* Notable Works */}
        <div>
            <div className="flex items-center gap-2">
            <svg
                className="h-4 w-4 text-subtle border-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path d="M4 19.5V4.5a2 2 0 0 1 2-2h8l6 6v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
            </svg>
            <span className="font-semibold text-sm text-ink">Notable Works</span>
            </div>
            <div className="ml-6 text-sm text-muted">
            {facts?.works?.join(", ") || "N/A"}
            </div>
        </div>

        {/* Occupation */}
        {facts?.occupation && (
            <div>
            <div className="flex items-center gap-2">
                <svg
                className="h-4 w-4 text-subtle border-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="font-semibold text-sm text-ink">Occupation</span>
            </div>
            <div className="ml-6 text-sm text-muted">
                {facts.occupation
                .split(" ")
                .map(
                    (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </div>
            </div>
        )}

        {/* First Appearance */}
        <div>
            <div className="flex items-center gap-2">
            <svg
                className="h-4 w-4 text-subtle border-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span className="font-semibold text-sm text-ink">First Appearance</span>
            </div>
            <div className="ml-6 text-sm text-muted">
            {facts?.firstAppearance || "N/A"}
            </div>
        </div>

        {/* Era/Setting */}
        <div>
            <div className="flex items-center gap-2">
            <svg
                className="h-4 w-4 text-subtle border-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="font-semibold text-sm text-ink">Era/Setting</span>
            </div>
            <div className="ml-6 text-sm text-muted">
            {facts?.era || "Unknown"}
            </div>
        </div>
        </div>
    </div>



      {/* Sources */}
      <div className="mt-6 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-ink">
            Sources{" "}
            <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs">{sourcesCount}</span>
          </div>
          <button className="text-sm text-ink/70">▾</button>
        </div>
      </div>

      {/* CTA */}
      <button className="mt-6 w-full rounded-md bg-black py-3 text-sm font-medium text-white">
        Start Conversation
      </button>
    </Card>
  );
}

/* ---------- Main export ---------- */
export default function DiscoverCard({ data }: Props) {
  if (!data) return <Placeholder />;
  return <Result data={data} />;
}
