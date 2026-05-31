import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  hasHeader?: boolean;
  lines?: number;
}

export function SkeletonCard({ hasHeader = true, lines = 3 }: Props) {
  return (
    <Card>
      {hasHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
      )}
      <CardContent className={hasHeader ? "" : "pt-6"}>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: i === lines - 1 ? "60%" : "100%" }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
