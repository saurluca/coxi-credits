export interface GradedCourse {
  id: string;
  credits: number;
  grade: number;
}

export interface CreditCourse {
  id: string;
  credits: number;
}

export function getNumericGrade(
  grades: Record<string, number | string>,
  id: string,
): number | null {
  const grade = grades[id];
  if (grade === undefined || grade === "-" || grade === "") return null;
  if (typeof grade === "number" && grade >= 1.0 && grade <= 5.0) return grade;
  return null;
}

/** Picks courses until maxCredits is reached; best grades first, then insertion order. */
export function selectCoursesForCreditCap(
  courses: CreditCourse[],
  grades: Record<string, number | string>,
  maxCredits: number,
): { selected: CreditCourse[]; selectedIds: Set<string> } {
  const withIndex = courses.map((course, index) => ({ ...course, index }));
  const sorted = [...withIndex].sort((a, b) => {
    const gradeA = getNumericGrade(grades, a.id);
    const gradeB = getNumericGrade(grades, b.id);
    if (gradeA !== null && gradeB !== null && gradeA !== gradeB) {
      return gradeA - gradeB;
    }
    if (gradeA !== null && gradeB === null) return -1;
    if (gradeA === null && gradeB !== null) return 1;
    return a.index - b.index;
  });

  const selected: CreditCourse[] = [];
  const selectedIds = new Set<string>();
  let used = 0;

  for (const course of sorted) {
    if (used + course.credits <= maxCredits) {
      selected.push(course);
      selectedIds.add(course.id);
      used += course.credits;
    }
  }

  return { selected, selectedIds };
}

/** Picks graded courses with the best grades until maxCredits is reached. */
export function selectBestCoursesForGrading(
  courses: CreditCourse[],
  grades: Record<string, number | string>,
  maxCredits: number,
): GradedCourse[] {
  const graded = courses
    .map((course) => ({
      ...course,
      grade: getNumericGrade(grades, course.id),
    }))
    .filter((course): course is GradedCourse => course.grade !== null)
    .sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return b.credits - a.credits;
    });

  const selected: GradedCourse[] = [];
  let used = 0;

  for (const course of graded) {
    if (used + course.credits <= maxCredits) {
      selected.push(course);
      used += course.credits;
    }
  }

  return selected;
}

export function addGradedCoursesToAverage(
  courses: GradedCourse[],
  weightedSum: number,
  totalCredits: number,
): { weightedSum: number; totalCredits: number } {
  for (const course of courses) {
    weightedSum += course.credits * course.grade;
    totalCredits += course.credits;
  }
  return { weightedSum, totalCredits };
}

export function weightedAverage(
  weightedSum: number,
  totalCredits: number,
): number | null {
  return totalCredits > 0
    ? Number((weightedSum / totalCredits).toFixed(2))
    : null;
}
