"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewClientForm } from "@/components/clients/new-client-form";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h2 className="page-title">New Client</h2>
        <p className="page-description">Add a business to assess</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewClientForm
            onSuccess={(client) => router.push(clientTechnologyProfilePath(client.id))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
