import { cn } from "@/lib/utils/cn";

interface Props {
  status: string;
  colorMap: Record<string, string>;
  className?: string;
}

export function StatusBadge({ status, colorMap, className }: Props) {
  const color = colorMap[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        color,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
