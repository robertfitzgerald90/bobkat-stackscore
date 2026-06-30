import type { ReactNode } from "react";
import { View } from "@react-pdf/renderer";
import { PDF_SPACING } from "@/lib/pdf/shared/layout";
import { PdfSectionTitle } from "./section-title";

type PdfFlowSectionProps = {
  title: string;
  subtitle?: string;
  breakBefore?: boolean;
  children: ReactNode;
};

/** Section that grows with content and paginates naturally. */
export function PdfFlowSection({
  title,
  subtitle,
  breakBefore = false,
  children,
}: PdfFlowSectionProps) {
  return (
    <View break={breakBefore} style={{ marginBottom: PDF_SPACING.section }}>
      <PdfSectionTitle title={title} subtitle={subtitle} />
      <View style={{ marginTop: PDF_SPACING.afterTitle }}>{children}</View>
    </View>
  );
}
