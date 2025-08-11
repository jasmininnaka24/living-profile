import Card from "@/components/ui/Card";

export default function SkeletonCard() {
  return (
    <Card className="p-6 animate-pulse">
      {/* header row */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 rounded-full bg-gray-100" />
          <div className="h-3 w-28 rounded-full bg-gray-100" />
        </div>
      </div>

      {/* lines */}
      <div className="mt-6 space-y-3">
        <div className="h-3 w-full rounded-full bg-gray-100" />
        <div className="h-3 w-full rounded-full bg-gray-100" />
        <div className="h-3 w-3/4 rounded-full bg-gray-100" />
      </div>

      {/* cards grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-xl bg-gray-100" />
        <div className="h-24 rounded-xl bg-gray-100" />
        <div className="h-24 rounded-xl bg-gray-100" />
        <div className="h-24 rounded-xl bg-gray-100" />
      </div>
    </Card>
  );
}
