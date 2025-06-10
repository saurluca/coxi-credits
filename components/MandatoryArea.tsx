import { Progress } from "@/components/ui/progress"

interface MandatoryAreaProps {
    mandatoryProgress: number
    completedMandatoryCredits: number
    totalMandatoryCredits: number
}

export function MandatoryArea({
    mandatoryProgress,
    completedMandatoryCredits,
    totalMandatoryCredits
}: MandatoryAreaProps) {
    return (
        <div className="bg-green-100 p-6 rounded-lg border border-green-200">
            <h1 className="text-xl font-semibold text-center mb-2">Mandatory Area (72 or 75 ECTS)</h1>
            <div className="space-y-2">
                <Progress value={mandatoryProgress} className="h-2" />
                <p className="text-sm text-center text-gray-600">
                    {completedMandatoryCredits} of {totalMandatoryCredits} ECTS completed ({Math.round(mandatoryProgress)}%)
                </p>
            </div>
        </div>
    )
} 