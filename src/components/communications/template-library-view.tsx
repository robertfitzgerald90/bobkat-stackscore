"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Mail, Search } from "lucide-react";
import { TemplateStatusBadge } from "@/components/communications/template-status-badge";
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
import type { EmailTemplateCategory, EmailTemplateStatus } from "@/lib/communications/types";
import { CATEGORY_LABELS } from "@/lib/communications/registry";

export type TemplateLibraryItem = {
  key: string;
  documentId: string;
  name: string;
  description: string;
  category: EmailTemplateCategory;
  status: EmailTemplateStatus;
  subject: string;
  lastUpdated: string;
  previewable: boolean;
};

export function TemplateLibraryView({ templates }: { templates: TemplateLibraryItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      const matchesQuery =
        !query ||
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.key.toLowerCase().includes(query.toLowerCase()) ||
        template.documentId.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || template.category === category;
      const matchesStatus = status === "all" || template.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [templates, query, category, status]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or ID"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="stat-card rounded-xl border border-dashed border-border/70 bg-card p-10 text-center">
          <p className="font-medium text-foreground">No templates match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting search, category, or status filters.
          </p>
        </div>
      ) : (
        <div className="stat-card overflow-hidden rounded-xl bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((template) => (
                <TableRow key={template.key}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.documentId}</p>
                      <p className="line-clamp-2 text-sm text-secondary-token">
                        {template.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{CATEGORY_LABELS[template.category]}</TableCell>
                  <TableCell>
                    <TemplateStatusBadge status={template.status} />
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-secondary-token">
                    {template.subject}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(template.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {template.previewable ? (
                      <Link
                        href={`/admin/communications/templates/${template.key}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
                      >
                        <Eye className="size-4" />
                        Preview
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="size-4" />
                        Draft
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
