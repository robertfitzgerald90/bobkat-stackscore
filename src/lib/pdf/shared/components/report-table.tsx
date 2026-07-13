import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

export type PdfReportTableColumn = {
  key: string;
  label: string;
  width: string;
  align?: "left" | "right";
};

export type PdfReportTableRow = Record<string, string>;

type PdfReportTableProps = {
  columns: PdfReportTableColumn[];
  rows: PdfReportTableRow[];
};

export function PdfReportTable({ columns, rows }: PdfReportTableProps) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {columns.map((column) => (
          <Text
            key={column.key}
            style={[
              styles.tableHeaderCell,
              { width: column.width, textAlign: column.align ?? "left" },
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View
          key={`${row[columns[0]?.key ?? "row"]}-${index}`}
          style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          {columns.map((column) => (
            <Text
              key={column.key}
              style={[
                styles.tableCell,
                { width: column.width, textAlign: column.align ?? "left" },
              ]}
            >
              {row[column.key] ?? ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
