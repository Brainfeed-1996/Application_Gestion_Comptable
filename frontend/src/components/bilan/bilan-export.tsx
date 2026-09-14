"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToExcel, printBilan, type ExportRow } from "@/lib/utils/export";
import { cn } from "@/lib/utils";

export interface BilanExportProps {
  data?: ExportRow[];
  filename?: string;
  className?: string;
}

export function BilanExport({ data = [], filename = "bilan", className }: BilanExportProps) {
  const handleExportCSV = useCallback(() => {
    exportToCSV(data, filename);
  }, [data, filename]);

  const handleExportExcel = useCallback(() => {
    exportToExcel(data, filename);
  }, [data, filename]);

  const handleExportPDF = useCallback(() => {
    printBilan();
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button variant="outline" onClick={handleExportPDF} className="gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        PDF
      </Button>
      <Button variant="outline" onClick={handleExportCSV} className="gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" x2="16" y1="13" y2="13"/><line x1="8" x2="16" y1="17" y2="17"/><line x1="10" x2="10" y1="9" y2="15"/></svg>
        CSV
      </Button>
      <Button variant="outline" onClick={handleExportExcel} className="gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
        Excel
      </Button>
    </div>
  );
}

export default BilanExport;
