import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { FreeElectiveCourse } from "@/app/types"

interface FreeElectivesProps {
    maxFreeElectiveCredits: number
    totalFreeElectiveCredits: number
    freeElectiveProgress: number
    freeElectiveCourses: FreeElectiveCourse[]
    newFreeElective: {
        name: string
        credits: string
    }
    onNewFreeElectiveChange: (field: 'name' | 'credits', value: string) => void
    onAddFreeElective: () => void
    onRemoveFreeElective: (courseId: string) => void
}

export function FreeElectives({
    maxFreeElectiveCredits,
    totalFreeElectiveCredits,
    freeElectiveProgress,
    freeElectiveCourses,
    newFreeElective,
    onNewFreeElectiveChange,
    onAddFreeElective,
    onRemoveFreeElective
}: FreeElectivesProps) {
    return (
        <div className="bg-green-100 p-6 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-center mb-4">Free Electives ({maxFreeElectiveCredits} ECTS possible)</h2>
            <div className="space-y-2">
                <Progress value={freeElectiveProgress} className="h-2" />
                <p className="text-sm text-center text-gray-600">
                    {totalFreeElectiveCredits} of {maxFreeElectiveCredits} ECTS completed ({Math.round(freeElectiveProgress)}%)
                    {totalFreeElectiveCredits > maxFreeElectiveCredits && (
                        <span className="text-amber-600 font-semibold ml-1">
                            (Only {maxFreeElectiveCredits} ECTS counted toward total)
                        </span>
                    )}
                </p>
            </div>

            <div className="mt-4 space-y-2">
                {freeElectiveCourses.map((course) => (
                    <div key={course.id} className="flex justify-between items-center bg-white p-2 rounded">
                        <span>{course.name}</span>
                        <div className="flex items-center gap-2">
                            <span>{course.credits} ECTS</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onRemoveFreeElective(course.id)}
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 space-y-2">
                <h3 className="font-medium">Add New Free Elective Course</h3>
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder="Course Name"
                        value={newFreeElective.name}
                        onChange={(e) => onNewFreeElectiveChange('name', e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Credits"
                        value={newFreeElective.credits}
                        onChange={(e) => onNewFreeElectiveChange('credits', e.target.value)}
                    />
                    <Button onClick={onAddFreeElective}>Add Free Elective Course</Button>
                </div>
            </div>
        </div>
    )
} 