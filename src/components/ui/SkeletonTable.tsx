import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 5 }: Props) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex gap-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-4 border-b last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className="h-4"
              style={{ flex: j === 0 ? 1.5 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
