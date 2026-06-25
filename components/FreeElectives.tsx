import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { validGrades } from "@/app/constants";

interface FreeElectiveItem {
  id: string;
  name: string;
  credits: number;
  graded?: boolean;
}

interface FreeElectivesProps {
  title: string;
  maxFreeElectiveCredits: number;
  cappedFreeElectiveCredits: number;
  totalFreeElectiveCredits: number;
  freeElectiveProgress: number;
  freeElectiveCourses: FreeElectiveItem[];
  countedCourseIds?: ReadonlySet<string>;
  newFreeElective: {
    name: string;
    credits: string;
    graded?: boolean;
    grade?: string;
  };
  onNewFreeElectiveChange: (
    field: "name" | "credits" | "graded" | "grade",
    value: string | boolean,
  ) => void;
  onAddFreeElective: () => void;
  onRemoveFreeElective: (courseId: string) => void;
  grades?: Record<string, number | string>;
  onSetGrade?: (courseId: string, grade: number | string | "") => void;
  showGradedToggle?: boolean;
  isExporting?: boolean;
}

export function FreeElectives({
  title,
  maxFreeElectiveCredits,
  cappedFreeElectiveCredits,
  totalFreeElectiveCredits,
  freeElectiveProgress,
  freeElectiveCourses,
  countedCourseIds,
  newFreeElective,
  onNewFreeElectiveChange,
  onAddFreeElective,
  onRemoveFreeElective,
  grades = {},
  onSetGrade,
  showGradedToggle = false,
  isExporting = false,
}: FreeElectivesProps) {
  const capExceeded = totalFreeElectiveCredits > maxFreeElectiveCredits;

  return (
    <div className="bg-green-100 p-6 rounded-lg border border-green-200">
      <h2 className="text-xl font-semibold text-center mb-4">{title}</h2>
      <div className="space-y-2">
        <Progress value={Math.min(freeElectiveProgress, 100)} className="h-2" />
        <p className="text-sm text-center text-gray-600">
          {cappedFreeElectiveCredits} of {maxFreeElectiveCredits} ECTS counted (
          {Math.round(freeElectiveProgress)}%)
          {capExceeded && (
            <span className="text-amber-700 font-medium">
              {" "}
              · {totalFreeElectiveCredits} registered
            </span>
          )}
        </p>
        {capExceeded && (
          <p className="text-xs text-center text-amber-600 font-semibold">
            Extra courses stay listed for your records; only{" "}
            {maxFreeElectiveCredits} ECTS count toward the total.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {freeElectiveCourses.map((course) => {
          const countsTowardTotal = countedCourseIds?.has(course.id) ?? true;

          return (
            <div
              key={course.id}
              className={`flex justify-between items-center bg-white p-2 rounded ${
                capExceeded && !countsTowardTotal ? "opacity-80" : ""
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span>{course.name}</span>
                {showGradedToggle && course.graded === false && (
                  <span className="text-xs text-gray-500">
                    Passed (ungraded)
                  </span>
                )}
                {capExceeded && (
                  <span
                    className={
                      countsTowardTotal
                        ? "text-xs text-green-700 font-medium"
                        : "text-xs text-amber-700 font-medium"
                    }
                  >
                    {countsTowardTotal
                      ? "Counted toward total"
                      : "Not counted (cap reached)"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>{course.credits} ECTS</span>
                {showGradedToggle && course.graded && onSetGrade && (
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
                )}
                {!isExporting && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveFreeElective(course.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isExporting && (
        <div className="mt-6 space-y-2">
          <h3 className="font-medium">Add New Free Elective Course</h3>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Course Name"
              value={newFreeElective.name}
              onChange={(e) => onNewFreeElectiveChange("name", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Credits"
              value={newFreeElective.credits}
              onChange={(e) =>
                onNewFreeElectiveChange("credits", e.target.value)
              }
            />
            {showGradedToggle && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="free-elective-graded"
                    checked={newFreeElective.graded ?? false}
                    onChange={(e) =>
                      onNewFreeElectiveChange("graded", e.target.checked)
                    }
                  />
                  <label htmlFor="free-elective-graded" className="text-sm">
                    Number graded (otherwise &quot;passed&quot; only)
                  </label>
                </div>
                {newFreeElective.graded && (
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={newFreeElective.grade || "-"}
                    onChange={(e) =>
                      onNewFreeElectiveChange("grade", e.target.value)
                    }
                  >
                    {validGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
            <Button onClick={onAddFreeElective}>
              Add Free Elective Course
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
