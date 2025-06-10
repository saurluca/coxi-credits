import { useState, useEffect } from "react"
import { ElectiveCourse, FreeElectiveCourse, Course } from "@/app/types"
import { areaNames, courses } from "@/app/constants"

export function useCourseTracker() {
    const [completedCourses, setCompletedCourses] = useState<string[]>([])
    const [electiveCourses, setElectiveCourses] = useState<ElectiveCourse[]>([])
    const [freeElectiveCourses, setFreeElectiveCourses] = useState<FreeElectiveCourse[]>([])
    const [mathCredits, setMathCredits] = useState<number>(9)
    const [topGradedAreas, setTopGradedAreas] = useState<string[]>([])
    const [newCourse, setNewCourse] = useState<{
        name: string;
        credits: string;
        area: keyof typeof areaNames;
        grade?: string;
    }>({ name: "", credits: "", area: "ai" })
    const [newFreeElective, setNewFreeElective] = useState({ name: "", credits: "" })
    const [grades, setGrades] = useState<Record<string, number | string>>({})

    const toggleCourse = (courseId: string) => {
        setCompletedCourses((prev) => {
            const newCompletedCourses = prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
            localStorage.setItem("completedCourses", JSON.stringify(newCompletedCourses))
            return newCompletedCourses
        })
    }

    const calculateAreaProgress = (area: keyof typeof areaNames) => {
        if (area === "foundation") return 0;
        return electiveCourses.filter((course) => course.area === area).reduce((sum, course) => sum + course.credits, 0)
    }

    const setGrade = (courseId: string, grade: number | string | "") => {
        console.log(`Grade for ${courseId} changed to:`, grade);

        setGrades(prev => {
            const newGrades = { ...prev }
            if (grade === "" || grade === "-" || (typeof grade === 'number' && isNaN(grade))) {
                delete newGrades[courseId]
            } else if (typeof grade === 'number' && grade >= 1.0 && grade <= 5.0) {
                newGrades[courseId] = grade
            }
            localStorage.setItem("grades", JSON.stringify(newGrades))
            return newGrades
        })
    }

    const addElectiveCourse = () => {
        if (!newCourse.name || !newCourse.credits) {
            if (!newCourse.name) {
                alert("Please enter a course name")
            } else if (!newCourse.credits) {
                alert("Please enter the number of credits")
            }
            return
        }

        const newCredits = Number.parseInt(newCourse.credits)

        if (newCredits < 1 || newCredits > 30) {
            alert("Credits must be between 1 and 30")
            return
        }

        const areaCredits = calculateAreaProgress(newCourse.area as keyof typeof areaNames)

        let maxCredits;
        switch (newCourse.area) {
            case "foundation":
                maxCredits = 4;
                break;
            case "cs":
            case "math":
                maxCredits = 9;
                break;
            default:
                maxCredits = 48;
        }

        if (areaCredits + newCredits > maxCredits) {
            alert(`Cannot add course. Maximum of ${maxCredits} ECTS credits allowed for ${areaNames[newCourse.area]}. Current credits: ${areaCredits}`)
            return
        }

        const courseId = crypto.randomUUID();

        setElectiveCourses((prev) => {
            const newElectiveCourses = [
                ...prev,
                {
                    id: courseId,
                    name: newCourse.name,
                    credits: newCredits,
                    area: newCourse.area as keyof typeof areaNames,
                },
            ]
            localStorage.setItem("electiveCourses", JSON.stringify(newElectiveCourses))
            return newElectiveCourses
        })

        if (newCourse.grade && newCourse.grade !== "-") {
            setGrades(prev => {
                const newGrades = { ...prev };
                newGrades[courseId] = parseFloat(newCourse.grade!);
                localStorage.setItem("grades", JSON.stringify(newGrades));
                return newGrades;
            });
        }

        setNewCourse({ name: "", credits: "", area: "ai" })
    }

    const addFreeElectiveCourse = () => {
        if (!newFreeElective.name || !newFreeElective.credits) {
            if (!newFreeElective.name) {
                alert("Please enter a course name")
            } else if (!newFreeElective.credits) {
                alert("Please enter the number of credits")
            }
            return
        }

        const newCredits = Number.parseInt(newFreeElective.credits)

        if (newCredits < 1 || newCredits > 30) {
            alert("Credits must be between 1 and 30")
            return
        }

        setFreeElectiveCourses((prev) => {
            const newFreeElectiveCourses = [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    name: newFreeElective.name,
                    credits: newCredits,
                },
            ]
            localStorage.setItem("freeElectiveCourses", JSON.stringify(newFreeElectiveCourses))
            return newFreeElectiveCourses
        })
        setNewFreeElective({ name: "", credits: "" })
    }

    const removeElectiveCourse = (courseId: string) => {
        setElectiveCourses((prev) => {
            const newElectiveCourses = prev.filter((course) => course.id !== courseId)
            localStorage.setItem("electiveCourses", JSON.stringify(newElectiveCourses))
            return newElectiveCourses
        })
        setGrades((prev) => {
            const newGrades = { ...prev }
            delete newGrades[courseId]
            localStorage.setItem("grades", JSON.stringify(newGrades))
            return newGrades
        })
    }

    const removeFreeElectiveCourse = (courseId: string) => {
        setFreeElectiveCourses((prev) => {
            const newFreeElectiveCourses = prev.filter((course) => course.id !== courseId)
            localStorage.setItem("freeElectiveCourses", JSON.stringify(newFreeElectiveCourses))
            return newFreeElectiveCourses
        })
    }

    const toggleMathCredits = () => {
        setMathCredits((prev) => {
            const newCredits = prev === 9 ? 6 : 9
            localStorage.setItem("mathCredits", JSON.stringify(newCredits))

            if (newCredits === 6) {
                setGrades(prevGrades => {
                    const newGrades = { ...prevGrades }
                    delete newGrades["math"]
                    localStorage.setItem("grades", JSON.stringify(newGrades))
                    return newGrades
                })
            }

            return newCredits
        })
    }

    const calculateWeightedGrade = () => {
        console.time("calculateWeightedGrade");
        let weightedSum = 0;
        let totalCredits = 0;

        electiveCourses.forEach(course => {
            if (grades[course.id] && grades[course.id] !== "-") {
                const grade = grades[course.id];
                if (typeof grade === 'number') {
                    weightedSum += course.credits * grade;
                    totalCredits += course.credits;
                }
            }
        });

        const areaCredits = {
            ai: calculateAreaProgress("ai"),
            philosophy: calculateAreaProgress("philosophy"),
            psychology: calculateAreaProgress("psychology")
        };

        const topAreas = Object.entries(areaCredits)
            .sort(([, creditsA], [, creditsB]) => creditsB - creditsA)
            .slice(0, 2)
            .map(([area]) => area);

        const statsCourse = courses.find(c => c.id === "stats");
        if (statsCourse && grades[statsCourse.id] && grades[statsCourse.id] !== "-") {
            const grade = grades[statsCourse.id];
            if (typeof grade === 'number') {
                weightedSum += statsCourse.credits * grade;
                totalCredits += statsCourse.credits;
            }
        }

        const mathElectives = electiveCourses.filter(course => course.area === "math");
        const mathCourse = courses.find(c => c.id === "math");
        if (mathElectives.length > 0 && mathCourse && grades[mathCourse.id] && grades[mathCourse.id] !== "-" && mathCredits === 9) {
            const grade = grades[mathCourse.id];
            if (typeof grade === 'number') {
                weightedSum += mathCredits * grade;
                totalCredits += mathCredits;
            }
        }

        const csElectives = electiveCourses.filter(course => course.area === "cs");
        const csCourse = courses.find(c => c.id === "cs");
        if (csElectives.length > 0 && csCourse && grades[csCourse.id] && grades[csCourse.id] !== "-") {
            const grade = grades[csCourse.id];
            if (typeof grade === 'number') {
                weightedSum += csCourse.credits * grade;
                totalCredits += csCourse.credits;
            }
        }

        const categoryMapping = {
            ai: ["ai"],
            philosophy: ["philosophy"],
            psychology: ["psychology"],
            cs: ["cs"],
            math: ["math"],
            foundation: ["foundation"]
        }

        courses
            .filter(course =>
                topAreas.some(area => categoryMapping[area as keyof typeof categoryMapping]?.includes(course.category)) &&
                grades[course.id] && grades[course.id] !== "-" &&
                course.id !== "cog"
            )
            .forEach(course => {
                const grade = grades[course.id];
                if (typeof grade === 'number') {
                    weightedSum += course.credits * grade;
                    totalCredits += course.credits;
                }
            });

        const result = totalCredits > 0
            ? Number((weightedSum / totalCredits).toFixed(2))
            : null;
        console.timeEnd("calculateWeightedGrade");
        return result;
    }

    useEffect(() => {
        const savedCompletedCourses = localStorage.getItem("completedCourses")
        const savedElectiveCourses = localStorage.getItem("electiveCourses")
        const savedFreeElectiveCourses = localStorage.getItem("freeElectiveCourses")
        const savedGrades = localStorage.getItem("grades")
        const savedMathCredits = localStorage.getItem("mathCredits")

        if (savedCompletedCourses) setCompletedCourses(JSON.parse(savedCompletedCourses))
        if (savedElectiveCourses) setElectiveCourses(JSON.parse(savedElectiveCourses))
        if (savedFreeElectiveCourses) setFreeElectiveCourses(JSON.parse(savedFreeElectiveCourses))
        if (savedGrades) setGrades(JSON.parse(savedGrades))
        if (savedMathCredits) setMathCredits(JSON.parse(savedMathCredits))

        setTimeout(() => {
            console.log("Debug - All grades:", grades);
        }, 1000);
    }, [])

    useEffect(() => {
        const areaCredits = {
            ai: calculateAreaProgress("ai"),
            philosophy: calculateAreaProgress("philosophy"),
            psychology: calculateAreaProgress("psychology")
        };

        const topAreas = Object.entries(areaCredits)
            .sort(([, creditsA], [, creditsB]) => creditsB - creditsA)
            .slice(0, 2)
            .map(([area]) => area);

        setTopGradedAreas(topAreas);
    }, [electiveCourses]);

    // Calculate progress values
    const totalMandatoryCredits = courses.reduce((sum, course) => {
        if (course.id === "math") {
            return sum + mathCredits
        }
        return sum + course.credits
    }, 0)

    const completedMandatoryCredits = courses
        .filter((course) => completedCourses.includes(course.id))
        .reduce((sum: number, course: Course) => {
            if (course.id === "math") {
                return sum + mathCredits
            }
            return sum + course.credits
        }, 0)

    const mandatoryProgress = (completedMandatoryCredits / totalMandatoryCredits) * 100
    const totalElectiveCredits = electiveCourses.reduce((sum, course) => sum + course.credits, 0)
    const electiveProgress = (totalElectiveCredits / 60) * 100
    const maxFreeElectiveCredits = mathCredits === 6 ? 36 : 33
    const totalFreeElectiveCredits = freeElectiveCourses.reduce((sum, course) => sum + course.credits, 0)
    const freeElectiveProgress = (totalFreeElectiveCredits / maxFreeElectiveCredits) * 100

    const cappedElectiveCredits = Math.min(totalElectiveCredits, 60)
    const cappedFreeElectiveCredits = Math.min(totalFreeElectiveCredits, maxFreeElectiveCredits)
    const totalCompletedCredits = completedMandatoryCredits + cappedElectiveCredits + cappedFreeElectiveCredits
    const totalRequiredCredits = totalMandatoryCredits + 60 + maxFreeElectiveCredits
    const overallProgress = (totalCompletedCredits / totalRequiredCredits) * 100

    return {
        // State
        completedCourses,
        electiveCourses,
        freeElectiveCourses,
        mathCredits,
        topGradedAreas,
        newCourse,
        setNewCourse,
        newFreeElective,
        setNewFreeElective,
        grades,

        // Actions
        toggleCourse,
        calculateAreaProgress,
        setGrade,
        addElectiveCourse,
        addFreeElectiveCourse,
        removeElectiveCourse,
        removeFreeElectiveCourse,
        toggleMathCredits,
        calculateWeightedGrade,

        // Computed values
        totalMandatoryCredits,
        completedMandatoryCredits,
        mandatoryProgress,
        totalElectiveCredits,
        electiveProgress,
        maxFreeElectiveCredits,
        totalFreeElectiveCredits,
        freeElectiveProgress,
        totalCompletedCredits,
        totalRequiredCredits,
        overallProgress
    }
} 