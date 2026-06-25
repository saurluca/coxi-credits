import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { validGrades } from "@/app/constants";
import {
  STUDY_PROJECT_PARTS,
  STUDY_PROJECT_TOTAL_CREDITS,
  THESIS,
} from "@/app/constants/master";
import { StudyProjectState } from "@/app/types";
import { getMasterAreaColor } from "@/app/utils/colors";

interface MasterMandatoryAreaProps {
  studyProject: StudyProjectState;
  grades: Record<string, number | string>;
  thesisCompleted: boolean;
  thesisGrade: number | null;
  mandatoryProgress: number;
  completedMandatoryCredits: number;
  thesisProgress: number;
  completedThesisCredits: number;
  onToggleStudyProjectPart: (part: 1 | 2) => void;
  onToggleThesis: () => void;
  onSetGrade: (courseId: string, grade: number | string | "") => void;
  onSetThesisGrade: (grade: number | string | "") => void;
}

export function MasterMandatoryArea({
  studyProject,
  grades,
  thesisCompleted,
  thesisGrade,
  mandatoryProgress,
  completedMandatoryCredits,
  thesisProgress,
  completedThesisCredits,
  onToggleStudyProjectPart,
  onToggleThesis,
  onSetGrade,
  onSetThesisGrade,
}: MasterMandatoryAreaProps) {
  return (
    <div className="bg-lime-50 p-6 rounded-lg border border-green-200 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-center mb-4">
          Mandatory Area ({STUDY_PROJECT_TOTAL_CREDITS} ECTS)
        </h2>
        <div className="space-y-2 mb-4">
          <Progress value={mandatoryProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {completedMandatoryCredits} of {STUDY_PROJECT_TOTAL_CREDITS} ECTS
            completed ({Math.round(mandatoryProgress)}%)
          </p>
        </div>
        <div className="space-y-3">
          {STUDY_PROJECT_PARTS.map((part, index) => {
            const partNumber = (index + 1) as 1 | 2;
            const isCompleted =
              partNumber === 1
                ? studyProject.part1Completed
                : studyProject.part2Completed;
            const partGrade = grades[part.id];

            return (
              <Card
                key={part.id}
                className={`p-4 border-2 ${getMasterAreaColor("aiml")}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={part.id}
                    checked={isCompleted}
                    onCheckedChange={() => onToggleStudyProjectPart(partNumber)}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <label
                        htmlFor={part.id}
                        className="text-sm font-medium leading-tight"
                      >
                        {part.name}
                      </label>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                        Included
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {part.credits} ECTS (semester {part.semester})
                    </p>
                    {isCompleted && (
                      <Select
                        value={partGrade?.toString() || "-"}
                        onValueChange={(value: string) =>
                          onSetGrade(
                            part.id,
                            value === "-" ? value : parseFloat(value),
                          )
                        }
                      >
                        <SelectTrigger className="w-full mt-2">
                          <div className="flex-1 text-left">
                            {partGrade?.toString() || "-"}
                          </div>
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {validGrades.map((gradeOption) => (
                            <SelectItem key={gradeOption} value={gradeOption}>
                              {gradeOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-center mb-4">
          Master&apos;s Thesis ({THESIS.credits} ECTS)
        </h2>
        <div className="space-y-2 mb-4">
          <Progress value={thesisProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {completedThesisCredits} of {THESIS.credits} ECTS completed (
            {Math.round(thesisProgress)}%)
          </p>
        </div>
        <Card className="p-4 border-2 border-indigo-500">
          <div className="flex items-start gap-3">
            <Checkbox
              id={THESIS.id}
              checked={thesisCompleted}
              onCheckedChange={() => onToggleThesis()}
            />
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start gap-2">
                <label
                  htmlFor={THESIS.id}
                  className="text-sm font-medium leading-tight"
                >
                  {THESIS.name}
                </label>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                  Included in final grade (2/5)
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {THESIS.credits} ECTS · Requires 72 ECTS coursework passed
                before registration
              </p>
              {thesisCompleted && (
                <Select
                  value={thesisGrade?.toString() || "-"}
                  onValueChange={(value: string) =>
                    onSetThesisGrade(value === "-" ? value : parseFloat(value))
                  }
                >
                  <SelectTrigger className="w-full mt-2">
                    <div className="flex-1 text-left">
                      {thesisGrade?.toString() || "-"}
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {validGrades.map((gradeOption) => (
                      <SelectItem key={gradeOption} value={gradeOption}>
                        {gradeOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
