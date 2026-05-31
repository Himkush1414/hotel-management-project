"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface Props {
  label?: string;
  className?: string;
}

export function PrintButton({ label = "Print", className }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className={`print:hidden ${className ?? ""}`}
    >
      <Printer className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
}
