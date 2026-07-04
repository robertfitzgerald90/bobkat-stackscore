"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PortfolioClientCardView } from "@/components/portfolio/portfolio-client-card";
import { NewClientSheet } from "@/components/clients/new-client-sheet";
import { Button } from "@/components/ui/button";
import type { CreatedClient } from "@/lib/clients/create-client";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PORTFOLIO_SORT_OPTIONS,
  sortPortfolioClients,
  type PortfolioSortMode,
} from "@/lib/portfolio/sort-clients";
import type { PortfolioClientCard } from "@/lib/portfolio/types";

type PortfolioViewProps = {
  clients: PortfolioClientCard[];
};

export function PortfolioView({ clients }: PortfolioViewProps) {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<PortfolioSortMode>("recommended");
  const [newClientOpen, setNewClientOpen] = useState(false);

  const sortedClients = useMemo(
    () => sortPortfolioClients(clients, sortMode),
    [clients, sortMode],
  );

  function handleClientCreated(client: CreatedClient) {
    router.push(clientTechnologyProfilePath(client.id));
    router.refresh();
  }

  return (
    <div className="page-content min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="page-title">Portfolio</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Which client deserves your attention?
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end sm:justify-end">
          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[220px]">
            <label htmlFor="portfolio-sort" className="text-xs font-medium text-muted-foreground">
              Sort
            </label>
            <Select
              value={sortMode}
              items={Object.fromEntries(PORTFOLIO_SORT_OPTIONS.map((o) => [o.value, o.label]))}
              onValueChange={(value) => setSortMode((value ?? "recommended") as PortfolioSortMode)}
            >
              <SelectTrigger id="portfolio-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORTFOLIO_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setNewClientOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      <NewClientSheet
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onCreated={handleClientCreated}
      />

      {sortedClients.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm font-medium">No clients in your portfolio</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add clients to begin prioritizing technology improvement work.
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => setNewClientOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {sortedClients.length} {sortedClients.length === 1 ? "client" : "clients"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sortedClients.map((card) => (
              <PortfolioClientCardView key={card.clientId} card={card} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
