import Card from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useEffect, useRef, useState } from "react";

type ChatPanelProps = {
  character?: { name: string; avatarUrl?: string } | undefined;
  loading?: boolean; 
};

type Mode = "in" | "factual";
type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  mode: Mode;
};

export default function ChatPanel({ character, loading }: ChatPanelProps) {
  const [mode, setMode] = useState<Mode>("in");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const hasCharacter = !!character?.name;

  const thread = messages.filter((m) => m.mode === mode);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mode, thread.length, typing]);

  function stamp() {
    const d = new Date();
    const hh = d.getHours() % 12 || 12;
    const mm = `${d.getMinutes()}`.padStart(2, "0");
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    return `${hh}:${mm} ${ampm}`;
  }

  function cleanAssistantText(text: string) {
    return text.replace(/^\([^)]*\)\s*/, "");
  }

  function handleDownload() {
    const onlyThisTab = messages.filter((m) => m.mode === mode);
    if (onlyThisTab.length === 0) return;

    const who = (m: Msg) =>
      m.role === "user"
        ? "You"
        : mode === "in"
        ? character?.name || "Character"
        : "Narrator";

    const lines = onlyThisTab.map((m) => {
      const body = m.role === "assistant" ? cleanAssistantText(m.text) : m.text;
      return `[${m.time}] ${who(m)}: ${body}`;
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const tabName = mode === "in" ? "in-character" : "narrator";
    a.href = url;
    a.download = `${(character?.name || "chat")
      .replace(/\s+/g, "_")
      .toLowerCase()}_${tabName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const send = () => {
    const text = message.trim();
    if (!text || !hasCharacter) return;

    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      time: stamp(),
      mode,
    };
    setMessages((m) => [...m, userMsg]);
    setMessage("");

    setTyping(true);

    setTimeout(() => {
      const assistantName = mode === "in" ? character!.name : "Narrator";
      const assistantText =
        mode === "in"
          ? `(${assistantName}) Thanks for your message.`
          : `(${assistantName}) Here's a factual note.`;

      const botMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: assistantText,
        time: stamp(),
        mode,
      };
      setMessages((m) => [...m, botMsg]);
      setTyping(false);
    }, 600);
  };


  function ChatSkeletonFull() {
    return (
      <div className="flex-1 rounded-md border border-line bg-white p-3 overflow-hidden">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-100" />
            <div className="space-y-2">
              <div className="h-3 w-36 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          </div>

          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-[90%] rounded bg-gray-100" />
          <div className="h-3 w-[70%] rounded bg-gray-100" />

          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="h-24 rounded-xl bg-gray-100" />
            <div className="h-24 rounded-xl bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="h-24 rounded-xl bg-gray-100" />
            <div className="h-24 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  function TypingSkeletonRow() {
    return (
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-100" />
        <div className="rounded-lg bg-gray-100 px-3 py-2">
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-40 bg-white/60 rounded" />
            <div className="h-3 w-24 bg-white/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 flex flex-col min-h-[520px] h-full">
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-ink">
            <path
              fill="currentColor"
              d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
            />
          </svg>
        <span className="text-sm font-semibold text-ink">
            {hasCharacter ? `Chat with ${character!.name}` : "Character Chat"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            label="Clear"
            onClick={() =>
              setMessages((ms) => ms.filter((m) => m.mode !== mode))
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
              />
            </svg>
          </IconButton>

          <IconButton label="Download" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M5 20h14v-2H5zm7-16v8l3-3l1.4 1.4L12 16l-4.4-4.6L9 9l3 3V4z"
              />
            </svg>
          </IconButton>

          <IconButton
            label="Reset"
            onClick={() => {
              setMessages((ms) => ms.filter((m) => m.mode !== mode));
              setMode("in");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 6V3L8 7l4 4V8c2.8 0 5 2.2 5 5a5 5 0 0 1-9.9 1H5a7 7 0 0 0 13.9-1c0-3.9-3.1-7-6.9-7z"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      {!hasCharacter ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" className="mx-auto text-subtle">
              <path
                fill="currentColor"
                d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
              />
            </svg>
            <div className="mt-4 text-sm font-semibold text-ink">No Character Selected</div>
            <div className="mt-1 text-sm text-muted">Search for a character to start chatting</div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-0 border border-line rounded-md overflow-hidden mb-3">
            <button
              onClick={() => setMode("in")}
              className={`h-9 text-sm font-medium transition ${
                mode === "in" ? "bg-gray-100" : "bg-white"
              }`}
            >
              In-Character
            </button>
            <button
              onClick={() => setMode("factual")}
              className={`h-9 text-sm font-medium transition ${
                mode === "factual" ? "bg-gray-100" : "bg-white"
              }`}
            >
              Narrator (Factual)
            </button>
          </div>

          {loading ? (
            <ChatSkeletonFull />
          ) : (
            <div
              ref={listRef}
              className="flex-1 rounded-md border border-line bg-white p-3 space-y-6 overflow-y-auto"
              style={{ maxHeight: "34rem" }}
            >
              {thread.length === 0 ? (
                <div
                  className="
                    flex items-center gap-2
                    border border-line rounded-lg
                    px-3 py-2
                    text-sm text-muted
                  "
                >
                  <svg
                    className="h-4 w-4 text-subtle"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </svg>

                  <span>
                    {mode === "in" ? (
                      <>
                        Start a conversation with{" "}
                        <span className="font-medium text-ink">{character!.name}</span>! They’ll
                        respond in character.
                      </>
                    ) : (
                      <>Ask factual questions — the narrator will reply.</>
                    )}
                  </span>
                </div>
              ) : (
                <>
                  {thread.map((m) => {
                    const isUser = m.role === "user";

                    return (
                      <div key={m.id}>
                        {!isUser && (
                          <div className="flex items-end gap-2">
                            <img
                              src={
                                m.mode === "in"
                                  ? character?.avatarUrl ||
                                    "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
                                  : "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
                              }
                              alt={m.mode === "in" ? character?.name || "Character" : "Narrator"}
                              className="w-7 h-7 rounded-full object-cover"
                            />

                            <div className="max-w-[75%]">
                              {m.mode === "in" && (
                                <div className="text-xs font-semibold text-ink mb-1">
                                  {character?.name}
                                </div>
                              )}

                              <div className="rounded-lg bg-gray-100 text-ink px-3 py-2">
                                <div className="text-sm leading-relaxed">
                                  {cleanAssistantText(m.text)}
                                </div>
                                <div className="mt-1 text-[11px] text-muted">{m.time}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {isUser && (
                          <div className="flex items-start justify-end gap-2">
                            <div className="max-w-[70%]">
                              <div className="rounded-xl bg-black text-white px-3 py-2">
                                <div className="text-sm leading-relaxed">{m.text}</div>
                                <div className="mt-1 text-[11px] text-white/75 text-right">
                                  {m.time}
                                </div>
                              </div>
                            </div>
                            <span className="h-7 w-7 rounded-full bg-gray-100 border border-line flex items-center justify-center">
                              <svg
                                className="h-3.5 w-3.5 text-muted"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {typing && <TypingSkeletonRow />}
                </>
              )}
            </div>
          )}

          <div className="mt-3">
            <div className="relative">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  mode === "in"
                    ? `Message ${character!.name}...`
                    : `Ask about ${character!.name}...`
                }
                className="w-full h-10 rounded-md border border-line bg-white text-sm px-3 pr-12 outline-none placeholder:text-muted"
                disabled={!!loading}
              />
              <button
                type="button"
                disabled={!message.trim() || !!loading}
                onClick={send}
                className={`absolute right-1 top-1 h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                  message.trim() && !loading
                    ? "bg-gray-700 text-white hover:bg-gray-800 cursor-pointer"
                    : "bg-gray-300 text-gray-500"
                }`}
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="pointer-events-none">
                  <path fill="currentColor" d="M2 21l21-9L2 3v7l15 2l-15 2z" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-xs text-muted">
              Mode: {mode === "in" ? "In-Character" : "Factual Narrator"}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
