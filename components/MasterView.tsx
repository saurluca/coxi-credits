"use client";

import { Progress } from "@/components/ui/progress";
import { OverallProgress } from "@/components/OverallProgress";
import { MasterMandatoryArea } from "@/components/MasterMandatoryArea";
import { ElectiveAreaCard } from "@/components/ElectiveAreaCard";
import { AddElectiveForm } from "@/components/AddElectiveForm";
import { FreeElectives } from "@/components/FreeElectives";
import { useMasterTracker } from "@/hooks/useMasterTracker";
import {
  masterAreaMaxCredits,
  masterAreaNames,
  masterAreaOrder,
  MASTER_CREDITS,
  THESIS,
} from "@/app/constants/master";
import { getMasterAreaColor } from "@/app/utils/colors";
import { MasterArea } from "@/app/types";

interface MasterViewProps {
  isExporting?: boolean;
}

function getSpecializationBadge(
  area: MasterArea,
  credits: number,
  specializations: MasterArea[],
) {
  if (area === "methods") {
    return { text: "Included", className: "bg-green-100 text-green-800" };
  }
  if (specializations.includes(area)) {
    return { text: "Specialization", className: "bg-blue-100 text-blue-800" };
  }
  if (credits >= MASTER_CREDITS.specializationMin) {
    return { text: "Specialization", className: "bg-blue-100 text-blue-800" };
  }
  if (credits > 0 && credits < MASTER_CREDITS.specializationMin) {
    return {
      text: `${MASTER_CREDITS.specializationMin - credits} ECTS to specialization`,
      className: "bg-amber-100 text-amber-800",
    };
  }
  return { text: "Included", className: "bg-green-100 text-green-800" };
}

