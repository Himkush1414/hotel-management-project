import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <SkeletonTable rows={8} columns={7} />
    </div>
  );
}
