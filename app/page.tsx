"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Course {
  id: string
  name: string
  credits: number
  category: "foundation" | "neuro" | "philosophy" | "biology"
  required?: boolean
  options?: number
  totalInGroup?: number
}

const courses: Course[] = [
  { id: "cog", name: "Foundation of Cognitive Science", credits: 3, category: "foundation", required: true },
  { id: "stats", name: "Intro to Statistics and Data Analysis", credits: 8, category: "foundation", required: true },
  { id: "cs", name: "Introduction to Computer Science", credits: 9, category: "foundation", required: true },
  { id: "math", name: "Intro to Mathematics", credits: 9, category: "foundation", required: true },
  { id: "neuroinfo", name: "Introduction to Neuroinformatics", credits: 8, category: "neuro", required: true },
  {
    id: "ai",
    name: "Introduction to Cognition in Artificial Systems",
    credits: 8,
    category: "neuro",
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
    category: "biology",
    options: 2,
    totalInGroup: 3,
  },
  {
    id: "neurosci2",
    name: "Introduction to Neuroscience II",
    credits: 4,
    category: "biology",
    options: 2,
    totalInGroup: 3,
  },
  {
    id: "biosys1",
    name: "Introduction to Cognition in Biological Systems I",
    credits: 4,
    category: "biology",
    options: 2,
    totalInGroup: 3,
  },
  {
    id: "biosys2",
    name: "Introduction to Cognition in Biological Systems II",
    credits: 4,
    category: "biology",
    options: 2,
    totalInGroup: 3,
  },
]

interface ElectiveCourse {
  id: string
  name: string
  credits: number
  area: "ai" | "ethics" | "psychology"
}

interface FreeElectiveCourse {
  id: string
  name: string
  credits: number
}

const areaNames = {
  ai: "Artificial Intelligence and Machine Learning",
  ethics: "Mind, Ethics, and Society",
  psychology: "Psychology, Communication, Neuroscience, and Behavior",
}

const getCategoryColor = (category: Course["category"]) => {
  switch (category) {
    case "foundation":
      return "border-purple-500"
    case "neuro":
      return "border-blue-500"
    case "philosophy":
      return "border-green-500"
    case "biology":
      return "border-yellow-500"
    default:
      return ""
  }
}

