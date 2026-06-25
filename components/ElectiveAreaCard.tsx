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
  maxCredits: number;
  electiveCourses: ElectiveCourseItem[];
  areaKey: string;
  colorClass: string;
  grades: Record<string, number | string>;
  onSetGrade: (courseId: string, grade: number | string | "") => void;
  onRemoveCourse: (courseId: string) => void;
  badgeText?: string;
  badgeClassName?: string;
  gradingCourseIds?: ReadonlySet<string>;
  gradingCapExceeded?: boolean;
  isExporting?: boolean;
}

export function ElectiveAreaCard({
  title,
  areaProgress,
  maxCredits,
  electiveCourses,
  areaKey,
  colorClass,
  grades,
  onSetGrade,
  onRemoveCourse,
  badgeText = "Included",
  badgeClassName = "bg-green-100 text-green-800",
  gradingCourseIds,
  gradingCapExceeded = false,
  isExporting = false,
}: ElectiveAreaCardProps) {
  const progressPercentage =
    maxCredits > 0 ? (areaProgress / maxCredits) * 100 : 0;

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
        {areaProgress} of {maxCredits} ECTS completed
        {areaProgress > 0 && ` (${Math.round(progressPercentage)}%)`}
      </p>
      <div className="space-y-2">
        {electiveCourses
          .filter((course) => course.area === areaKey)
          .map((course) => {
            const hasGrade =
              grades[course.id] !== undefined && grades[course.id] !== "-";
            const countsTowardGrade = gradingCourseIds?.has(course.id) ?? false;
            const showGradeInclusion =
              gradingCapExceeded && gradingCourseIds !== undefined && hasGrade;

            return (
              <div
                key={course.id}
                className={`flex justify-between items-center bg-white p-2 rounded border-2 ${colorClass}`}
              >
                <div className="flex flex-col min-w-0">
                  <span>{course.name}</span>
                  {showGradeInclusion && (
                    <span
                      className={`text-xs ${
                        countsTowardGrade ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {countsTowardGrade
                        ? "Counts toward grade"
                        : "Not in grade average"}
                    </span>
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
