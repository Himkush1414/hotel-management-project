"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface DateRange {
  from: string;
  to: string;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
}

export function DateRangePicker({ value, onChange, label }: Props) {
  return (
    <div className="space-y-1">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="w-36"
          placeholder="From"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          value={value.to}
          min={value.from}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="w-36"
          placeholder="To"
        />
      </div>
    </div>
  );
}
