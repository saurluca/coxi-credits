import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { ElectiveCourse } from "@/app/types"
import { areaNames, validGrades } from "@/app/constants"
import { getCategoryColor } from "@/app/utils/colors"

interface ElectiveAreaCardProps {
    area: keyof typeof areaNames
    areaProgress: number
    maxCredits: number
    electiveCourses: ElectiveCourse[]
    grades: Record<string, number | string>
    onSetGrade: (courseId: string, grade: number | string | "") => void
    onRemoveCourse: (courseId: string) => void
    isExporting?: boolean
}

export function ElectiveAreaCard({
    area,
    areaProgress,
    maxCredits,
    electiveCourses,
    grades,
    onSetGrade,
    onRemoveCourse,
    isExporting = false
}: ElectiveAreaCardProps) {
    const progressPercentage = (areaProgress / maxCredits) * 100

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-medium">{areaNames[area]}</h3>
                <span className="text-xs px-2 py-1 rounded-full mx-1 bg-green-100 text-green-800">
                    Included
                </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600">
                {areaProgress} of {maxCredits} ECTS completed
                {areaProgress > 0 && ` (${Math.round(progressPercentage)}%)`}
            </p>
            <div className="space-y-2">
                {electiveCourses
                    .filter((course) => course.area === area)
                    .map((course) => (
                        <div key={course.id} className={`flex justify-between items-center bg-white p-2 rounded border-2 ${getCategoryColor(course.area)}`}>
                            <span>{course.name}</span>
                            <div className="flex items-center gap-2">
                                <span>{course.credits} ECTS</span>
                                <Select
                                    value={grades[course.id]?.toString() || "-"}
                                    onValueChange={(value: string) => onSetGrade(course.id, value === "-" ? value : parseFloat(value))}
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
                    ))}
            </div>
        </div>
    )
} 