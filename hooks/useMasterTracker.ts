import { useState, useEffect } from "react";
import {
  MasterArea,
  MasterElectiveCourse,
  MasterFreeElectiveCourse,
  StudyProjectState,
  ThesisState,
} from "@/app/types";
import {
  masterAreaMaxCredits,
  masterAreaNames,
  masterFocusAreas,
  MASTER_CREDITS,
  STUDY_PROJECT_PARTS,
  STUDY_PROJECT_TOTAL_CREDITS,
  THESIS,
} from "@/app/constants/master";
import { readMasterData, STORAGE_KEYS } from "@/lib/storage";
import {
  addGradedCoursesToAverage,
  getNumericGrade,
  selectBestCoursesForGrading,
  weightedAverage,
} from "@/lib/gradeSelection";

function truncateToFirstDecimal(value: number): number {
  return Math.floor(value * 10) / 10;
}

export function useMasterTracker() {
  const [studyProject, setStudyProject] = useState<StudyProjectState>({
    part1Completed: false,
    part2Completed: false,
  });
  const [thesis, setThesis] = useState<ThesisState>({ completed: false });
  const [mandatoryElectives, setMandatoryElectives] = useState<
    MasterElectiveCourse[]
  >([]);
  const [freeElectives, setFreeElectives] = useState<
    MasterFreeElectiveCourse[]
  >([]);
  const [grades, setGrades] = useState<Record<string, number | string>>({});
  const [thesisGrade, setThesisGradeState] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<{
    name: string;
    credits: string;
    area: MasterArea;
    grade?: string;
  }>({ name: "", credits: "", area: "aiml" });
  const [newFreeElective, setNewFreeElective] = useState({
    name: "",
    credits: "",
    graded: false,
    grade: "",
  });

  const calculateAreaProgress = (area: MasterArea) =>
    mandatoryElectives
      .filter((course) => course.area === area)
      .reduce((sum, course) => sum + course.credits, 0);

  const specializations = masterFocusAreas.filter(
    (area) => calculateAreaProgress(area) >= MASTER_CREDITS.specializationMin,
  );

  const toggleStudyProjectPart = (part: 1 | 2) => {
    setStudyProject((prev) => {
      const key = part === 1 ? "part1Completed" : "part2Completed";
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(
        STORAGE_KEYS.master.studyProject,
        JSON.stringify(next),
      );
      return next;
    });
  };

  const toggleThesis = () => {
    setThesis((prev) => {
      const next = { completed: !prev.completed };
      localStorage.setItem(STORAGE_KEYS.master.thesis, JSON.stringify(next));
      return next;
    });
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
        STORAGE_KEYS.master.grades,
        JSON.stringify(newGrades),
      );
      return newGrades;
    });
  };

  const setThesisGrade = (grade: number | string | "") => {
    if (
      grade === "" ||
      grade === "-" ||
      (typeof grade === "number" && isNaN(grade))
    ) {
      setThesisGradeState(null);
      localStorage.setItem(
        STORAGE_KEYS.master.thesisGrade,
        JSON.stringify(null),
      );
      setGrades((prev) => {
        const newGrades = { ...prev };
        delete newGrades[THESIS.id];
        localStorage.setItem(
          STORAGE_KEYS.master.grades,
          JSON.stringify(newGrades),
        );
        return newGrades;
      });
    } else if (typeof grade === "number" && grade >= 1.0 && grade <= 5.0) {
      setThesisGradeState(grade);
      localStorage.setItem(
        STORAGE_KEYS.master.thesisGrade,
        JSON.stringify(grade),
      );
      setGrades((prev) => {
        const newGrades = { ...prev, [THESIS.id]: grade };
        localStorage.setItem(
          STORAGE_KEYS.master.grades,
          JSON.stringify(newGrades),
        );
        return newGrades;
      });
    }
  };

  const addMandatoryElective = () => {
    if (!newCourse.name || !newCourse.credits) {
      if (!newCourse.name) alert("Please enter a course name");
      else alert("Please enter the number of credits");
      return;
    }

    const newCredits = Number.parseInt(newCourse.credits, 10);
    if (newCredits < 1 || newCredits > 30) {
      alert("Credits must be between 1 and 30");
      return;
    }

    const areaCredits = calculateAreaProgress(newCourse.area);
    const maxCredits = masterAreaMaxCredits[newCourse.area];

    if (areaCredits + newCredits > maxCredits) {
      alert(
        `Cannot add course. Maximum of ${maxCredits} ECTS credits allowed for ${masterAreaNames[newCourse.area]}. Current credits: ${areaCredits}`,
      );
      return;
    }

    const courseId = crypto.randomUUID();

    setMandatoryElectives((prev) => {
      const next = [
        ...prev,
        {
          id: courseId,
          name: newCourse.name,
          credits: newCredits,
          area: newCourse.area,
        },
      ];
      localStorage.setItem(
        STORAGE_KEYS.master.mandatoryElectives,
        JSON.stringify(next),
      );
      return next;
    });

    if (newCourse.grade && newCourse.grade !== "-") {
      setGrade(courseId, parseFloat(newCourse.grade));
    }

    setNewCourse({ name: "", credits: "", area: "aiml" });
  };

  const addFreeElective = () => {
    if (!newFreeElective.name || !newFreeElective.credits) {
      if (!newFreeElective.name) alert("Please enter a course name");
      else alert("Please enter the number of credits");
      return;
    }

    const newCredits = Number.parseInt(newFreeElective.credits, 10);
    if (newCredits < 1 || newCredits > 30) {
      alert("Credits must be between 1 and 30");
      return;
    }

    const courseId = crypto.randomUUID();

    setFreeElectives((prev) => {
      const next = [
        ...prev,
        {
          id: courseId,
          name: newFreeElective.name,
          credits: newCredits,
          graded: newFreeElective.graded,
        },
      ];
      localStorage.setItem(
        STORAGE_KEYS.master.freeElectives,
        JSON.stringify(next),
      );
      return next;
    });

    if (
      newFreeElective.graded &&
      newFreeElective.grade &&
      newFreeElective.grade !== "-"
    ) {
      setGrade(courseId, parseFloat(newFreeElective.grade));
    }

    setNewFreeElective({ name: "", credits: "", graded: false, grade: "" });
  };

  const removeMandatoryElective = (courseId: string) => {
    setMandatoryElectives((prev) => {
      const next = prev.filter((course) => course.id !== courseId);
      localStorage.setItem(
        STORAGE_KEYS.master.mandatoryElectives,
        JSON.stringify(next),
      );
      return next;
    });
    setGrade(courseId, "");
  };

  const removeFreeElective = (courseId: string) => {
    setFreeElectives((prev) => {
      const next = prev.filter((course) => course.id !== courseId);
      localStorage.setItem(
        STORAGE_KEYS.master.freeElectives,
        JSON.stringify(next),
      );
      return next;
    });
    setGrade(courseId, "");
  };

  const gradingMandatoryElectives = selectBestCoursesForGrading(
    mandatoryElectives,
    grades,
    MASTER_CREDITS.mandatoryElective,
  );
  const mandatoryElectiveCourseIdsUsedInGrading = new Set(
    gradingMandatoryElectives.map((course) => course.id),
  );

  const calculateCourseworkGrade = (): number | null => {
    let weightedSum = 0;
    let totalCredits = 0;

    const studyProjectCompletion = [
      studyProject.part1Completed,
      studyProject.part2Completed,
    ];

    for (let i = 0; i < STUDY_PROJECT_PARTS.length; i++) {
      if (!studyProjectCompletion[i]) continue;

      const part = STUDY_PROJECT_PARTS[i];
      const grade = getNumericGrade(grades, part.id);
      if (grade !== null) {
        weightedSum += part.credits * grade;
        totalCredits += part.credits;
      }
    }

    ({ weightedSum, totalCredits } = addGradedCoursesToAverage(
      gradingMandatoryElectives,
      weightedSum,
      totalCredits,
    ));

    return weightedAverage(weightedSum, totalCredits);
  };

  const calculateFinalGrade = (): number | null => {
    const coursework = calculateCourseworkGrade();
    if (coursework === null) return null;
    if (!thesis.completed || thesisGrade === null) return coursework;

    const final = (3 * coursework + 2 * thesisGrade) / 5;
    return truncateToFirstDecimal(final);
  };

  useEffect(() => {
    const data = readMasterData();
    setStudyProject(data.studyProject);
    setThesis(data.thesis);
    setMandatoryElectives(data.mandatoryElectives);
    setFreeElectives(data.freeElectives);
    setGrades(data.grades);
    setThesisGradeState(data.thesisGrade);
  }, []);

  const completedMandatoryCredits =
    (studyProject.part1Completed ? STUDY_PROJECT_PARTS[0].credits : 0) +
    (studyProject.part2Completed ? STUDY_PROJECT_PARTS[1].credits : 0);
  const mandatoryProgress =
    (completedMandatoryCredits / MASTER_CREDITS.mandatory) * 100;

  const totalMandatoryElectiveCredits = mandatoryElectives.reduce(
    (sum, c) => sum + c.credits,
    0,
  );
  const cappedMandatoryElectiveCredits = Math.min(
    totalMandatoryElectiveCredits,
    MASTER_CREDITS.mandatoryElective,
  );
  const mandatoryElectiveProgress =
    (totalMandatoryElectiveCredits / MASTER_CREDITS.mandatoryElective) * 100;
  const mandatoryElectiveGradingCapExceeded =
    totalMandatoryElectiveCredits > MASTER_CREDITS.mandatoryElective;

  const totalFreeElectiveCredits = freeElectives.reduce(
    (sum, c) => sum + c.credits,
    0,
  );
  const cappedFreeElectiveCredits = Math.min(
    totalFreeElectiveCredits,
    MASTER_CREDITS.freeElective,
  );
  const freeElectiveProgress =
    (totalFreeElectiveCredits / MASTER_CREDITS.freeElective) * 100;

  const thesisCompleted = thesis.completed;
  const completedThesisCredits = thesisCompleted ? THESIS.credits : 0;

  const totalCompletedCredits =
    completedMandatoryCredits +
    cappedMandatoryElectiveCredits +
    cappedFreeElectiveCredits +
    completedThesisCredits;
  const totalRequiredCredits = MASTER_CREDITS.total;
  const overallProgress = (totalCompletedCredits / totalRequiredCredits) * 100;

  const courseworkGrade = calculateCourseworkGrade();
  const finalGrade = calculateFinalGrade();

  return {
    studyProject,
    thesis,
    mandatoryElectives,
    freeElectives,
    grades,
    thesisGrade,
    specializations,
    newCourse,
    setNewCourse,
    newFreeElective,
    setNewFreeElective,
    toggleStudyProjectPart,
    toggleThesis,
    calculateAreaProgress,
    setGrade,
    setThesisGrade,
    addMandatoryElective,
    addFreeElective,
    removeMandatoryElective,
    removeFreeElective,
    mandatoryElectiveCourseIdsUsedInGrading,
    mandatoryElectiveGradingCapExceeded,
    courseworkGrade,
    finalGrade,
    completedMandatoryCredits,
    mandatoryProgress,
    totalMandatoryElectiveCredits,
    cappedMandatoryElectiveCredits,
    mandatoryElectiveProgress,
    totalFreeElectiveCredits,
    cappedFreeElectiveCredits,
    freeElectiveProgress,
    thesisCompleted,
    completedThesisCredits,
    totalCompletedCredits,
    totalRequiredCredits,
    overallProgress,
  };
}
