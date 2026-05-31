"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomStatusGridProps {
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
}

interface StatusTile {
  label: string;
  count: number;
  color: string;
  bg: string;
  filter: string;
}

export function RoomStatusGrid({
  available,
  occupied,
  cleaning,
  maintenance,
}: RoomStatusGridProps) {
  const tiles: StatusTile[] = [
    {
      label: "Available",
      count: available,
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      filter: "available",
    },
    {
      label: "Occupied",
      count: occupied,
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      filter: "occupied",
    },
    {
      label: "Cleaning",
      count: cleaning,
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      filter: "cleaning",
    },
    {
      label: "Maintenance",
      count: maintenance,
      color: "text-red-700",
      bg: "bg-red-50 border-red-200 hover:bg-red-100",
      filter: "maintenance",
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Room Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <Link
              key={tile.filter}
              href={`/rooms?status=${tile.filter}`}
              className={`flex flex-col items-center justify-center rounded-lg border p-4 transition-colors ${tile.bg}`}
            >
              <span className={`text-2xl font-bold ${tile.color}`}>
                {tile.count}
              </span>
              <span className={`mt-1 text-xs font-medium ${tile.color}`}>
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
