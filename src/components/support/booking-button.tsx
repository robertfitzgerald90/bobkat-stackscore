"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClassName, buttonVariants } from "@/components/ui/button";
import {
  BOOKING_LABELS,
  getBookingUrl,
  resolveBookingLabel,
} from "@/lib/support/config";
import type { VariantProps } from "class-variance-authority";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type BookingButtonProps = {
  label?: keyof typeof BOOKING_LABELS | (string & {});
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
  className?: string;
  icon?: ReactNode;
  fallbackHref?: string;
  fallbackLabel?: string;
};

export function BookingButton({
  label = "primary",
  variant = "default",
  size = "default",
  className,
  icon,
  fallbackHref,
  fallbackLabel = "Contact Support",
}: BookingButtonProps) {
  const bookingUrl = getBookingUrl();
  const resolvedLabel = resolveBookingLabel(label);
  const buttonClasses = buttonClassName({ variant, size, className });

  if (!bookingUrl) {
    if (fallbackHref) {
      return (
        <Link href={fallbackHref} className={buttonClasses}>
          {icon}
          {fallbackLabel}
        </Link>
      );
    }

    return null;
  }

  return (
    <a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses}
    >
      {icon}
      {resolvedLabel}
    </a>
  );
}
