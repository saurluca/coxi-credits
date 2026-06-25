"use client";

import { OverallProgress } from "@/components/OverallProgress";
import { MandatoryArea } from "@/components/MandatoryArea";
import { ElectiveAreaCard } from "@/components/ElectiveAreaCard";
import { AddElectiveForm } from "@/components/AddElectiveForm";
import { FreeElectives } from "@/components/FreeElectives";
import { useCourseTracker } from "@/hooks/useCourseTracker";
import { areaNames, courses } from "@/app/constants";
import { getCategoryColor } from "@/app/utils/colors";

interface BachelorViewProps {
  isExporting?: boolean;
}

export function BachelorView({ isExporting = false }: BachelorViewProps) {
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
    courseSelections,
    toggleCourse,
    calculateAreaProgress,
    setGrade,
    addElectiveCourse,
    addFreeElectiveCourse,
    removeElectiveCourse,
    removeFreeElectiveCourse,
    toggleMathCredits,
    calculateWeightedGrade,
    setCourseSelection,
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
    overallProgress,
    electiveCourseIdsUsedInGrading,
    electiveGradingCapExceeded,
  } = useCourseTracker();

  const currentWeightedGrade = calculateWeightedGrade();

  const bachelorAreas = (
    Object.keys(areaNames) as Array<keyof typeof areaNames>
  )
    .filter((area) => area !== "foundation")
    .map((area) => ({
      key: area,
      label: areaNames[area],
      colorClass: getCategoryColor(area),
    }));

  return (
    <div className="space-y-6">
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
        courses={courses}
        completedCourses={completedCourses}
        mathCredits={mathCredits}
        electiveCourses={electiveCourses}
        topGradedAreas={topGradedAreas}
        grades={grades}
        courseSelections={courseSelections}
        toggleCourse={toggleCourse}
        toggleMathCredits={toggleMathCredits}
        setGrade={setGrade}
        setCourseSelection={setCourseSelection}
      />

      <div className="bg-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-center mb-4">
          Mandatory Electives (60 ECTS required)
        </h2>
        <div className="space-y-2">
          <div className="bg-white p-2 rounded">
            <div className="flex justify-between items-center text-sm">
              <span>Progress</span>
              <span>
                {totalElectiveCredits} of 60 ECTS completed (
                {Math.round(electiveProgress)}%)
              </span>
            </div>
            {totalElectiveCredits > 60 && (
              <p className="text-xs text-amber-600 font-semibold mt-1">
                (Only 60 ECTS counted toward total; best grades used for
                average)
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {(Object.keys(areaNames) as Array<keyof typeof areaNames>).map(
            (area) => {
              const maxCredits =
                area === "foundation"
                  ? 4
                  : area === "cs" || area === "math"
                    ? 9
                    : 48;
              const areaProgress = calculateAreaProgress(area);

              return (
                <ElectiveAreaCard
                  key={area}
                  title={areaNames[area]}
                  areaKey={area}
                  areaProgress={areaProgress}
                  maxCredits={maxCredits}
                  electiveCourses={electiveCourses}
                  colorClass={getCategoryColor(area)}
                  grades={grades}
                  onSetGrade={setGrade}
                  onRemoveCourse={removeElectiveCourse}
                  gradingCourseIds={electiveCourseIdsUsedInGrading}
                  gradingCapExceeded={electiveGradingCapExceeded}
                  isExporting={isExporting}
                />
              );
            },
          )}
        </div>

        {!isExporting && (
          <AddElectiveForm
            newCourse={newCourse}
            areas={bachelorAreas}
            onCourseNameChange={(e) =>
              setNewCourse({ ...newCourse, name: e.target.value })
            }
            onCreditsChange={(e) =>
              setNewCourse({ ...newCourse, credits: e.target.value })
            }
            onGradeChange={(e) =>
              setNewCourse({ ...newCourse, grade: e.target.value })
            }
            onAreaChange={(area) =>
              setNewCourse({
                ...newCourse,
                area: area as keyof typeof areaNames,
              })
            }
            onAddCourse={addElectiveCourse}
          />
        )}
      </div>

      <FreeElectives
        title={`Free Electives (${maxFreeElectiveCredits} ECTS possible)`}
        maxFreeElectiveCredits={maxFreeElectiveCredits}
        totalFreeElectiveCredits={totalFreeElectiveCredits}
        freeElectiveProgress={freeElectiveProgress}
        freeElectiveCourses={freeElectiveCourses}
        newFreeElective={newFreeElective}
        onNewFreeElectiveChange={(field, value) => {
          if (field === "name" || field === "credits") {
            setNewFreeElective({
              ...newFreeElective,
              [field]: value as string,
            });
          }
        }}
        onAddFreeElective={addFreeElectiveCourse}
        onRemoveFreeElective={removeFreeElectiveCourse}
        isExporting={isExporting}
      />
    </div>
  );
}
