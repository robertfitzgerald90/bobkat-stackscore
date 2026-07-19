"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  trackDemoAssessmentCtaClicked,
  trackDemoReturnedToOffer,
} from "@/lib/analytics/interactive-demo-events";
import {
  ASSESSMENT_OFFER_PATH,
  SOLUTIONS_HOME_PATH,
} from "@/lib/interactive-demo/routes";
import { clearDemoReturnTo, isSafeInternalPath } from "@/lib/interactive-demo/session";
import { cn } from "@/lib/utils";

type DemoExitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTo: string | null;
  onContinue: () => void;
};

export function DemoExitModal({
  open,
  onOpenChange,
  returnTo,
  onContinue,
}: DemoExitModalProps) {
  const stackscoreHref = isSafeInternalPath(returnTo) ? returnTo : ASSESSMENT_OFFER_PATH;
  const returnLabel =
    returnTo === ASSESSMENT_OFFER_PATH
      ? "Return to Assessment Offer"
      : returnTo
        ? "Return to Previous Page"
        : "Return to StackScore";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md border-border bg-background text-foreground shadow-xl"
        showCloseButton
      >
        <DialogHeader className="border-border px-5 py-4">
          <DialogTitle className="text-lg text-foreground">Ready to Leave the Demo?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Continue exploring Bobkat IT, purchase your Technology Maturity Assessment, or schedule
            a conversation about your technology goals.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 px-5 py-4">
          <Link
            href={ASSESSMENT_OFFER_PATH}
            className={cn(buttonVariants({ variant: "default" }), "h-11 w-full justify-center")}
            onClick={() => {
              trackDemoAssessmentCtaClicked("demo_exit_modal");
              clearDemoReturnTo();
            }}
          >
            Get My Assessment
          </Link>
          <Link
            href={stackscoreHref}
            className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full justify-center")}
            onClick={() => {
              trackDemoReturnedToOffer(stackscoreHref);
              clearDemoReturnTo();
            }}
          >
            {returnLabel}
          </Link>
          <Link
            href={SOLUTIONS_HOME_PATH}
            className={cn(buttonVariants({ variant: "ghost" }), "h-10 w-full justify-center")}
            onClick={() => clearDemoReturnTo()}
          >
            Return to Bobkat IT
          </Link>
        </div>

        <DialogFooter className="border-border px-5 py-3">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost" }), "h-9 w-full text-sm sm:w-auto")}
            onClick={onContinue}
          >
            Continue Exploring Demo
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