export function MasterView({ isExporting = false }: MasterViewProps) {
  const {
    studyProject,
    thesis,
    mandatoryElectives,
    freeElectives,
    grades,
    thesisGrade,
    specializations,
    newCourse,
    setNewCourse,
    newFreeElective,
    setNewFreeElective,
    toggleStudyProjectPart,
    toggleThesis,
    calculateAreaProgress,
    calculateAreaTotalCredits,
    getAreaCountedCourseIds,
    setGrade,
    setThesisGrade,
    addMandatoryElective,
    addFreeElective,
    removeMandatoryElective,
    removeFreeElective,
    courseworkGrade,
    finalGrade,
    completedMandatoryCredits,
    mandatoryProgress,
    thesisCompleted,
    completedThesisCredits,
    totalMandatoryElectiveCredits,
    mandatoryElectiveProgress,
    totalFreeElectiveCredits,
    freeElectiveProgress,
    cappedFreeElectiveCredits,
    getFreeElectiveCountedCourseIds,
    totalCompletedCredits,
    totalRequiredCredits,
    overallProgress,
    mandatoryElectiveCourseIdsUsedInGrading,
    mandatoryElectiveGradingCapExceeded,
    cappedMandatoryElectiveCredits,
  } = useMasterTracker();

  const masterAreas = masterAreaOrder.map((area) => ({
    key: area,
    label: masterAreaNames[area],
    colorClass: getMasterAreaColor(area),
  }));

  const focusSpecializationCount = specializations.length;
  const thesisProgress = (completedThesisCredits / THESIS.credits) * 100;

  return (
    <div className="space-y-6">
      <div
        role="status"
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900"
      >
        <span className="font-semibold uppercase tracking-wide">
          Experimental
        </span>
        <span className="mx-2">·</span>
        Master (CS24) tracking is new and may not yet match the official
        Prüfungsordnung — please verify credits and grades independently.
      </div>

      <OverallProgress
        title="Overall Progress (Master CS24)"
        overallProgress={overallProgress}
        totalCompletedCredits={totalCompletedCredits}
        totalRequiredCredits={totalRequiredCredits}
        currentWeightedGrade={null}
        courseworkGrade={courseworkGrade}
        finalGrade={finalGrade}
        thesisGrade={thesisGrade}
        thesisCompleted={thesisCompleted}
      />

      <MasterMandatoryArea
        studyProject={studyProject}
        grades={grades}
        thesisCompleted={thesis.completed}
        thesisGrade={thesisGrade}
        mandatoryProgress={mandatoryProgress}
        completedMandatoryCredits={completedMandatoryCredits}
        thesisProgress={thesisProgress}
        completedThesisCredits={completedThesisCredits}
        onToggleStudyProjectPart={toggleStudyProjectPart}
        onToggleThesis={toggleThesis}
        onSetGrade={setGrade}
        onSetThesisGrade={setThesisGrade}
      />

      <div className="bg-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-center mb-2">
          Mandatory Electives ({MASTER_CREDITS.mandatoryElective} ECTS required)
        </h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          At least {MASTER_CREDITS.specializationMin} ECTS from one focus area
          (max {MASTER_CREDITS.specializationMax} per area). At most two
          specializations.
        </p>
        <div className="space-y-2 mb-4">
          <Progress
            value={Math.min(mandatoryElectiveProgress, 100)}
            className="h-2"
          />
          <p className="text-sm text-center text-gray-600">
            {cappedMandatoryElectiveCredits} of{" "}
            {MASTER_CREDITS.mandatoryElective} ECTS counted (
            {Math.round(mandatoryElectiveProgress)}%)
            {totalMandatoryElectiveCredits >
              MASTER_CREDITS.mandatoryElective && (
              <span className="text-amber-700 font-medium">
                {" "}
                · {totalMandatoryElectiveCredits} registered
              </span>
            )}
          </p>
          {totalMandatoryElectiveCredits > MASTER_CREDITS.mandatoryElective && (
            <p className="text-xs text-center text-amber-600 font-semibold">
              Extra courses stay listed for your records; only{" "}
              {MASTER_CREDITS.mandatoryElective} ECTS count toward the total.
              Best grades are used for the average.
            </p>
          )}
          {focusSpecializationCount > 2 && (
            <p className="text-xs text-center text-amber-600 font-semibold">
              More than 2 focus areas reach {MASTER_CREDITS.specializationMin}+
              ECTS — at most 2 specializations allowed
            </p>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {masterAreaOrder.map((area) => {
            const areaProgress = calculateAreaProgress(area);
            const totalRegisteredCredits = calculateAreaTotalCredits(area);
            const maxCredits = masterAreaMaxCredits[area];
            const badge = getSpecializationBadge(
              area,
              areaProgress,
              specializations,
            );

            return (
              <ElectiveAreaCard
                key={area}
                title={masterAreaNames[area]}
                areaKey={area}
                areaProgress={areaProgress}
                totalRegisteredCredits={totalRegisteredCredits}
                maxCredits={maxCredits}
                electiveCourses={mandatoryElectives}
                colorClass={getMasterAreaColor(area)}
                grades={grades}
                onSetGrade={setGrade}
                onRemoveCourse={removeMandatoryElective}
                countedCourseIds={getAreaCountedCourseIds(area)}
                gradingCourseIds={mandatoryElectiveCourseIdsUsedInGrading}
                gradingCapExceeded={mandatoryElectiveGradingCapExceeded}
                badgeText={badge.text}
                badgeClassName={badge.className}
                isExporting={isExporting}
              />
            );
          })}
        </div>

        {!isExporting && (
          <AddElectiveForm
            newCourse={newCourse}
            areas={masterAreas}
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
              setNewCourse({ ...newCourse, area: area as MasterArea })
            }
            onAddCourse={addMandatoryElective}
            title='Add New "Topics in..." Course'
            buttonLabel="Add Mandatory Elective"
          />
        )}
      </div>

      <FreeElectives
        title={`Free Elective Area / Profilbildender Wahlbereich (${MASTER_CREDITS.freeElective} ECTS)`}
        maxFreeElectiveCredits={MASTER_CREDITS.freeElective}
        cappedFreeElectiveCredits={cappedFreeElectiveCredits}
        totalFreeElectiveCredits={totalFreeElectiveCredits}
        freeElectiveProgress={freeElectiveProgress}
        freeElectiveCourses={freeElectives}
        countedCourseIds={getFreeElectiveCountedCourseIds()}
        newFreeElective={newFreeElective}
        onNewFreeElectiveChange={(field, value) => {
          setNewFreeElective({ ...newFreeElective, [field]: value });
        }}
        onAddFreeElective={addFreeElective}
        onRemoveFreeElective={removeFreeElective}
        grades={grades}
        onSetGrade={setGrade}
        showGradedToggle
        isExporting={isExporting}
      />
    </div>
  );
}
