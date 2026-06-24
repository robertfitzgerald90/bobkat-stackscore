import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    include: {
      assessments: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
      _count: { select: { assessments: true } },
    },
  });

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

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest Score</TableHead>
                <TableHead>Assessments</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.companyName}</TableCell>
                  <TableCell>{client.primaryContactName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.assessments[0]?.overallScore
                      ? Number(client.assessments[0].overallScore)
                      : "—"}
                  </TableCell>
                  <TableCell>{client._count.assessments}</TableCell>
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className={buttonVariants({ variant: "link" })}>
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
