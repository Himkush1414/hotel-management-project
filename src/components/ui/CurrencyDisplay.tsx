import { formatCurrency } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

interface Props {
  amount: number;
  compact?: boolean;
  className?: string;
  colored?: boolean;
}

export function CurrencyDisplay({ amount, compact = false, className, colored = false }: Props) {
  const formatted = compact
    ? amount >= 100000
      ? `₹${(amount / 100000).toFixed(1)}L`
      : amount >= 1000
      ? `₹${(amount / 1000).toFixed(1)}K`
      : `₹${amount}`
    : formatCurrency(amount);

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        colored && amount > 0 && "text-emerald-600",
        colored && amount < 0 && "text-red-600",
        className
      )}
    >
      {formatted}
    </span>
  );
}
