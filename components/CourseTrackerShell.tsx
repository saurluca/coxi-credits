"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { BachelorView } from "@/components/BachelorView";
import { MasterView } from "@/components/MasterView";
import { Program } from "@/app/types";
import {
  exportAllData,
  getActiveProgramServerSnapshot,
  getActiveProgramSnapshot,
  importAllData,
  subscribeActiveProgram,
  writeActiveProgram,
} from "@/lib/storage";
import { getErrorMessage, reportClientError } from "@/lib/errors";

export function CourseTrackerShell() {
  const program = useSyncExternalStore(
    subscribeActiveProgram,
    getActiveProgramSnapshot,
    getActiveProgramServerSnapshot,
  );
  const [remountKey, setRemountKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleProgramChange = (next: Program) => {
    writeActiveProgram(next);
  };

  const handleExportJson = () => {
    try {
      const json = exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `coxi-credits-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("JSON export failed:", e);
      alert("Failed to export JSON.");
    }
  };

  const openUploadModal = () => {
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const closeUploadModal = () => {
    if (isImporting) return;
    setIsUploadOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      alert("Please choose a JSON file.");
      return;
    }
    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);
      importAllData(parsed);
      setIsUploadOpen(false);
      setRemountKey((k) => k + 1);
    } catch (error) {
      reportClientError("Import failed:", error);
      alert(
        `Failed to import JSON: ${getErrorMessage(error)}. Please check the file and try again.`,
      );
    } finally {
      setIsImporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const targetDpi = 320;
      const elementWidthPx = contentRef.current.clientWidth || 1024;
      const desiredCanvasWidthPx = Math.round((pdfWidth / 25.4) * targetDpi);
      const computedScale = Math.min(
        2,
        Math.max(1, desiredCanvasWidthPx / elementWidthPx),
      );

      const canvas = await html2canvas(contentRef.current, {
        scale: computedScale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pageWidthPx = canvas.width;
      const pageHeightPx = Math.floor((canvas.width * pdfHeight) / pdfWidth);
      const imgWidth = pdfWidth;

      let yPx = 0;
      while (yPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yPx);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = pageWidthPx;
        pageCanvas.height = sliceHeightPx;

        const ctx = pageCanvas.getContext("2d");
        if (!ctx) break;

        ctx.drawImage(
          canvas,
          0,
          yPx,
          pageWidthPx,
          sliceHeightPx,
          0,
          0,
          pageWidthPx,
          sliceHeightPx,
        );

        const pageDataUrl = pageCanvas.toDataURL("image/jpeg", 0.82);
        const pageImgHeightMm = (sliceHeightPx * imgWidth) / pageWidthPx;

        pdf.addImage(pageDataUrl, "JPEG", 0, 0, imgWidth, pageImgHeightMm);

        const prefix = "Exported from Coxi Credits • ";
        const url = "https://coxi-credits.vercel.app/";
        pdf.setFontSize(15);
        pdf.setTextColor(120, 120, 120);
        const footerY = pdfHeight - 6;
        const totalWidth = pdf.getTextWidth(prefix + url);
        const startX = pdfWidth / 2 - totalWidth / 2;
        pdf.text(prefix, startX, footerY);
        pdf.textWithLink(url, startX + pdf.getTextWidth(prefix), footerY, {
          url,
        });

        yPx += sliceHeightPx;
        if (yPx < canvas.height) {
          pdf.addPage();
        }
      }

      pdf.save(`coxi-credits-${program}-${dateStr}.pdf`);
    } catch (error) {
      reportClientError("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${getErrorMessage(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  const runExportPdf = () => {
    void exportToPDF().catch((error) => {
      reportClientError("Unhandled PDF export rejection:", error);
    });
  };

  const runImport = () => {
    void handleConfirmImport().catch((error) => {
      reportClientError("Unhandled import rejection:", error);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-orange-100 border border-orange-300 rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-black mb-4">
          Coxi Grade Calculator
        </h1>

        <div className="inline-flex rounded-lg border border-orange-300 bg-white p-1 mb-4">
          <button
            type="button"
            onClick={() => handleProgramChange("bachelor")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              program === "bachelor"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-orange-50"
            }`}
          >
            Bachelor
          </button>
          <button
            type="button"
            onClick={() => handleProgramChange("master")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              program === "master"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-orange-50"
            }`}
          >
            Master (CS24)
          </button>
        </div>

        <a
          href="https://docs.google.com/presentation/d/1Z9MCpDWbZTBiZc_2o6PQsPOk2LLjH4pgyAhDWan3scI/edit?slide=id.g30b09d76721_0_0#slide=id.g30b09d76721_0_0"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-orange-600 hover:text-orange-800 text-lg block"
        >
          {program === "bachelor"
            ? "Explanation of the course system"
            : "Master CS24 program structure (PO Nov 2025)"}
        </a>
      </div>

      <div ref={contentRef}>
        {program === "bachelor" ? (
          <BachelorView key={remountKey} isExporting={isExporting} />
        ) : (
          <MasterView key={remountKey} isExporting={isExporting} />
        )}
      </div>

      <footer className="mt-12 py-4 border-t text-center text-sm text-gray-500">
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={runExportPdf}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExporting ? "Exporting..." : "📄 Export to PDF"}
            </Button>
            <Button
              onClick={handleExportJson}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              🧾 Export JSON
            </Button>
            <Button
              onClick={openUploadModal}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              ⬆️ Upload JSON
            </Button>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            JSON export includes both Bachelor and Master data. Legacy
            Bachelor-only backups (version 1) are still supported on import.
          </p>
        </div>
        <p>
          Created by Luca Saur • Email: mail@lucasaur •{" "}
          <a
            href="https://github.com/saurluca/coxi-credits"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
        </p>
      </footer>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Upload JSON backup</h3>
            <p className="text-sm text-gray-600">
              Selecting a backup will overwrite your current settings and data
              on this device (Bachelor and Master).
            </p>
            <input
              type="file"
              accept="application/json"
              onChange={handleFileChange}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={closeUploadModal}
                variant="outline"
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                onClick={runImport}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? "Importing..." : "Confirm Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
