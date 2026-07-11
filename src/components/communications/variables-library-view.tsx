"use client";

import { useMemo, useState } from "react";
import type { VariableCategory, VariableDefinition } from "@/lib/communications/types";
import { VARIABLE_CATEGORIES } from "@/lib/communications/variables-library";
import { CommunicationsPageHeader, CommunicationsPanel } from "@/components/communications/communications-shell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type VariablesLibraryViewProps = {
  variables: VariableDefinition[];
};

export function VariablesLibraryView({ variables }: VariablesLibraryViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VariableCategory | "all">("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return variables.filter((variable) => {
      if (category !== "all" && variable.category !== category) return false;
      if (!normalized) return true;
      return (
        variable.name.toLowerCase().includes(normalized) ||
        variable.description.toLowerCase().includes(normalized) ||
        variable.source.toLowerCase().includes(normalized)
      );
    });
  }, [variables, query, category]);

  return (
    <div className="space-y-8">
      <CommunicationsPageHeader
        title="Variables Library"
        description="Documentation for template builders. Search and filter variables used across StackScore communications."
      />

      <CommunicationsPanel>
        <div className="flex flex-wrap gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search variables..."
            className="max-w-md"
          />
          <Select value={category} onValueChange={(value) => setCategory(value as VariableCategory | "all")}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {VARIABLE_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-[#1e3a5f]/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((variable) => (
                <TableRow key={variable.name}>
                  <TableCell className="font-mono text-sm font-medium">{variable.name}</TableCell>
                  <TableCell className="max-w-sm text-sm text-secondary-token">
                    {variable.description}
                  </TableCell>
                  <TableCell className="text-sm">{variable.example}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-[#082F5B]/8 px-2 py-1 text-xs font-medium text-[#082F5B]">
                      {variable.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{variable.required ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{variable.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {filtered.length} of {variables.length} variables
        </p>
      </CommunicationsPanel>
    </div>
  );
}
