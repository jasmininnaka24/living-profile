import Card from "@/components/ui/Card";
function Row({ title, items, icon }: { title: string; items: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-subtle">{icon}</div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="text-xs text-muted text-center leading-5">{items}</div>
    </div>
  );
}
export default function PlaceholderCard() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-canvas">
        {/* Big search icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" className="text-subtle">
          <path fill="currentColor" d="M10 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12m0-2a8 8 0 0 0 0 16a7.9 7.9 0 0 0 4.9-1.7l4.4 4.4l1.4-1.4l-4.4-4.4A8 8 0 0 0 10 2"/>
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
              <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m-7 8a7 7 0 0 1 14 0z"/>
            </svg>
          }
        />
        <Row
          title="Literary Characters"
          items="Sherlock Holmes, Elizabeth Bennet"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4 5h16v2H4zm0 4h10v2H4zm0 4h16v2H4z"/>
            </svg>
          }
        />
        <Row
          title="Pop Culture Icons"
          items="Batman, Gandalf, Hermione"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="currentColor" d="m12 2l1.9 5.9H20l-4.9 3.6l1.9 5.9L12 13.8L7 17.4l1.9-5.9L4 7.9h6.1z"/>
            </svg>
          }
        />
      </div>
    </Card>
  );
}
