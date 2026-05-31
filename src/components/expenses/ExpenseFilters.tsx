"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface DateRange {
  from: string;
  to: string;
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  categories: Category[];
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  paymentFilter: string;
  onPaymentChange: (v: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function ExpenseFilters({
  search,
  onSearchChange,
  categories,
  categoryFilter,
  onCategoryChange,
  paymentFilter,
  onPaymentChange,
  dateRange,
  onDateRangeChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-44"
        />
      </div>
      <Input
        type="date"
        value={dateRange.from}
        onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
        className="w-36"
        placeholder="From"
      />
      <Input
        type="date"
        value={dateRange.to}
        onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
        className="w-36"
        placeholder="To"
      />
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={paymentFilter} onValueChange={onPaymentChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Payment Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modes</SelectItem>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          <SelectItem value="upi">UPI</SelectItem>
          <SelectItem value="card">Card</SelectItem>
          <SelectItem value="cheque">Cheque</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
