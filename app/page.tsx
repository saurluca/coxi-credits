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

        yPx += sliceHeightPx;
        if (yPx < canvas.height) {
          pdf.addPage();
        }
      }

      pdf.save(`course-tracker-${dateStr}.pdf`);
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
        <div className="text-center">
          <a href="https://docs.google.com/presentation/d/1Z9MCpDWbZTBiZc_2o6PQsPOk2LLjH4pgyAhDWan3scI/edit?slide=id.g30b09d76721_0_0#slide=id.g30b09d76721_0_0" 
          target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-700 text-lg">
            Additional Resources
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
        <div className="flex justify-center mb-2">
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? "Exporting..." : "📄 Export to PDF"}
          </Button>
        </div>
        <p>Created by Luca Saur • Email: mail@lucasaur • <a href="https://github.com/saurluca/coxi-credits" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub</a></p>
      </footer>
    </div>
  );
}

