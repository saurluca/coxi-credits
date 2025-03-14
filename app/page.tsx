"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

interface Course {
  id: string
  name: string
  credits: number
  category: "foundation" | "cs" | "math" | "ai" | "philosophy" | "psychology"
  required?: boolean
  options?: number
  totalInGroup?: number
  grade?: number
}

const courses: Course[] = [
  { id: "cog", name: "Foundation of Cognitive Science", credits: 3, category: "foundation", required: true },
  { id: "stats", name: "Intro to Statistics and Data Analysis", credits: 8, category: "foundation", required: true },
  { id: "cs", name: "Introduction to Computer Science", credits: 9, category: "cs", required: true },
  { id: "math", name: "Intro to Mathematics", credits: 9, category: "math", required: true },
  { id: "neuroinfo", name: "Introduction to Neuroinformatics", credits: 8, category: "ai", required: true },
  {
    id: "ai",
    name: "Introduction to Cognition in Artificial Systems",
    credits: 8,
    category: "ai",
    options: 1,
    totalInGroup: 2,
  },
  {
    id: "logic",
    name: "Introduction to Logic and Critical Thinking",
    credits: 6,
    category: "philosophy",
    required: true,
  },
  { id: "phil", name: "Introduction to Philosophy for CogSci", credits: 4, category: "philosophy", required: true },
  { id: "ethics", name: "Introduction to the Ethics of AI", credits: 4, category: "philosophy", required: true },
  {
    id: "neurosci1",
    name: "Introduction to Neuroscience I",
    credits: 4,
    category: "psychology",
    options: 2,
    totalInGroup: 3,
  },
  {
    id: "neurosci2",
    name: "Introduction to Neuroscience II",
    credits: 4,
    category: "psychology",
    options: 2,
    totalInGroup: 3,
  },
  {
    id: "biosys1",
    name: "Introduction to Cognition in Biological Systems I",
    credits: 4,
    category: "psychology",
    options: 2,
    totalInGroup: 3,
  },
  {
    id: "biosys2",
    name: "Introduction to Cognition in Biological Systems II",
    credits: 4,
    category: "psychology",
    options: 2,
    totalInGroup: 3,
  },
]

interface ElectiveCourse {
  id: string
  name: string
  credits: number
  area: keyof typeof areaNames
  grade?: number
}

interface FreeElectiveCourse {
  id: string
  name: string
  credits: number
}

const areaNames = {
  ai: "Artificial Intelligence and Machine Learning",
  philosophy: "Mind, Ethics, and Society",
  psychology: "Psychology, Communication, Neuroscience, and Behavior",
  cs: "Computer Science",
  math: "Mathematics",
  foundation: "Foundation"
}

const getCategoryColor = (category: Course["category"]) => {
  switch (category) {
    case "foundation":
      return "border-purple-500"
    case "ai":
      return "border-blue-500"
    case "philosophy":
      return "border-green-500"
    case "psychology":
      return "border-yellow-500"
    case "cs":
      return "border-orange-500"
    case "math":
      return "border-red-500"
    default:
      return ""
  }
}

