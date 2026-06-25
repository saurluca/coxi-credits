import { useState, useEffect } from "react";
import { ElectiveCourse, FreeElectiveCourse, Course } from "@/app/types";
import {
  areaNames,
  bachelorAreaMaxCredits,
  BACHELOR_MANDATORY_ELECTIVE_CAP,
  courses,
} from "@/app/constants";
import { STORAGE_KEYS } from "@/lib/storage";
import {
  addGradedCoursesToAverage,
  selectBestCoursesForGrading,
  selectCoursesForCreditCap,
  weightedAverage,
} from "@/lib/gradeSelection";

type BachelorArea = keyof typeof areaNames;

export function useCourseTracker() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [electiveCourses, setElectiveCourses] = useState<ElectiveCourse[]>([]);
  const [freeElectiveCourses, setFreeElectiveCourses] = useState<
    FreeElectiveCourse[]
  >([]);
  const [mathCredits, setMathCredits] = useState<number>(9);
  const [topGradedAreas, setTopGradedAreas] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState<{
    name: string;
    credits: string;
    area: keyof typeof areaNames;
    grade?: string;
  }>({ name: "", credits: "", area: "ai" });
  const [newFreeElective, setNewFreeElective] = useState({
    name: "",
    credits: "",
  });
  const [grades, setGrades] = useState<Record<string, number | string>>({});
  const [courseSelections, setCourseSelections] = useState<
    Record<string, string>
  >({});

  const toggleCourse = (courseId: string) => {
    setCompletedCourses((prev) => {
      const newCompletedCourses = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      localStorage.setItem(
        STORAGE_KEYS.bachelor.completedCourses,
        JSON.stringify(newCompletedCourses),
      );
      return newCompletedCourses;
    });
  };

  const calculateAreaTotalCredits = (area: BachelorArea) => {
    if (area === "foundation") return 0;
    return electiveCourses
      .filter((course) => course.area === area)
      .reduce((sum, course) => sum + course.credits, 0);
  };

  const getAreaCountedCourseIds = (area: BachelorArea): Set<string> => {
    if (area === "foundation") return new Set();
    const areaCourses = electiveCourses.filter(
      (course) => course.area === area,
    );
    return selectCoursesForCreditCap(
      areaCourses,
      grades,
      bachelorAreaMaxCredits[area],
    ).selectedIds;
  };

  const calculateAreaProgress = (area: BachelorArea) => {
    if (area === "foundation") return 0;
    const areaCourses = electiveCourses.filter(
      (course) => course.area === area,
    );
    const countedIds = getAreaCountedCourseIds(area);
    return areaCourses
      .filter((course) => countedIds.has(course.id))
      .reduce((sum, course) => sum + course.credits, 0);
  };

  const setGrade = (courseId: string, grade: number | string | "") => {
    setGrades((prev) => {
      const newGrades = { ...prev };
      if (
        grade === "" ||
        grade === "-" ||
        (typeof grade === "number" && isNaN(grade))
      ) {
        delete newGrades[courseId];
      } else if (typeof grade === "number" && grade >= 1.0 && grade <= 5.0) {
        newGrades[courseId] = grade;
      }
      localStorage.setItem(
        STORAGE_KEYS.bachelor.grades,
        JSON.stringify(newGrades),
      );
      return newGrades;
    });
  };

  const addElectiveCourse = () => {
    if (!newCourse.name || !newCourse.credits) {
      if (!newCourse.name) {
        alert("Please enter a course name");
      } else if (!newCourse.credits) {
        alert("Please enter the number of credits");
      }
      return;
    }

    const newCredits = Number.parseInt(newCourse.credits);

    if (newCredits < 1 || newCredits > 30) {
      alert("Credits must be between 1 and 30");
      return;
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
      ];
      localStorage.setItem(
        STORAGE_KEYS.bachelor.electiveCourses,
        JSON.stringify(newElectiveCourses),
      );
      return newElectiveCourses;
    });

    if (newCourse.grade && newCourse.grade !== "-") {
      setGrades((prev) => {
        const newGrades = { ...prev };
        newGrades[courseId] = parseFloat(newCourse.grade!);
        localStorage.setItem(
          STORAGE_KEYS.bachelor.grades,
          JSON.stringify(newGrades),
        );
        return newGrades;
      });
    }

    setNewCourse({ name: "", credits: "", area: "ai" });
  };

  const addFreeElectiveCourse = () => {
    if (!newFreeElective.name || !newFreeElective.credits) {
      if (!newFreeElective.name) {
        alert("Please enter a course name");
      } else if (!newFreeElective.credits) {
        alert("Please enter the number of credits");
      }
      return;
    }

    const newCredits = Number.parseInt(newFreeElective.credits);

    if (newCredits < 1 || newCredits > 30) {
      alert("Credits must be between 1 and 30");
      return;
    }

    setFreeElectiveCourses((prev) => {
      const newFreeElectiveCourses = [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newFreeElective.name,
          credits: newCredits,
        },
      ];
      localStorage.setItem(
        STORAGE_KEYS.bachelor.freeElectiveCourses,
        JSON.stringify(newFreeElectiveCourses),
      );
      return newFreeElectiveCourses;
    });
    setNewFreeElective({ name: "", credits: "" });
  };

  const removeElectiveCourse = (courseId: string) => {
    setElectiveCourses((prev) => {
      const newElectiveCourses = prev.filter(
        (course) => course.id !== courseId,
      );
      localStorage.setItem(
        STORAGE_KEYS.bachelor.electiveCourses,
        JSON.stringify(newElectiveCourses),
      );
      return newElectiveCourses;
    });
    setGrades((prev) => {
      const newGrades = { ...prev };
      delete newGrades[courseId];
      localStorage.setItem(
        STORAGE_KEYS.bachelor.grades,
        JSON.stringify(newGrades),
      );
      return newGrades;
    });
  };

  const removeFreeElectiveCourse = (courseId: string) => {
    setFreeElectiveCourses((prev) => {
      const newFreeElectiveCourses = prev.filter(
        (course) => course.id !== courseId,
      );
      localStorage.setItem(
        STORAGE_KEYS.bachelor.freeElectiveCourses,
        JSON.stringify(newFreeElectiveCourses),
      );
      return newFreeElectiveCourses;
    });
  };

  const toggleMathCredits = () => {
    setMathCredits((prev) => {
      const newCredits = prev === 9 ? 6 : 9;
      localStorage.setItem(
        STORAGE_KEYS.bachelor.mathCredits,
        JSON.stringify(newCredits),
      );

      if (newCredits === 6) {
        setGrades((prevGrades) => {
          const newGrades = { ...prevGrades };
          delete newGrades["math"];
          localStorage.setItem(
            STORAGE_KEYS.bachelor.grades,
            JSON.stringify(newGrades),
          );
          return newGrades;
        });
      }

      return newCredits;
    });
  };

  const gradingElectives = selectBestCoursesForGrading(
    electiveCourses,
    grades,
    BACHELOR_MANDATORY_ELECTIVE_CAP,
  );
  const electiveCourseIdsUsedInGrading = new Set(
    gradingElectives.map((course) => course.id),
  );
  const electiveCourseIdsUsedInProgress = selectCoursesForCreditCap(
    electiveCourses,
    grades,
    BACHELOR_MANDATORY_ELECTIVE_CAP,
  ).selectedIds;

  const calculateWeightedGrade = () => {
    let weightedSum = 0;
    let totalCredits = 0;

    ({ weightedSum, totalCredits } = addGradedCoursesToAverage(
      gradingElectives,
      weightedSum,
      totalCredits,
    ));

    const areaCredits = {
      ai: calculateAreaProgress("ai"),
      philosophy: calculateAreaProgress("philosophy"),
      psychology: calculateAreaProgress("psychology"),
    };

    const topAreas = Object.entries(areaCredits)
      .sort(([, creditsA], [, creditsB]) => creditsB - creditsA)
      .slice(0, 2)
      .map(([area]) => area);

    const statsCourse = courses.find((c) => c.id === "stats");
    if (
      statsCourse &&
      grades[statsCourse.id] &&
      grades[statsCourse.id] !== "-"
    ) {
      const grade = grades[statsCourse.id];
      if (typeof grade === "number") {
        weightedSum += statsCourse.credits * grade;
        totalCredits += statsCourse.credits;
      }
    }

    const mathElectives = electiveCourses.filter(
      (course) => course.area === "math",
    );
    const mathCourse = courses.find((c) => c.id === "math");
    if (
      mathElectives.length > 0 &&
      mathCourse &&
      grades[mathCourse.id] &&
      grades[mathCourse.id] !== "-" &&
      mathCredits === 9
    ) {
      const grade = grades[mathCourse.id];
      if (typeof grade === "number") {
        weightedSum += mathCredits * grade;
        totalCredits += mathCredits;
      }
    }

    const csElectives = electiveCourses.filter(
      (course) => course.area === "cs",
    );
    const csCourse = courses.find((c) => c.id === "cs");
    if (
      csElectives.length > 0 &&
      csCourse &&
      grades[csCourse.id] &&
      grades[csCourse.id] !== "-"
    ) {
      const grade = grades[csCourse.id];
      if (typeof grade === "number") {
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
      foundation: ["foundation"],
    };

    courses
      .filter(
        (course) =>
          topAreas.some((area) =>
            categoryMapping[area as keyof typeof categoryMapping]?.includes(
              course.category,
            ),
          ) &&
          grades[course.id] &&
          grades[course.id] !== "-" &&
          course.id !== "cog",
      )
      .forEach((course) => {
        const grade = grades[course.id];
        if (typeof grade === "number") {
          weightedSum += course.credits * grade;
          totalCredits += course.credits;
        }
      });

    return weightedAverage(weightedSum, totalCredits);
  };

  const setCourseSelection = (courseId: string, selection: string) => {
    setCourseSelections((prev) => {
      const newSelections = { ...prev, [courseId]: selection };
      localStorage.setItem(
        STORAGE_KEYS.bachelor.courseSelections,
        JSON.stringify(newSelections),
      );
      return newSelections;
    });
  };

  useEffect(() => {
    const savedCompletedCourses = localStorage.getItem(
      STORAGE_KEYS.bachelor.completedCourses,
    );
    const savedElectiveCourses = localStorage.getItem(
      STORAGE_KEYS.bachelor.electiveCourses,
    );
    const savedFreeElectiveCourses = localStorage.getItem(
      STORAGE_KEYS.bachelor.freeElectiveCourses,
    );
    const savedGrades = localStorage.getItem(STORAGE_KEYS.bachelor.grades);
    const savedMathCredits = localStorage.getItem(
      STORAGE_KEYS.bachelor.mathCredits,
    );
    const savedCourseSelections = localStorage.getItem(
      STORAGE_KEYS.bachelor.courseSelections,
    );

    if (savedCompletedCourses)
      setCompletedCourses(JSON.parse(savedCompletedCourses));
    if (savedElectiveCourses)
      setElectiveCourses(JSON.parse(savedElectiveCourses));
    if (savedFreeElectiveCourses)
      setFreeElectiveCourses(JSON.parse(savedFreeElectiveCourses));
    if (savedGrades) setGrades(JSON.parse(savedGrades));
    if (savedMathCredits) setMathCredits(JSON.parse(savedMathCredits));
    if (savedCourseSelections)
      setCourseSelections(JSON.parse(savedCourseSelections));
  }, []);

  useEffect(() => {
    const areaCredits = {
      ai: calculateAreaProgress("ai"),
      philosophy: calculateAreaProgress("philosophy"),
      psychology: calculateAreaProgress("psychology"),
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
      return sum + mathCredits;
    }
    return sum + course.credits;
  }, 0);

  const completedMandatoryCredits = courses
    .filter((course) => completedCourses.includes(course.id))
    .reduce((sum: number, course: Course) => {
      if (course.id === "math") {
        return sum + mathCredits;
      }
      return sum + course.credits;
    }, 0);

  const mandatoryProgress =
    (completedMandatoryCredits / totalMandatoryCredits) * 100;
  const totalElectiveCredits = electiveCourses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const cappedElectiveCredits = electiveCourses
    .filter((course) => electiveCourseIdsUsedInProgress.has(course.id))
    .reduce((sum, course) => sum + course.credits, 0);
  const electiveProgress =
    (cappedElectiveCredits / BACHELOR_MANDATORY_ELECTIVE_CAP) * 100;
  const maxFreeElectiveCredits = mathCredits === 6 ? 36 : 33;
  const totalFreeElectiveCredits = freeElectiveCourses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const freeElectiveCourseIdsUsedInProgress = selectCoursesForCreditCap(
    freeElectiveCourses,
    grades,
    maxFreeElectiveCredits,
  ).selectedIds;
  const cappedFreeElectiveCredits = freeElectiveCourses
    .filter((course) => freeElectiveCourseIdsUsedInProgress.has(course.id))
    .reduce((sum, course) => sum + course.credits, 0);
  const freeElectiveProgress =
    (cappedFreeElectiveCredits / maxFreeElectiveCredits) * 100;

  const electiveGradingCapExceeded =
    totalElectiveCredits > BACHELOR_MANDATORY_ELECTIVE_CAP;
  const freeElectiveCapExceeded =
    totalFreeElectiveCredits > maxFreeElectiveCredits;
  const totalCompletedCredits =
    completedMandatoryCredits +
    cappedElectiveCredits +
    cappedFreeElectiveCredits;
  const totalRequiredCredits =
    totalMandatoryCredits +
    BACHELOR_MANDATORY_ELECTIVE_CAP +
    maxFreeElectiveCredits;
  const overallProgress = (totalCompletedCredits / totalRequiredCredits) * 100;

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
    courseSelections,

    // Actions
    toggleCourse,
    calculateAreaProgress,
    calculateAreaTotalCredits,
    getAreaCountedCourseIds,
    setGrade,
    addElectiveCourse,
    addFreeElectiveCourse,
    removeElectiveCourse,
    removeFreeElectiveCourse,
    toggleMathCredits,
    calculateWeightedGrade,
    setCourseSelection,
    electiveCourseIdsUsedInGrading,
    electiveGradingCapExceeded,
    cappedElectiveCredits,
    cappedFreeElectiveCredits,
    freeElectiveCapExceeded,
    getFreeElectiveCountedCourseIds: () => freeElectiveCourseIdsUsedInProgress,

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
    overallProgress,
  };
}
