import { Progress } from "@/components/ui/progress"

interface OverallProgressProps {
    overallProgress: number
    totalCompletedCredits: number
    totalRequiredCredits: number
    currentWeightedGrade: number | null
}

export function OverallProgress({
    overallProgress,
    totalCompletedCredits,
    totalRequiredCredits,
    currentWeightedGrade,
}: OverallProgressProps) {
    return (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border border-purple-200">
            <h1 className="text-2xl font-bold text-center mb-4">Overall Progress</h1>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-lg text-center mt-2">
                {totalCompletedCredits} of {totalRequiredCredits} ECTS completed ({Math.round(overallProgress)}%)
            </p>
            {currentWeightedGrade && (
                <p className="text-lg text-center mt-2 font-semibold">
                    Weighted Grade Average: {currentWeightedGrade}
                </p>
            )}
        </div>
    )
} 