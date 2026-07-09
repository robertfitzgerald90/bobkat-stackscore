import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Mail, MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          We are here to help you get the most from your technology assessment.
        </p>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Book a Strategy Session
          </CardTitle>
          <CardDescription>
            Schedule time with a BobKat consultant to review your assessment results and build your
            implementation roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={`mailto:${BRAND.email}?subject=StackScore Strategy Session`}
            className={buttonClassName({})}
          >
            Request a Session
          </a>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" />
            Email Support
          </CardTitle>
          <CardDescription>Questions about your assessment or account?</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={`mailto:${BRAND.email}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {BRAND.email}
          </a>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-primary" />
            Assessment Help
          </CardTitle>
          <CardDescription>
            Need to resume or have questions while completing your assessment?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/assessment/start" className={buttonClassName({ variant: "outline" })}>
            Continue Assessment
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
