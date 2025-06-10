import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { areaNames, validGrades } from "@/app/constants"
import { getCategoryColor } from "@/app/utils/colors"

interface AddElectiveFormProps {
    newCourse: {
        name: string
        credits: string
        area: keyof typeof areaNames
        grade?: string
    }
    onCourseNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onCreditsChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onGradeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onAreaChange: (value: keyof typeof areaNames) => void
    onAddCourse: () => void
}

export function AddElectiveForm({
    newCourse,
    onCourseNameChange,
    onCreditsChange,
    onGradeChange,
    onAreaChange,
    onAddCourse
}: AddElectiveFormProps) {
    return (
        <div className="mt-6 space-y-2">
            <h3 className="font-medium">Add New Mandatory Elective Course</h3>
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
                    onValueChange={(value) => onAreaChange(value as keyof typeof areaNames)}
                    className="gap-2"
                >
                    <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("ai")}`}
                        onClick={() => onAreaChange("ai")}>
                        <RadioGroupItem value="ai" id="ai" />
                        <Label className="flex-grow cursor-pointer">
                            Artificial Intelligence and Machine Learning
                        </Label>
                    </div>
                    <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("philosophy")}`}
                        onClick={() => onAreaChange("philosophy")}>
                        <RadioGroupItem value="philosophy" id="philosophy" />
                        <Label className="flex-grow cursor-pointer">
                            Mind, Ethics, and Society
                        </Label>
                    </div>
                    <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("psychology")}`}
                        onClick={() => onAreaChange("psychology")}>
                        <RadioGroupItem value="psychology" id="psychology" />
                        <Label className="flex-grow cursor-pointer">
                            Psychology, Communication, Neuroscience, and Behavior
                        </Label>
                    </div>
                    <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("cs")}`}
                        onClick={() => onAreaChange("cs")}>
                        <RadioGroupItem value="cs" id="cs" />
                        <Label className="flex-grow cursor-pointer">
                            Computer Science
                        </Label>
                    </div>
                    <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("math")}`}
                        onClick={() => onAreaChange("math")}>
                        <RadioGroupItem value="math" id="math" />
                        <Label className="flex-grow cursor-pointer">
                            Mathematics
                        </Label>
                    </div>
                </RadioGroup>
                <Button onClick={onAddCourse}>Add Elective Course</Button>
            </div>
        </div>
    )
} 