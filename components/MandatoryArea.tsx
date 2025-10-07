import { Progress } from "@/components/ui/progress"
import { CourseCard } from "@/components/CourseCard"
import { Course, ElectiveCourse } from "@/app/types"

interface MandatoryAreaProps {
    mandatoryProgress: number
    completedMandatoryCredits: number
    totalMandatoryCredits: number
    courses: Course[]
    completedCourses: string[]
    mathCredits: number
    electiveCourses: ElectiveCourse[]
    topGradedAreas: string[]
    grades: Record<string, number | string>
    courseSelections: Record<string, string>
    toggleCourse: (courseId: string) => void
    toggleMathCredits: () => void
    setGrade: (courseId: string, grade: number | string | "") => void
    setCourseSelection: (courseId: string, selection: string) => void
}

export function MandatoryArea({
    mandatoryProgress,
    completedMandatoryCredits,
    totalMandatoryCredits,
    courses,
    completedCourses,
    mathCredits,
    electiveCourses,
    topGradedAreas,
    grades,
    courseSelections,
    toggleCourse,
    toggleMathCredits,
    setGrade,
    setCourseSelection
}: MandatoryAreaProps) {
    return (
        <div className="bg-lime-50 p-6 rounded-lg border border-green-200">
            <h1 className="text-xl font-semibold text-center mb-4">Mandatory Area (72 or 75 ECTS)</h1>
            <div className="space-y-2 mb-6">
                <Progress value={mandatoryProgress} className="h-2" />
                <p className="text-sm text-center text-gray-600">
                    {completedMandatoryCredits} of {totalMandatoryCredits} ECTS completed ({Math.round(mandatoryProgress)}%)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => {
                    let isUsedInGrading = false;

                    if (course.id === "stats") {
                        isUsedInGrading = true;
                    }

                    if (course.id === "math") {
                        const mathElectives = electiveCourses.filter(course => course.area === "math");
                        isUsedInGrading = mathElectives.length > 0 && mathCredits === 9;
                    }

                    if (course.id === "cs") {
                        const csElectives = electiveCourses.filter(course => course.area === "cs");
                        isUsedInGrading = csElectives.length > 0;
                    }

                    if (["ai", "philosophy", "psychology"].includes(course.category)) {
                        isUsedInGrading = topGradedAreas.includes(course.category);
                    }

                    if (course.id === "cog") {
                        isUsedInGrading = false;
                    }

                    return (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isCompleted={completedCourses.includes(course.id)}
                            mathCredits={mathCredits}
                            isUsedInGrading={isUsedInGrading}
                            grade={grades[course.id]}
                            selectedCourse={courseSelections[course.id]}
                            onToggleCourse={toggleCourse}
                            onToggleMathCredits={toggleMathCredits}
                            onSetGrade={setGrade}
                            onSetCourseSelection={setCourseSelection}
                        />
                    );
                })}
            </div>
        </div>
    )
} 