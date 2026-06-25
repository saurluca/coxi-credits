"use client";

import { Progress } from "@/components/ui/progress";
import { OverallProgress } from "@/components/OverallProgress";
import { MandatoryArea } from "@/components/MandatoryArea";
import { ElectiveAreaCard } from "@/components/ElectiveAreaCard";
import { AddElectiveForm } from "@/components/AddElectiveForm";
import { FreeElectives } from "@/components/FreeElectives";
import { useCourseTracker } from "@/hooks/useCourseTracker";
import {
  areaNames,
  bachelorAreaMaxCredits,
  BACHELOR_MANDATORY_ELECTIVE_CAP,
  courses,
} from "@/app/constants";
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
    calculateAreaTotalCredits,
    getAreaCountedCourseIds,
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
    cappedElectiveCredits,
    electiveProgress,
    maxFreeElectiveCredits,
    totalFreeElectiveCredits,
    cappedFreeElectiveCredits,
    freeElectiveProgress,
    totalCompletedCredits,
    totalRequiredCredits,
    overallProgress,
    electiveCourseIdsUsedInGrading,
    electiveGradingCapExceeded,
    getFreeElectiveCountedCourseIds,
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
          Mandatory Electives ({BACHELOR_MANDATORY_ELECTIVE_CAP} ECTS required)
        </h2>
        <div className="space-y-2 mb-4">
          <Progress value={Math.min(electiveProgress, 100)} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {cappedElectiveCredits} of {BACHELOR_MANDATORY_ELECTIVE_CAP} ECTS
            counted ({Math.round(electiveProgress)}%)
            {totalElectiveCredits > BACHELOR_MANDATORY_ELECTIVE_CAP && (
              <span className="text-amber-700 font-medium">
                {" "}
                · {totalElectiveCredits} registered
              </span>
            )}
          </p>
          {totalElectiveCredits > BACHELOR_MANDATORY_ELECTIVE_CAP && (
            <p className="text-xs text-center text-amber-600 font-semibold">
              Extra courses stay listed for your records; only{" "}
              {BACHELOR_MANDATORY_ELECTIVE_CAP} ECTS count toward the total.
              Best grades are used for the average.
            </p>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {(Object.keys(areaNames) as Array<keyof typeof areaNames>).map(
            (area) => {
              const maxCredits = bachelorAreaMaxCredits[area];
              const areaProgress = calculateAreaProgress(area);
              const totalRegisteredCredits = calculateAreaTotalCredits(area);

              return (
                <ElectiveAreaCard
                  key={area}
                  title={areaNames[area]}
                  areaKey={area}
                  areaProgress={areaProgress}
                  totalRegisteredCredits={totalRegisteredCredits}
                  maxCredits={maxCredits}
                  electiveCourses={electiveCourses}
                  colorClass={getCategoryColor(area)}
                  grades={grades}
                  onSetGrade={setGrade}
                  onRemoveCourse={removeElectiveCourse}
                  countedCourseIds={getAreaCountedCourseIds(area)}
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
        cappedFreeElectiveCredits={cappedFreeElectiveCredits}
        totalFreeElectiveCredits={totalFreeElectiveCredits}
        freeElectiveProgress={freeElectiveProgress}
        freeElectiveCourses={freeElectiveCourses}
        countedCourseIds={getFreeElectiveCountedCourseIds()}
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
