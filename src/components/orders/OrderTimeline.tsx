"use client";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-indigo-500",
  DELIVERED: "bg-emerald-500",
  COMPLETED: "bg-green-500",
  RETURNED: "bg-red-500",
  CANCELLED: "bg-gray-400",
};

interface StatusEntry {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface OrderTimelineProps {
  statusHistory: StatusEntry[];
}

export default function OrderTimeline({ statusHistory }: OrderTimelineProps) {
  return (
    <div className="space-y-0">
      {statusHistory.map((entry, i) => (
        <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Vertical line */}
          {i < statusHistory.length - 1 && (
            <div className="absolute left-[9px] top-5 h-full w-0.5 bg-border" />
          )}
          {/* Dot */}
          <div
            className={`relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-white ${
              statusColors[entry.status] || "bg-gray-400"
            }`}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{entry.status}</p>
            {entry.note && (
              <p className="mt-0.5 text-sm text-muted-foreground">{entry.note}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
