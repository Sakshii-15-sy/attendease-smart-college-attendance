import { saveAs } from "file-saver";
import type { ReportRow } from "./reportData";

const fileBase = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `attendance-report-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

export async function downloadPdf(rows: ReportRow[], department: string) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  const subjectCodes = rows[0]?.subjects.map((s) => s.code) ?? [];

  doc.setFontSize(16);
  doc.text("AttendEase — Attendance Report", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(
    `Department: ${department || "All"}    Generated: ${new Date().toLocaleString()}`,
    14,
    22,
  );

  const head = [["Roll No.", "Name", "Sem", ...subjectCodes, "Overall %", "Status"]];
  const body = rows.map((r) => [
    r.rollNo,
    r.name,
    r.semester,
    ...r.subjects.map((s) => `${s.percentage}%`),
    `${r.overall}%`,
    r.defaulter ? "Defaulter" : "OK",
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 28,
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [109, 40, 217], textColor: 255 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === head[0].length - 1) {
        const status = String(data.cell.raw);
        if (status === "Defaulter") {
          data.cell.styles.textColor = [200, 30, 30];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [20, 130, 70];
        }
      }
    },
  });

  doc.save(`${fileBase()}.pdf`);
}

export async function downloadXlsx(rows: ReportRow[], department: string) {
  const XLSX = await import("xlsx");
  const subjectCodes = rows[0]?.subjects.map((s) => s.code) ?? [];

  const aoa: (string | number)[][] = [];
  aoa.push(["AttendEase — Attendance Report"]);
  aoa.push([`Department: ${department || "All"}`, `Generated: ${new Date().toLocaleString()}`]);
  aoa.push([]);
  aoa.push(["Roll No.", "Name", "Department", "Semester", ...subjectCodes, "Overall %", "Status"]);
  rows.forEach((r) => {
    aoa.push([
      r.rollNo,
      r.name,
      r.department,
      r.semester,
      ...r.subjects.map((s) => s.percentage),
      r.overall,
      r.defaulter ? "Defaulter" : "OK",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 8 },
    ...subjectCodes.map(() => ({ wch: 10 })),
    { wch: 10 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([out], { type: "application/octet-stream" }), `${fileBase()}.xlsx`);
}

export async function downloadDocx(rows: ReportRow[], department: string) {
  const docx = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    WidthType,
    BorderStyle,
    ShadingType,
  } = docx;

  const subjectCodes = rows[0]?.subjects.map((s) => s.code) ?? [];
  const headers = ["Roll No.", "Name", "Sem", ...subjectCodes, "Overall %", "Status"];

  const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const cellBorders = { top: border, bottom: border, left: border, right: border };

  const headerCell = (text: string) =>
    new TableCell({
      borders: cellBorders,
      shading: { fill: "6D28D9", type: ShadingType.CLEAR, color: "auto" },
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    });

  const bodyCell = (text: string, opts?: { bold?: boolean; color?: string }) =>
    new TableCell({
      borders: cellBorders,
      children: [
        new Paragraph({
          children: [
            new TextRun({ text, size: 18, bold: opts?.bold, color: opts?.color }),
          ],
        }),
      ],
    });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map(headerCell) }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: [
              bodyCell(r.rollNo),
              bodyCell(r.name),
              bodyCell(r.semester),
              ...r.subjects.map((s) => bodyCell(`${s.percentage}%`)),
              bodyCell(`${r.overall}%`, { bold: true }),
              bodyCell(r.defaulter ? "Defaulter" : "OK", {
                bold: true,
                color: r.defaulter ? "C81E1E" : "148246",
              }),
            ],
          }),
      ),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "AttendEase — Attendance Report", bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Department: ${department || "All"}    Generated: ${new Date().toLocaleString()}`,
                color: "666666",
                size: 20,
              }),
            ],
          }),
          new Paragraph({ children: [new TextRun(" ")] }),
          table,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileBase()}.docx`);
}
