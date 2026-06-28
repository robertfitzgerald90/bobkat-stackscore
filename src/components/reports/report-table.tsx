import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ReportTableProps = {
  children: ReactNode;
  className?: string;
};

export function ReportTable({ children, className }: ReportTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <Table>{children}</Table>
    </div>
  );
}

export { TableHeader, TableBody, TableRow, TableHead, TableCell };
