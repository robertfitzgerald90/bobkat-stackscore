"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
} from "@/components/communications/communications-shell";
import { buttonClassName } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PreviewRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  valid: boolean;
  error?: string;
  duplicate: { type: string; label: string } | null;
};

export function CsvImportView() {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  async function handlePreview() {
    if (!content.trim()) {
      toast.error("Paste CSV content first");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/v1/admin/prospects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, previewOnly: true }),
    });
    setLoading(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to preview CSV");
      return;
    }
    setPreview(payload.preview ?? []);
  }

  async function handleImport() {
    const validRows = preview.filter((row) => row.valid && !(skipDuplicates && row.duplicate));
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    setImporting(true);
    const response = await fetch("/api/v1/admin/prospects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: validRows.map(({ firstName, lastName, company, email }) => ({
          firstName,
          lastName,
          company,
          email,
        })),
        skipDuplicates,
      }),
    });
    setImporting(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Import failed");
      return;
    }
    const successCount = (payload.results ?? []).filter((r: { ok: boolean }) => r.ok).length;
    toast.success(`Imported ${successCount} prospect invitation(s)`);
  }

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="Import Prospects"
        description="Upload a CSV, validate duplicates, preview rows, then send assessment invitations."
        actions={
          <Link href="/admin/communications/prospects" className={buttonClassName({ variant: "outline" })}>
            Back to Prospects
          </Link>
        }
      />

      <CommunicationsPanel title="CSV Upload">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-content">CSV Content</Label>
            <textarea
              id="csv-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder={"First Name,Last Name,Company,Email,Phone,Industry,Notes\nAlex,Morgan,Northwind,alex@company.com,,Professional Services,"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={buttonClassName({ variant: "outline" })} onClick={handlePreview} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Preview Import
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
              />
              Skip duplicates
            </label>
          </div>
        </div>
      </CommunicationsPanel>

      {preview.length > 0 ? (
        <CommunicationsPanel title="Preview">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((row) => (
                <TableRow key={row.rowNumber}>
                  <TableCell>{row.rowNumber}</TableCell>
                  <TableCell>{row.firstName} {row.lastName}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {!row.valid
                      ? row.error
                      : row.duplicate
                        ? `Duplicate (${row.duplicate.type})`
                        : "Ready"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <button type="button" className={buttonClassName({})} onClick={handleImport} disabled={importing}>
              {importing ? <Loader2 className="size-4 animate-spin" /> : null}
              Import & Send Invitations
            </button>
          </div>
        </CommunicationsPanel>
      ) : null}
    </div>
  );
}
