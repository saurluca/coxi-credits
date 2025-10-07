"use client"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { OverallProgress } from "@/components/OverallProgress"
import { MandatoryArea } from "@/components/MandatoryArea"
import { CourseCard } from "@/components/CourseCard"
import { ElectiveAreaCard } from "@/components/ElectiveAreaCard"
import { AddElectiveForm } from "@/components/AddElectiveForm"
import { FreeElectives } from "@/components/FreeElectives"
import { useCourseTracker } from "@/hooks/useCourseTracker"
import { areaNames, courses } from "./constants"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function CourseTracker() {
  const [isExporting, setIsExporting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const {
    completedCourses,
    electiveCourses,
    freeElectiveCourses,
    mathCredits,
    topGradedAreas,
    newCourse,
    setNewCourse,
    newFreeElective,
    setNewFreeElective,
    grades,
    toggleCourse,
    calculateAreaProgress,
    setGrade,
    addElectiveCourse,
    addFreeElectiveCourse,
    removeElectiveCourse,
    removeFreeElectiveCourse,
    toggleMathCredits,
    calculateWeightedGrade,
    exportDataAsJsonString,
    importDataFromPayload,
    totalMandatoryCredits,
    completedMandatoryCredits,
    mandatoryProgress,
    totalElectiveCredits,
    electiveProgress,
    maxFreeElectiveCredits,
    totalFreeElectiveCredits,
    freeElectiveProgress,
    totalCompletedCredits,
    totalRequiredCredits,
    overallProgress
  } = useCourseTracker()

  const handleExportJson = () => {
    try {
      const json = exportDataAsJsonString()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]
      const a = document.createElement('a')
      a.href = url
      a.download = `coxi-credits-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('JSON export failed:', e)
      alert('Failed to export JSON.')
    }
  }

  const openUploadModal = () => {
    setSelectedFile(null)
    setIsUploadOpen(true)
  }

  const closeUploadModal = () => {
    if (isImporting) return
    setIsUploadOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    setSelectedFile(file || null)
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      alert('Please choose a JSON file.')
      return
    }
    setIsImporting(true)
    try {
      const text = await selectedFile.text()
      const parsed = JSON.parse(text)
      importDataFromPayload(parsed)
      setIsUploadOpen(false)
    } catch (e) {
      console.error('Import failed:', e)
      alert('Failed to import JSON. Please check the file and try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);

    try {
      // Wait for the re-render to complete after setting isExporting to true
      await new Promise(resolve => setTimeout(resolve, 100));

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      // Prepare PDF with A4 size
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Compute a dynamic render scale to balance clarity and size
      const targetDpi = 320; // good balance for text clarity
      const elementWidthPx = contentRef.current.clientWidth || 1024;
      const desiredCanvasWidthPx = Math.round((pdfWidth / 25.4) * targetDpi);
      const computedScale = Math.min(2, Math.max(1, desiredCanvasWidthPx / elementWidthPx));

      // Render the full element at computed scale
      const canvas = await html2canvas(contentRef.current, {
        scale: computedScale,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Calculate how tall one PDF page is in canvas pixels
      const pageWidthPx = canvas.width;
      const pageHeightPx = Math.floor((canvas.width * pdfHeight) / pdfWidth);

      // Pre-calc the drawn image width in mm for each page
      const imgWidth = pdfWidth;

      let yPx = 0;
      while (yPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yPx);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = pageWidthPx;
        pageCanvas.height = sliceHeightPx;

        const ctx = pageCanvas.getContext('2d');
        if (!ctx) break;

        // Copy a vertical slice from the full canvas into the page canvas
        ctx.drawImage(
          canvas,
          0,
          yPx,
          pageWidthPx,
          sliceHeightPx,
          0,
          0,
          pageWidthPx,
          sliceHeightPx
        );

        // Use JPEG with moderate compression for better readability
        const pageDataUrl = pageCanvas.toDataURL('image/jpeg', 0.82);
        const pageImgHeightMm = (sliceHeightPx * imgWidth) / pageWidthPx;

        pdf.addImage(pageDataUrl, 'JPEG', 0, 0, imgWidth, pageImgHeightMm);

        // Footer: provenance + clickable link
        const prefix = 'Exported from Coxi Credits • ';
        const url = 'https://coxi-credits.vercel.app/';
        pdf.setFontSize(15);
        pdf.setTextColor(120, 120, 120);
        const footerY = pdfHeight - 6;
        const totalWidth = pdf.getTextWidth(prefix + url);
        const startX = (pdfWidth / 2) - (totalWidth / 2);
        pdf.text(prefix, startX, footerY);
        pdf.textWithLink(url, startX + pdf.getTextWidth(prefix), footerY, { url });

        yPx += sliceHeightPx;
        if (yPx < canvas.height) {
          pdf.addPage();
        }
      }

      pdf.save(`coxi-credits-${dateStr}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentWeightedGrade = calculateWeightedGrade();

  const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCourse({ ...newCourse, name: e.target.value });
  }

  const handleCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCourse({ ...newCourse, credits: e.target.value });
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewCourse({ ...newCourse, grade: e.target.value });
  }

  const handleAreaChange = (area: keyof typeof areaNames) => {
    setNewCourse({ ...newCourse, area });
  }

  const handleFreeElectiveChange = (field: 'name' | 'credits', value: string) => {
    setNewFreeElective({ ...newFreeElective, [field]: value });
  }

  return (
    <div ref={contentRef} className="max-w-4xl mx-auto p-4 space-y-6">

      <div className="bg-orange-100 border border-orange-300 rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-black mb-4">Coxi Grade Calculator</h1>
        <a href="https://docs.google.com/presentation/d/1Z9MCpDWbZTBiZc_2o6PQsPOk2LLjH4pgyAhDWan3scI/edit?slide=id.g30b09d76721_0_0#slide=id.g30b09d76721_0_0" 
        target="_blank" rel="noopener noreferrer" className="underline text-orange-600 hover:text-orange-800 text-lg">
          Explanation of the course system
        </a>
      </div>

      <OverallProgress
        overallProgress={overallProgress}
        totalCompletedCredits={totalCompletedCredits}
        totalRequiredCredits={totalRequiredCredits}
        currentWeightedGrade={currentWeightedGrade}
      />

      <MandatoryArea
        mandatoryProgress={mandatoryProgress}
        completedMandatoryCredits={completedMandatoryCredits}
        totalMandatoryCredits={totalMandatoryCredits}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          let isUsedInGrading = false;

          if (course.id === "stats") {
            isUsedInGrading = true;
          }

          if (course.id === "math") {
            const mathElectives = electiveCourses.filter(course => course.area === "math");
            isUsedInGrading = mathElectives.length > 0 && mathCredits === 9;
          }

          if (course.id === "cs") {
            const csElectives = electiveCourses.filter(course => course.area === "cs");
            isUsedInGrading = csElectives.length > 0;
          }

          if (["ai", "philosophy", "psychology"].includes(course.category)) {
            isUsedInGrading = topGradedAreas.includes(course.category);
          }

          if (course.id === "cog") {
            isUsedInGrading = false;
          }

          return (
            <CourseCard
              key={course.id}
              course={course}
              isCompleted={completedCourses.includes(course.id)}
              mathCredits={mathCredits}
              isUsedInGrading={isUsedInGrading}
              grade={grades[course.id]}
              onToggleCourse={toggleCourse}
              onToggleMathCredits={toggleMathCredits}
              onSetGrade={setGrade}
            />
          );
        })}
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-center mb-4">Mandatory Electives (60 ECTS required)</h2>
        <div className="space-y-2">
          <div className="bg-white p-2 rounded">
            <div className="flex justify-between items-center text-sm">
              <span>Progress</span>
              <span>{totalElectiveCredits} of 60 ECTS completed ({Math.round(electiveProgress)}%)</span>
            </div>
            {totalElectiveCredits > 60 && (
              <p className="text-xs text-amber-600 font-semibold mt-1">
                (Only 60 ECTS counted toward total)
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {(Object.keys(areaNames) as Array<keyof typeof areaNames>).map((area) => {
            const maxCredits = area === "foundation" ? 4 : area === "cs" || area === "math" ? 9 : 48;
            const areaProgress = calculateAreaProgress(area);

            return (
              <ElectiveAreaCard
                key={area}
                area={area}
                areaProgress={areaProgress}
                maxCredits={maxCredits}
                electiveCourses={electiveCourses}
                grades={grades}
                onSetGrade={setGrade}
                onRemoveCourse={removeElectiveCourse}
                isExporting={isExporting}
              />
            );
          })}
        </div>

        {!isExporting && (
          <AddElectiveForm
            newCourse={newCourse}
            onCourseNameChange={handleCourseNameChange}
            onCreditsChange={handleCreditsChange}
            onGradeChange={handleGradeChange}
            onAreaChange={handleAreaChange}
            onAddCourse={addElectiveCourse}
          />
        )}
      </div>

      <FreeElectives
        maxFreeElectiveCredits={maxFreeElectiveCredits}
        totalFreeElectiveCredits={totalFreeElectiveCredits}
        freeElectiveProgress={freeElectiveProgress}
        freeElectiveCourses={freeElectiveCourses}
        newFreeElective={newFreeElective}
        onNewFreeElectiveChange={handleFreeElectiveChange}
        onAddFreeElective={addFreeElectiveCourse}
        onRemoveFreeElective={removeFreeElectiveCourse}
        isExporting={isExporting}
      />

      <footer className="mt-12 py-4 border-t text-center text-sm text-gray-500">
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={exportToPDF}
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
          <p className="text-xs text-gray-500 max-w-xl">JSON export is for backup and transfer. You can upload the same JSON later to restore all courses, credits, and grades.</p>
        </div>
        <p>Created by Luca Saur • Email: mail@lucasaur • <a href="https://github.com/saurluca/coxi-credits" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub</a></p>
      </footer>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Upload JSON backup</h3>
            <p className="text-sm text-gray-600">Selecting a backup will overwrite your current settings and data on this device.</p>
            <input type="file" accept="application/json" onChange={handleFileChange} />
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={closeUploadModal} variant="outline" disabled={isImporting}>Cancel</Button>
              <Button onClick={handleConfirmImport} className="bg-amber-600 hover:bg-amber-700 text-white" disabled={!selectedFile || isImporting}>
                {isImporting ? "Importing..." : "Confirm Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

