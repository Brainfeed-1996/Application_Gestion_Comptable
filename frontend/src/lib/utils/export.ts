"use client";

export interface ExportRow {
  [key: string]: string | number | boolean | null | undefined;
}

function sanitizeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "number") return value.toString();
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(data: ExportRow[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => sanitizeValue(row[header])).join(","),
    ),
  ];
  const csvString = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(data: ExportRow[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const escapeHtml = (text: string): string =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const thCells = headers
    .map((h) => `<th style="border:1px solid #d1d5db;padding:8px;background:#f3f4f6;font-weight:600;text-align:left;">${escapeHtml(h)}</th>`)
    .join("");
  const bodyRows = data
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => {
            const val = row[h] ?? "";
            return `<td style="border:1px solid #d1d5db;padding:8px;">${escapeHtml(String(val))}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>${escapeHtml(filename)}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
table { border-collapse: collapse; width: 100%; }
th, td { font-family: Arial, sans-serif; font-size: 11pt; }
</style>
</head>
<body>
<table>
<thead><tr>${thCells}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>
</body>
</html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printBilan(): void {
  const printStyles = `
    <style id="print-bilan-styles" media="print">
      @page {
        size: A4 landscape;
        margin: 15mm;
      }
      body * {
        visibility: hidden;
      }
      #print-bilan-content, #print-bilan-content * {
        visibility: visible;
      }
      #print-bilan-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
      }
      .no-print { display: none !important; }
    </style>
  `;

  const existingStyle = document.getElementById("print-bilan-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleEl = document.createElement("style");
  styleEl.id = "print-bilan-styles";
  styleEl.textContent = printStyles;
  document.head.appendChild(styleEl);

  window.print();

  setTimeout(() => {
    styleEl.remove();
  }, 1000);
}
