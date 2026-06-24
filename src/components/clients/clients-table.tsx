"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatClientStatus } from "@/lib/display";
import { TrendIndicator } from "@/components/analytics/trend-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ClientRow = {
  id: string;
  companyName: string;
  primaryContactName: string;
  status: string;
  latestScore: number | null;
  scoreDelta: number | null;
  assessmentCount: number;
};

type ClientsTableProps = {
  clients: ClientRow[];
  isAdmin: boolean;
};

export function ClientsTable({ clients, isAdmin }: ClientsTableProps) {
  const [showArchived, setShowArchived] = useState(false);

  const visibleClients = useMemo(() => {
    if (!isAdmin || showArchived) {
      return clients;
    }
    return clients.filter((client) => client.status !== "archived");
  }, [clients, isAdmin, showArchived]);

  const archivedCount = clients.filter((client) => client.status === "archived").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clients</h2>
          <p className="text-muted-foreground">Manage assessed businesses</p>
        </div>
        <Link href="/clients/new" className={buttonVariants()}>
          Add Client
        </Link>
      </div>

      {isAdmin && archivedCount > 0 ? (
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {archivedCount} archived client{archivedCount === 1 ? "" : "s"} hidden from this view
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowArchived((current) => !current)}>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{showArchived ? "All Clients" : "Active Clients"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest Score</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Assessments</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.companyName}</TableCell>
                    <TableCell>{client.primaryContactName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={client.status === "archived" ? "secondary" : "outline"}
                      >
                        {formatClientStatus(client.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.latestScore ?? "—"}</TableCell>
                    <TableCell>
                      <TrendIndicator delta={client.scoreDelta} />
                    </TableCell>
                    <TableCell>{client.assessmentCount}</TableCell>
                    <TableCell>
                      <Link
                        href={`/clients/${client.id}`}
                        className={buttonVariants({ variant: "link" })}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
