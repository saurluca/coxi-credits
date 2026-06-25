import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { validGrades } from "@/app/constants";

interface ElectiveCourseItem {
  id: string;
  name: string;
  credits: number;
  area: string;
}

interface ElectiveAreaCardProps {
  title: string;
  areaProgress: number;
  totalRegisteredCredits: number;
  maxCredits: number;
  electiveCourses: ElectiveCourseItem[];
  areaKey: string;
  colorClass: string;
  grades: Record<string, number | string>;
  onSetGrade: (courseId: string, grade: number | string | "") => void;
  onRemoveCourse: (courseId: string) => void;
  badgeText?: string;
  badgeClassName?: string;
  countedCourseIds?: ReadonlySet<string>;
  gradingCourseIds?: ReadonlySet<string>;
  gradingCapExceeded?: boolean;
  isExporting?: boolean;
}

export function ElectiveAreaCard({
  title,
  areaProgress,
  totalRegisteredCredits,
  maxCredits,
  electiveCourses,
  areaKey,
  colorClass,
  grades,
  onSetGrade,
  onRemoveCourse,
  badgeText = "Included",
  badgeClassName = "bg-green-100 text-green-800",
  countedCourseIds,
  gradingCourseIds,
  gradingCapExceeded = false,
  isExporting = false,
}: ElectiveAreaCardProps) {
  const progressPercentage =
    maxCredits > 0 ? (areaProgress / maxCredits) * 100 : 0;
  const areaCapExceeded = totalRegisteredCredits > maxCredits;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-medium">{title}</h3>
        {badgeText && (
          <span
            className={`text-xs px-2 py-1 rounded-full mx-1 whitespace-nowrap ${badgeClassName}`}
          >
            {badgeText}
          </span>
        )}
      </div>
      <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
      <p className="text-sm text-gray-600">
        {areaProgress} of {maxCredits} ECTS counted
        {areaProgress > 0 && ` (${Math.round(progressPercentage)}%)`}
        {areaCapExceeded && (
          <span className="text-amber-700 font-medium">
            {" "}
            · {totalRegisteredCredits} registered
          </span>
        )}
      </p>
      <div className="space-y-2">
        {electiveCourses
          .filter((course) => course.area === areaKey)
          .map((course) => {
            const hasGrade =
              grades[course.id] !== undefined && grades[course.id] !== "-";
            const countsTowardTotal = countedCourseIds?.has(course.id) ?? true;
            const countsTowardGrade = gradingCourseIds?.has(course.id) ?? false;
            const showInclusionLabels =
              areaCapExceeded || (gradingCapExceeded && hasGrade);

            return (
              <div
                key={course.id}
                className={`flex justify-between items-center bg-white p-2 rounded border-2 ${colorClass} ${
                  showInclusionLabels && !countsTowardTotal ? "opacity-80" : ""
                }`}
              >
                <div className="flex flex-col min-w-0 gap-0.5">
                  <span>{course.name}</span>
                  {showInclusionLabels && (
                    <div className="text-xs space-y-0.5">
                      {areaCapExceeded && (
                        <span
                          className={
                            countsTowardTotal
                              ? "text-green-700 font-medium"
                              : "text-amber-700 font-medium"
                          }
                        >
                          {countsTowardTotal
                            ? "Counted toward total"
                            : "Not counted (area cap)"}
                        </span>
                      )}
                      {gradingCapExceeded && hasGrade && (
                        <span
                          className={
                            countsTowardGrade
                              ? "text-green-700 font-medium"
                              : "text-amber-700 font-medium"
                          }
                        >
                          {countsTowardGrade
                            ? "In grade average"
                            : "Not in grade average"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>{course.credits} ECTS</span>
                  <Select
                    value={grades[course.id]?.toString() || "-"}
                    onValueChange={(value: string) =>
                      onSetGrade(
                        course.id,
                        value === "-" ? value : parseFloat(value),
                      )
                    }
                  >
                    <SelectTrigger className="w-24">
                      <div className="flex-1 text-left">
                        {grades[course.id]?.toString() || "-"}
                      </div>
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {validGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isExporting && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveCourse(course.id)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
