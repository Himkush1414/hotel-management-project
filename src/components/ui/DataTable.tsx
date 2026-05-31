"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  emptyMessage = "No data found.",
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey] as string | number;
    const bv = b[sortKey] as string | number;
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    const k = col.key as string;
    if (sortKey !== k) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    if (sortDir === "asc") return <ChevronUp className="h-3.5 w-3.5" />;
    return <ChevronDown className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key as string}
                  className={col.sortable ? "cursor-pointer select-none" : ""}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key as string}>
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as string] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
