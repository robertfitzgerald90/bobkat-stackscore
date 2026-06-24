import { renderToBuffer } from "@react-pdf/renderer";
import { AssessmentReportDocument } from "@/lib/pdf/assessment-report";
import type { AssessmentReportData } from "@/lib/pdf/types";

export async function generateAssessmentReportPdf(data: AssessmentReportData) {
  return renderToBuffer(<AssessmentReportDocument data={data} />);
}
