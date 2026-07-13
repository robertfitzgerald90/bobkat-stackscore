import { PdfReportFooter } from "@/lib/pdf/shared/components/report-footer";

type PdfPageFooterProps = {
  generatedDate: string;
};

/** @deprecated Use PdfReportFooter — retained for backward compatibility. */
export function PdfPageFooter({ generatedDate }: PdfPageFooterProps) {
  return <PdfReportFooter generatedDate={generatedDate} showConfidential={false} />;
}

type PdfConfidentialFooterProps = {
  clientName: string;
  generatedDate: string;
};

/** @deprecated Use PdfReportFooter — retained for backward compatibility. */
export function PdfConfidentialFooter({ clientName, generatedDate }: PdfConfidentialFooterProps) {
  return (
    <PdfReportFooter
      generatedDate={generatedDate}
      clientName={clientName}
      showConfidential
    />
  );
}