export default function CourseTracker() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [electiveCourses, setElectiveCourses] = useState<ElectiveCourse[]>([])
  const [freeElectiveCourses, setFreeElectiveCourses] = useState<FreeElectiveCourse[]>([])
  const [newCourse, setNewCourse] = useState<{
    name: string;
    credits: string;
    area: keyof typeof areaNames;
  }>({ name: "", credits: "", area: "ai" })
  const [newFreeElective, setNewFreeElective] = useState({ name: "", credits: "" })
  const [grades, setGrades] = useState<Record<string, number>>({})

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

  useEffect(() => {
    const savedCompletedCourses = localStorage.getItem("completedCourses")
    const savedElectiveCourses = localStorage.getItem("electiveCourses")
    const savedFreeElectiveCourses = localStorage.getItem("freeElectiveCourses")
    const savedGrades = localStorage.getItem("grades")

    if (savedCompletedCourses) setCompletedCourses(JSON.parse(savedCompletedCourses))
    if (savedElectiveCourses) setElectiveCourses(JSON.parse(savedElectiveCourses))
    if (savedFreeElectiveCourses) setFreeElectiveCourses(JSON.parse(savedFreeElectiveCourses))
    if (savedGrades) setGrades(JSON.parse(savedGrades))
  }, [])

  const totalMandatoryCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const completedMandatoryCredits = courses
    .filter((course) => completedCourses.includes(course.id))
    .reduce((sum, course) => sum + course.credits, 0)
  const mandatoryProgress = (completedMandatoryCredits / totalMandatoryCredits) * 100

  const totalElectiveCredits = electiveCourses.reduce((sum, course) => sum + course.credits, 0)
  const electiveProgress = (totalElectiveCredits / 60) * 100

  const totalFreeElectiveCredits = freeElectiveCourses.reduce((sum, course) => sum + course.credits, 0)
  const freeElectiveProgress = (totalFreeElectiveCredits / 33) * 100

  const totalCompletedCredits = completedMandatoryCredits + totalElectiveCredits + totalFreeElectiveCredits
  const totalRequiredCredits = totalMandatoryCredits + 60 + 33 // 60 for mandatory electives and 33 for free electives
  const overallProgress = (totalCompletedCredits / totalRequiredCredits) * 100

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
    const areaCredits = calculateAreaProgress(newCourse.area as keyof typeof areaNames)

    // Check credit limits based on area
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

    setElectiveCourses((prev) => {
      const newElectiveCourses = [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newCourse.name,
          credits: newCredits,
          area: newCourse.area as keyof typeof areaNames,
        },
      ]
      localStorage.setItem("electiveCourses", JSON.stringify(newElectiveCourses))
      return newElectiveCourses
    })
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

    setFreeElectiveCourses((prev) => {
      const newFreeElectiveCourses = [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newFreeElective.name,
          credits: Number.parseInt(newFreeElective.credits),
        },
      ]
      localStorage.setItem("freeElectiveCourses", JSON.stringify(newFreeElectiveCourses))
      return newFreeElectiveCourses
    })
    setNewFreeElective({ name: "", credits: "" })
  }

  const setGrade = (courseId: string, grade: number | "") => {
    setGrades(prev => {
      const newGrades = { ...prev }
      if (grade === "" || isNaN(grade)) {
        delete newGrades[courseId]
      } else if (grade >= 1.0 && grade <= 4.0) {
        newGrades[courseId] = grade
      }
      localStorage.setItem("grades", JSON.stringify(newGrades))
      return newGrades
    })
  }

  // Category mapping for grade calculation
  const categoryMapping = {
    ai: ["ai"],
    philosophy: ["philosophy"],
    psychology: ["psychology"],
    cs: ["cs"],
    math: ["math"],
    foundation: ["foundation"]
  }

  const calculateWeightedGrade = () => {
    let weightedSum = 0;
    let totalCredits = 0;

    // Step 1: Include all elective courses in the grade calculation
    electiveCourses.forEach(course => {
      if (grades[course.id]) {
        weightedSum += course.credits * grades[course.id];
        totalCredits += course.credits;
      }
    });

    // Step 2: Calculate which areas have the most credits in electives
    // (for AI, Philosophy, Psychology categories)
    const areaCredits = {
      ai: calculateAreaProgress("ai"),
      philosophy: calculateAreaProgress("philosophy"),
      psychology: calculateAreaProgress("psychology")
    };

    // Sort areas by credit count to find top 2
    const topAreas = Object.entries(areaCredits)
      .sort(([, creditsA], [, creditsB]) => creditsB - creditsA)
      .slice(0, 2)
      .map(([area]) => area);

    // Step 3: Handle mandatory courses according to rules

    // Always include Statistics
    const statsCourse = courses.find(c => c.id === "stats");
    if (statsCourse && grades[statsCourse.id]) {
      weightedSum += statsCourse.credits * grades[statsCourse.id];
      totalCredits += statsCourse.credits;
    }

    // Include Math only if a second math course is taken in electives
    const mathElectives = electiveCourses.filter(course => course.area === "math");
    const mathCourse = courses.find(c => c.id === "math");
    if (mathElectives.length > 0 && mathCourse && grades[mathCourse.id]) {
      weightedSum += mathCourse.credits * grades[mathCourse.id];
      totalCredits += mathCourse.credits;
    }

    // Include CS only if a second CS course is taken in electives
    const csElectives = electiveCourses.filter(course => course.area === "cs");
    const csCourse = courses.find(c => c.id === "cs");
    if (csElectives.length > 0 && csCourse && grades[csCourse.id]) {
      weightedSum += csCourse.credits * grades[csCourse.id];
      totalCredits += csCourse.credits;
    }

    // For AI, Psychology, Philosophy: only include mandatory courses from top 2 areas
    courses
      .filter(course =>
        // Match course category with top areas
        topAreas.some(area => categoryMapping[area as keyof typeof categoryMapping]?.includes(course.category)) &&
        // Has a grade
        grades[course.id] &&
        // Not Foundation of Cognitive Science (which never has a grade)
        course.id !== "cog"
      )
      .forEach(course => {
        weightedSum += course.credits * grades[course.id];
        totalCredits += course.credits;
      });

    return totalCredits > 0
      ? Number((weightedSum / totalCredits).toFixed(2))
      : null;
  }

  const removeElectiveCourse = (courseId: string) => {
    setElectiveCourses((prev) => {
      const newElectiveCourses = prev.filter((course) => course.id !== courseId)
      localStorage.setItem("electiveCourses", JSON.stringify(newElectiveCourses))
      return newElectiveCourses
    })
    // Also remove the grade when removing the course
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border border-purple-200">
        <h1 className="text-2xl font-bold text-center mb-4">Overall Progress</h1>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-lg text-center mt-2">
          {totalCompletedCredits} of {totalRequiredCredits} ECTS completed ({Math.round(overallProgress)}%)
        </p>
        {calculateWeightedGrade() && (
          <p className="text-lg text-center mt-2 font-semibold">
            Weighted Grade Average: {calculateWeightedGrade()}
          </p>
        )}
      </div>

      <div className="bg-green-100 p-6 rounded-lg border border-green-200">
        <h1 className="text-xl font-semibold text-center mb-2">Mandatory Area (72 or 75 ECTS)</h1>
        <div className="space-y-2">
          <Progress value={mandatoryProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {completedMandatoryCredits} of {totalMandatoryCredits} ECTS completed ({Math.round(mandatoryProgress)}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card
            key={course.id}
            className={`p-4 border-2 ${getCategoryColor(course.category)}`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={course.id}
                checked={completedCourses.includes(course.id)}
                onCheckedChange={() => toggleCourse(course.id)}
              />
              <div className="space-y-1 flex-1">
                <label htmlFor={course.id} className="text-sm font-medium leading-none">
                  {course.name}
                </label>
                <p className="text-sm text-gray-500">
                  {course.credits} ECTS
                  {course.options && ` (${course.options} out of ${course.totalInGroup} courses)`}
                </p>
                {completedCourses.includes(course.id) && (
                  <Input
                    type="number"
                    min="1.0"
                    max="4.0"
                    step="0.1"
                    placeholder="Grade (1.0-4.0)"
                    value={grades[course.id] || ""}
                    onChange={(e) => setGrade(course.id, e.target.value ? parseFloat(e.target.value) : "")}
                    className="mt-2 w-full"
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="bg-blue-100 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-center mb-4">Mandatory Electives (60 ECTS required)</h2>
        <div className="space-y-2">
          <Progress value={electiveProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {totalElectiveCredits} of 60 ECTS completed ({Math.round(electiveProgress)}%)
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {(Object.keys(areaNames) as Array<keyof typeof areaNames>).map((area) => {
            // Calculate max credits and progress based on area
            const maxCredits = area === "cs" || area === "math" ? 9 : 48;
            const areaProgress = calculateAreaProgress(area);
            const progressPercentage = (areaProgress / maxCredits) * 100;

            return (
              <div key={area} className="space-y-2">
                <h3 className="font-medium">{areaNames[area]}</h3>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-gray-600">
                  {areaProgress} of {maxCredits} ECTS completed
                  {areaProgress > 0 && ` (${Math.round(progressPercentage)}%)`}
                </p>
                <div className="space-y-2">
                  {electiveCourses
                    .filter((course) => course.area === area)
                    .map((course) => (
                      <div key={course.id} className="flex justify-between items-center bg-white p-2 rounded">
                        <span>{course.name}</span>
                        <div className="flex items-center gap-2">
                          <span>{course.credits} ECTS</span>
                          <Input
                            type="number"
                            min="1.0"
                            max="4.0"
                            step="0.1"
                            placeholder="Grade"
                            value={grades[course.id] || ""}
                            onChange={(e) => setGrade(course.id, e.target.value ? parseFloat(e.target.value) : "")}
                            className="w-20 font-bold"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeElectiveCourse(course.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="font-medium">Add New Elective Course</h3>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Course Name"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Credits"
              value={newCourse.credits}
              onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
            />
            <RadioGroup
              value={newCourse.area}
              onValueChange={(value) => setNewCourse({ ...newCourse, area: value as keyof typeof areaNames })}
              className="gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setNewCourse({ ...newCourse, area: "ai" })}>
                <RadioGroupItem value="ai" id="ai" />
                <Label className="flex-grow cursor-pointer">
                  Artificial Intelligence and Machine Learning
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setNewCourse({ ...newCourse, area: "philosophy" })}>
                <RadioGroupItem value="philosophy" id="philosophy" />
                <Label className="flex-grow cursor-pointer">
                  Mind, Ethics, and Society
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setNewCourse({ ...newCourse, area: "psychology" })}>
                <RadioGroupItem value="psychology" id="psychology" />
                <Label className="flex-grow cursor-pointer">
                  Psychology, Communication, Neuroscience, and Behavior
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setNewCourse({ ...newCourse, area: "cs" })}>
                <RadioGroupItem value="cs" id="cs" />
                <Label className="flex-grow cursor-pointer">
                  Computer Science
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setNewCourse({ ...newCourse, area: "math" })}>
                <RadioGroupItem value="math" id="math" />
                <Label className="flex-grow cursor-pointer">
                  Mathematics
                </Label>
              </div>
            </RadioGroup>
            <Button onClick={addElectiveCourse}>Add Elective Course</Button>
          </div>
        </div>
      </div>

      <div className="bg-green-100 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold text-center mb-4">Free Electives (33 ECTS possible)</h2>
        <div className="space-y-2">
          <Progress value={freeElectiveProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {totalFreeElectiveCredits} of 33 ECTS completed ({Math.round(freeElectiveProgress)}%)
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
                  onClick={() => removeFreeElectiveCourse(course.id)}
                >
                  Remove
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
              onChange={(e) => setNewFreeElective({ ...newFreeElective, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Credits"
              value={newFreeElective.credits}
              onChange={(e) => setNewFreeElective({ ...newFreeElective, credits: e.target.value })}
            />
            <Button onClick={addFreeElectiveCourse}>Add Free Elective Course</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

