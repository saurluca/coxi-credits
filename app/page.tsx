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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Course, ElectiveCourse, FreeElectiveCourse } from "./types"
import { areaNames, courses, validGrades } from "./constants"
import { getCategoryColor } from "./utils/colors"

export default function CourseTracker() {
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

    // Add debugging for the Select components once mounted
    setTimeout(() => {
      console.log("Debug - All grades:", grades);
    }, 1000);
  }, [])

  const totalMandatoryCredits = courses.reduce((sum, course) => {
    // Special handling for math course
    if (course.id === "math") {
      return sum + mathCredits
    }
    return sum + course.credits
  }, 0)
  const completedMandatoryCredits = courses
    .filter((course) => completedCourses.includes(course.id))
    .reduce((sum: number, course: Course) => {
      // Special handling for math course
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

  // Cap the credits used in the total calculation to their maximum values
  const cappedElectiveCredits = Math.min(totalElectiveCredits, 60)
  const cappedFreeElectiveCredits = Math.min(totalFreeElectiveCredits, maxFreeElectiveCredits)

  const totalCompletedCredits = completedMandatoryCredits + cappedElectiveCredits + cappedFreeElectiveCredits
  const totalRequiredCredits = totalMandatoryCredits + 60 + maxFreeElectiveCredits
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

    // Validate credits are between 1 and 30
    if (newCredits < 1 || newCredits > 30) {
      alert("Credits must be between 1 and 30")
      return
    }

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

    // Set the grade if provided
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

    // Validate credits are between 1 and 30
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
    console.time("calculateWeightedGrade");
    let weightedSum = 0;
    let totalCredits = 0;

    // Step 1: Include all elective courses in the grade calculation
    electiveCourses.forEach(course => {
      if (grades[course.id] && grades[course.id] !== "-") {
        const grade = grades[course.id];
        if (typeof grade === 'number') {
          weightedSum += course.credits * grade;
          totalCredits += course.credits;
        }
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

    // Remove the state update from here
    // setTopGradedAreas(topAreas);

    // Step 3: Handle mandatory courses according to rules

    // Always include Statistics
    const statsCourse = courses.find(c => c.id === "stats");
    if (statsCourse && grades[statsCourse.id] && grades[statsCourse.id] !== "-") {
      const grade = grades[statsCourse.id];
      if (typeof grade === 'number') {
        weightedSum += statsCourse.credits * grade;
        totalCredits += statsCourse.credits;
      }
    }

    // Include Math only if a second math course is taken in electives and it's the 9-credit version
    const mathElectives = electiveCourses.filter(course => course.area === "math");
    const mathCourse = courses.find(c => c.id === "math");
    if (mathElectives.length > 0 && mathCourse && grades[mathCourse.id] && grades[mathCourse.id] !== "-" && mathCredits === 9) {
      const grade = grades[mathCourse.id];
      if (typeof grade === 'number') {
        weightedSum += mathCredits * grade;
        totalCredits += mathCredits;
      }
    }

    // Include CS only if a second CS course is taken in electives
    const csElectives = electiveCourses.filter(course => course.area === "cs");
    const csCourse = courses.find(c => c.id === "cs");
    if (csElectives.length > 0 && csCourse && grades[csCourse.id] && grades[csCourse.id] !== "-") {
      const grade = grades[csCourse.id];
      if (typeof grade === 'number') {
        weightedSum += csCourse.credits * grade;
        totalCredits += csCourse.credits;
      }
    }

    // For AI, Psychology, Philosophy: only include mandatory courses from top 2 areas
    courses
      .filter(course =>
        // Match course category with top areas
        topAreas.some(area => categoryMapping[area as keyof typeof categoryMapping]?.includes(course.category)) &&
        // Has a grade
        grades[course.id] && grades[course.id] !== "-" &&
        // Not Foundation of Cognitive Science (which never has a grade)
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

  const toggleMathCredits = () => {
    setMathCredits((prev) => {
      const newCredits = prev === 9 ? 6 : 9
      localStorage.setItem("mathCredits", JSON.stringify(newCredits))

      // If switching to 6 credits, remove the grade
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

  // Add logging to track input changes
  const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.time("courseNameUpdate");
    const newValue = e.target.value;
    console.log("Course name changing to:", newValue);
    setNewCourse({ ...newCourse, name: newValue });
    console.timeEnd("courseNameUpdate");
  }

  const handleCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.time("creditsUpdate");
    const newValue = e.target.value;
    console.log("Credits changing to:", newValue);
    setNewCourse({ ...newCourse, credits: newValue });
    console.timeEnd("creditsUpdate");
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.time("gradeUpdate");
    const newValue = e.target.value;
    console.log("Grade changing to:", newValue);
    setNewCourse({ ...newCourse, grade: newValue });
    console.timeEnd("gradeUpdate");
  }

  // Wrap render in logging
  console.time("renderTime");

  // Calculate the weighted grade once before rendering
  const currentWeightedGrade = calculateWeightedGrade();

  // Add a useEffect to update topGradedAreas when relevant data changes
  useEffect(() => {
    // Calculate which areas have the most credits in electives
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

    // Update the state
    setTopGradedAreas(topAreas);
  }, [electiveCourses]); // Only re-run when electiveCourses changes

  // Function to determine if an area is included in grading
  const isAreaIncludedInGrading = (area: keyof typeof areaNames) => {
    // For AI, Philosophy, Psychology: only included if in top 2 areas
    if (area === "ai" || area === "philosophy" || area === "psychology") {
      return topGradedAreas.includes(area);
    }

    // For CS: included if there are CS electives
    if (area === "cs") {
      const csElectives = electiveCourses.filter(course => course.area === "cs");
      return csElectives.length > 0;
    }

    // For Math: included if there are math electives and mathCredits is 9
    if (area === "math") {
      const mathElectives = electiveCourses.filter(course => course.area === "math");
      return mathElectives.length > 0 && mathCredits === 9;
    }

    // For Foundation: never included
    if (area === "foundation") {
      return false;
    }

    return false;
  };

  const result = (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
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
        {courses.map((course) => {
          // Determine if this course is used in grading
          let isUsedInGrading = false;

          // Statistics is always used in grading
          if (course.id === "stats") {
            isUsedInGrading = true;
          }

          // Math is used in grading if a second math course is taken in electives and it's the 9-credit version
          if (course.id === "math") {
            const mathElectives = electiveCourses.filter(course => course.area === "math");
            isUsedInGrading = mathElectives.length > 0 && mathCredits === 9;
          }

          // CS is used in grading if a second CS course is taken in electives
          if (course.id === "cs") {
            const csElectives = electiveCourses.filter(course => course.area === "cs");
            isUsedInGrading = csElectives.length > 0;
          }

          // For AI, Psychology, Philosophy: only used if in top 2 areas
          if (["ai", "philosophy", "psychology"].includes(course.category)) {
            isUsedInGrading = topGradedAreas.includes(course.category);
          }

          // Foundation of Cognitive Science is never used in grading
          if (course.id === "cog") {
            isUsedInGrading = false;
          }

          return (
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
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <label htmlFor={course.id} className="text-sm font-medium leading-none">
                      {course.name}
                    </label>
                    {isUsedInGrading ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 mx-1">
                        Included
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 mx-1">
                        Excluded
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {course.id === "math" ? mathCredits : course.credits} ECTS
                    {course.options && ` (${course.options} out of ${course.totalInGroup} courses)`}
                  </p>
                  {course.id === "math" && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div
                        onClick={toggleMathCredits}
                        className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${mathCredits === 9 ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
                          }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                      </div>
                      <span className="text-xs text-gray-600">{mathCredits === 9 ? "9 ECTS" : "6 ECTS"}</span>
                    </div>
                  )}
                  {completedCourses.includes(course.id) && (
                    (course.id !== "cog" && !(course.id === "math" && mathCredits === 6)) && (
                      <Select
                        value={grades[course.id]?.toString() || "-"}
                        onValueChange={(value: string) => setGrade(course.id, value === "-" ? value : parseFloat(value))}
                      >
                        <SelectTrigger className="w-full mt-2">
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
                    )
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="bg-gray-100 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-center mb-4">Mandatory Electives (60 ECTS required)</h2>
        <div className="space-y-2">
          <Progress value={electiveProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {totalElectiveCredits} of 60 ECTS completed ({Math.round(electiveProgress)}%)
            {totalElectiveCredits > 60 && (
              <span className="text-amber-600 font-semibold ml-1">
                (Only 60 ECTS counted toward total)
              </span>
            )}
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {(Object.keys(areaNames) as Array<keyof typeof areaNames>).map((area) => {
            // Calculate max credits and progress based on area
            const maxCredits = area === "foundation" ? 4 : area === "cs" || area === "math" ? 9 : 48;
            const areaProgress = calculateAreaProgress(area);
            const progressPercentage = (areaProgress / maxCredits) * 100;
            const isGradedArea = isAreaIncludedInGrading(area);

            return (
              <div key={area} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{areaNames[area]}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full mx-1 ${isGradedArea ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                    {isGradedArea ? "Included" : "Excluded"}
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
                            onValueChange={(value: string) => setGrade(course.id, value === "-" ? value : parseFloat(value))}
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
          <h3 className="font-medium">Add New Mandatory Elective Course</h3>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Course Name"
              value={newCourse.name}
              onChange={handleCourseNameChange}
            />
            <Input
              type="number"
              placeholder="Credits"
              value={newCourse.credits}
              onChange={handleCreditsChange}
            />
            <select
              className="w-full p-2 border rounded-md bg-white"
              value={newCourse.grade || "-"}
              onChange={handleGradeChange}
            >
              {validGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <RadioGroup
              value={newCourse.area}
              onValueChange={(value) => setNewCourse({ ...newCourse, area: value as keyof typeof areaNames })}
              className="gap-2"
            >
              <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("ai")}`}
                onClick={() => setNewCourse({ ...newCourse, area: "ai" })}>
                <RadioGroupItem value="ai" id="ai" />
                <Label className="flex-grow cursor-pointer">
                  Artificial Intelligence and Machine Learning
                </Label>
              </div>
              <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("philosophy")}`}
                onClick={() => setNewCourse({ ...newCourse, area: "philosophy" })}>
                <RadioGroupItem value="philosophy" id="philosophy" />
                <Label className="flex-grow cursor-pointer">
                  Mind, Ethics, and Society
                </Label>
              </div>
              <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("psychology")}`}
                onClick={() => setNewCourse({ ...newCourse, area: "psychology" })}>
                <RadioGroupItem value="psychology" id="psychology" />
                <Label className="flex-grow cursor-pointer">
                  Psychology, Communication, Neuroscience, and Behavior
                </Label>
              </div>
              <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("cs")}`}
                onClick={() => setNewCourse({ ...newCourse, area: "cs" })}>
                <RadioGroupItem value="cs" id="cs" />
                <Label className="flex-grow cursor-pointer">
                  Computer Science
                </Label>
              </div>
              <div className={`flex items-center space-x-2 rounded-md border-2 p-2 cursor-pointer hover:bg-gray-100 ${getCategoryColor("math")}`}
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
                  onClick={() => removeFreeElectiveCourse(course.id)}
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
      <footer className="mt-12 py-4 border-t text-center text-sm text-gray-500">
        <p>Created by Luca Saur • Email: mail@lucasaur • <a href="https://github.com/saurluca/coxi-credits" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub</a></p>
      </footer>
    </div>
  );
  console.timeEnd("renderTime");
  return result;
}

