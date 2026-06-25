import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { validGrades } from "@/app/constants";

export interface AreaOption {
  key: string;
  label: string;
  colorClass: string;
}

interface AddElectiveFormProps {
  newCourse: {
    name: string;
    credits: string;
    area: string;
    grade?: string;
  };
  areas: AreaOption[];
  onCourseNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreditsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGradeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAreaChange: (value: string) => void;
  onAddCourse: () => void;
  title?: string;
  buttonLabel?: string;
}

export function AddElectiveForm({
  newCourse,
  areas,
  onCourseNameChange,
  onCreditsChange,
  onGradeChange,
  onAreaChange,
  onAddCourse,
  title = "Add New Mandatory Elective Course",
  buttonLabel = "Add Elective Course",
}: AddElectiveFormProps) {
  return (
    <div className="mt-6 space-y-2">
      <h3 className="font-medium">{title}</h3>
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Course Name"
          value={newCourse.name}
          onChange={onCourseNameChange}
        />
        <Input
          type="number"
          placeholder="Credits"
          value={newCourse.credits}
          onChange={onCreditsChange}
        />
        <select
          className="w-full p-2 border rounded-md bg-white"
          value={newCourse.grade || "-"}
          onChange={onGradeChange}
        >
          {validGrades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        <RadioGroup
          value={newCourse.area}
          onValueChange={onAreaChange}
          className="gap-2"
        >
          {areas.map((area) => (
            <div
              key={area.key}
              className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${area.colorClass}`}
              onClick={() => onAreaChange(area.key)}
            >
              <RadioGroupItem value={area.key} id={area.key} />
              <Label htmlFor={area.key} className="flex-grow cursor-pointer">
                {area.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button onClick={onAddCourse}>{buttonLabel}</Button>
      </div>
    </div>
  );
}