export default function CourseTracker() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [electiveCourses, setElectiveCourses] = useState<ElectiveCourse[]>([])
  const [freeElectiveCourses, setFreeElectiveCourses] = useState<FreeElectiveCourse[]>([])
  const [newCourse, setNewCourse] = useState({ name: "", credits: "", area: "ai" } as const)
  const [newFreeElective, setNewFreeElective] = useState({ name: "", credits: "" } as const)

  const toggleCourse = (courseId: string) => {
    setCompletedCourses((prev) => {
      const newCompletedCourses = prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
      localStorage.setItem("completedCourses", JSON.stringify(newCompletedCourses))
      return newCompletedCourses
    })
  }

  const calculateAreaProgress = (area: "ai" | "ethics" | "psychology") => {
    return electiveCourses.filter((course) => course.area === area).reduce((sum, course) => sum + course.credits, 0)
  }

  useEffect(() => {
    const savedCompletedCourses = localStorage.getItem("completedCourses")
    const savedElectiveCourses = localStorage.getItem("electiveCourses")
    const savedFreeElectiveCourses = localStorage.getItem("freeElectiveCourses")

    if (savedCompletedCourses) setCompletedCourses(JSON.parse(savedCompletedCourses))
    if (savedElectiveCourses) setElectiveCourses(JSON.parse(savedElectiveCourses))
    if (savedFreeElectiveCourses) setFreeElectiveCourses(JSON.parse(savedFreeElectiveCourses))
  }, [])

  const totalMandatoryCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const completedMandatoryCredits = courses
    .filter((course) => completedCourses.includes(course.id))
    .reduce((sum, course) => sum + course.credits, 0)
  const mandatoryProgress = (completedMandatoryCredits / totalMandatoryCredits) * 100

  const totalElectiveCredits = electiveCourses.reduce((sum, course) => sum + course.credits, 0)
  const electiveProgress = (totalElectiveCredits / 60) * 100

  const totalFreeElectiveCredits = freeElectiveCourses.reduce((sum, course) => sum + course.credits, 0)
  const freeElectiveProgress = (totalFreeElectiveCredits / 30) * 100

  const totalCompletedCredits = completedMandatoryCredits + totalElectiveCredits + totalFreeElectiveCredits
  const totalRequiredCredits = totalMandatoryCredits + 60 + 30 // 60 for mandatory electives and 30 for free electives
  const overallProgress = (totalCompletedCredits / totalRequiredCredits) * 100

  const addElectiveCourse = () => {
    if (newCourse.name && newCourse.credits) {
      const newCredits = Number.parseInt(newCourse.credits)
      const areaCredits = calculateAreaProgress(newCourse.area as "ai" | "ethics" | "psychology")
      
      if (areaCredits + newCredits > 48) {
        alert(`Cannot add course. Maximum of 48 ECTS credits allowed per area. Current credits in ${areaNames[newCourse.area]}: ${areaCredits}`)
        return
      }

      setElectiveCourses((prev) => {
        const newElectiveCourses = [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: newCourse.name,
            credits: newCredits,
            area: newCourse.area as "ai" | "ethics" | "psychology",
          },
        ]
        localStorage.setItem("electiveCourses", JSON.stringify(newElectiveCourses))
        return newElectiveCourses
      })
      setNewCourse({ name: "", credits: "", area: "ai" })
    }
  }

  const addFreeElectiveCourse = () => {
    if (newFreeElective.name && newFreeElective.credits) {
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
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border border-purple-200">
        <h1 className="text-2xl font-bold text-center mb-4">Overall Progress</h1>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-lg text-center mt-2">
          {totalCompletedCredits} of {totalRequiredCredits} ECTS completed ({Math.round(overallProgress)}%)
        </p>
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
            className={`p-4 border-2 ${getCategoryColor(course.category)} cursor-pointer`}
            onClick={() => toggleCourse(course.id)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={course.id}
                checked={completedCourses.includes(course.id)}
                onCheckedChange={() => toggleCourse(course.id)}
              />
              <div className="space-y-1">
                <label
                  htmlFor={course.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {course.name}
                </label>
                <p className="text-sm text-gray-500">
                  {course.credits} ECTS
                  {course.options && ` (${course.options} out of ${course.totalInGroup} courses)`}
                </p>
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
          {(Object.keys(areaNames) as Array<"ai" | "ethics" | "psychology">).map((area) => (
            <div key={area} className="space-y-2">
              <h3 className="font-medium">{areaNames[area]}</h3>
              <Progress value={(calculateAreaProgress(area) / 48) * 100} className="h-2" />
              <p className="text-sm text-gray-600">
                {calculateAreaProgress(area)} of 48 ECTS completed 
                {calculateAreaProgress(area) > 0 && ` (${Math.round((calculateAreaProgress(area) / 48) * 100)}%)`}
              </p>
              <div className="space-y-2">
                {electiveCourses
                  .filter((course) => course.area === area)
                  .map((course) => (
                    <div key={course.id} className="flex justify-between items-center bg-white p-2 rounded">
                      <span>{course.name}</span>
                      <span>{course.credits} ECTS</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
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
              onValueChange={(value) => setNewCourse({ ...newCourse, area: value as "ai" | "ethics" | "psychology" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai" id="ai" />
                <Label htmlFor="ai">AI & ML</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ethics" id="ethics" />
                <Label htmlFor="ethics">Ethics & Society</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="psychology" id="psychology" />
                <Label htmlFor="psychology">Psychology & Neuroscience</Label>
              </div>
            </RadioGroup>
            <Button onClick={addElectiveCourse}>Add Elective Course</Button>
          </div>
        </div>
      </div>

      <div className="bg-green-100 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold text-center mb-4">Free Electives (30 ECTS possible)</h2>
        <div className="space-y-2">
          <Progress value={freeElectiveProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {totalFreeElectiveCredits} of 30 ECTS completed ({Math.round(freeElectiveProgress)}%)
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {freeElectiveCourses.map((course) => (
            <div key={course.id} className="flex justify-between items-center bg-white p-2 rounded">
              <span>{course.name}</span>
              <span>{course.credits} ECTS</span>
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

