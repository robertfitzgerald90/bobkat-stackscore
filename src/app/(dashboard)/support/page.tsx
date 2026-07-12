import { redirect } from "next/navigation";
import { Calendar, Mail, MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { SupportAssessmentHelp } from "@/components/support/support-assessment-help";
import { BookingButton } from "@/components/support/booking-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingUrl, getSupportEmail } from "@/lib/support/config";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookingUrl = getBookingUrl();
  const supportEmail = getSupportEmail();

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
            Schedule Your Assessment Review
          </CardTitle>
          <CardDescription>
            Schedule time with a BobKat consultant to review your assessment results and build your
            implementation roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookingUrl ? (
            <BookingButton label="primary" icon={<Calendar className="mr-2 h-4 w-4" />} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Online booking is not configured. Please email{" "}
              <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
                {supportEmail}
              </a>{" "}
              to schedule your session.
            </p>
          )}
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
            href={`mailto:${supportEmail}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {supportEmail}
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
            Resume your in-progress assessment or review your completed executive report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportAssessmentHelp />
        </CardContent>
      </Card>
    </div>
  );
}
