import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Course } from "@/app/types"
import { validGrades, courseOptions } from "@/app/constants"
import { getCategoryColor } from "@/app/utils/colors"

interface CourseCardProps {
    course: Course
    isCompleted: boolean
    mathCredits: number
    isUsedInGrading: boolean
    grade?: number | string
    selectedCourse?: string
    onToggleCourse: (courseId: string) => void
    onToggleMathCredits: () => void
    onSetGrade: (courseId: string, grade: number | string | "") => void
    onSetCourseSelection?: (courseId: string, selection: string) => void
}

export function CourseCard({
    course,
    isCompleted,
    mathCredits,
    isUsedInGrading,
    grade,
    selectedCourse,
    onToggleCourse,
    onToggleMathCredits,
    onSetGrade,
    onSetCourseSelection
}: CourseCardProps) {
    const hasCourseOptions = courseOptions[course.id] !== undefined
    const displayName = hasCourseOptions && selectedCourse ? selectedCourse : course.name
    return (
        <Card
            className={`p-4 border-2 ${getCategoryColor(course.category)}`}
        >
            <div className="flex items-start gap-3">
                <Checkbox
                    id={course.id}
                    checked={isCompleted}
                    onCheckedChange={() => onToggleCourse(course.id)}
                />
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0 max-w-full">
                            {hasCourseOptions ? (
                                <Select
                                    value={selectedCourse || ""}
                                    onValueChange={(value: string) => onSetCourseSelection?.(course.id, value)}
                                >
                                    <SelectTrigger className="w-full border-0 p-0 h-auto hover:bg-gray-50 rounded text-left">
                                        <div className="text-left text-sm font-medium leading-tight break-words whitespace-normal pr-4">
                                            {displayName}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-w-[300px]">
                                        {courseOptions[course.id].map((option) => (
                                            <SelectItem key={option} value={option} className="text-sm">
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <label htmlFor={course.id} className="text-sm font-medium leading-tight break-words whitespace-normal block">
                                    {displayName}
                                </label>
                            )}
                        </div>
                        {isUsedInGrading ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 whitespace-nowrap flex-shrink-0 self-start">
                                Included
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap flex-shrink-0 self-start">
                                Excluded
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        {course.id === "math" ? mathCredits : course.credits} ECTS
                        {course.options && course.options === 1 && ` (${course.options} out of ${course.totalInGroup} courses)`}
                    </p>
                    {course.id === "math" && (
                        <div className="flex items-center space-x-2 mt-2">
                            <div
                                onClick={onToggleMathCredits}
                                className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${mathCredits === 9 ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
                                    }`}
                            >
                                <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                            </div>
                            <span className="text-xs text-gray-600">{mathCredits === 9 ? "9 ECTS" : "6 ECTS"}</span>
                        </div>
                    )}
                    {isCompleted && (
                        (course.id !== "cog" && !(course.id === "math" && mathCredits === 6)) && (
                            <Select
                                value={grade?.toString() || "-"}
                                onValueChange={(value: string) => onSetGrade(course.id, value === "-" ? value : parseFloat(value))}
                            >
                                <SelectTrigger className="w-full mt-2">
                                    <div className="flex-1 text-left">
                                        {grade?.toString() || "-"}
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
                        )
                    )}
                </div>
            </div>
        </Card>
    )
} 