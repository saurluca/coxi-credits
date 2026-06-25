import {
  BachelorExportPayload,
  CombinedExportPayload,
  ExportPayload,
  MasterExportPayload,
  Program,
  StudyProjectState,
} from "@/app/types";
import { STUDY_PROJECT_PARTS } from "@/app/constants/master";

export const STORAGE_KEYS = {
  activeProgram: "activeProgram",
  bachelor: {
    completedCourses: "completedCourses",
    electiveCourses: "electiveCourses",
    freeElectiveCourses: "freeElectiveCourses",
    mathCredits: "mathCredits",
    grades: "grades",
    courseSelections: "courseSelections",
  },
  master: {
    studyProject: "master.studyProject",
    thesis: "master.thesis",
    mandatoryElectives: "master.mandatoryElectives",
    freeElectives: "master.freeElectives",
    grades: "master.grades",
    thesisGrade: "master.thesisGrade",
  },
} as const;

const DEFAULT_BACHELOR: BachelorExportPayload = {
  completedCourses: [],
  electiveCourses: [],
  freeElectiveCourses: [],
  mathCredits: 9,
  grades: {},
  courseSelections: {},
};

const DEFAULT_STUDY_PROJECT: StudyProjectState = {
  part1Completed: false,
  part2Completed: false,
};

const DEFAULT_MASTER: MasterExportPayload = {
  studyProject: DEFAULT_STUDY_PROJECT,
  thesis: { completed: false },
  mandatoryElectives: [],
  freeElectives: [],
  grades: {},
  thesisGrade: null,
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

const activeProgramListeners = new Set<() => void>();

function notifyActiveProgramChange(): void {
  queueMicrotask(() => {
    activeProgramListeners.forEach((listener) => listener());
  });
}

export function subscribeActiveProgram(listener: () => void): () => void {
  activeProgramListeners.add(listener);
  return () => {
    activeProgramListeners.delete(listener);
  };
}

export function getActiveProgramSnapshot(): Program {
  return readActiveProgram();
}

export function getActiveProgramServerSnapshot(): Program {
  return "bachelor";
}

export function readActiveProgram(): Program {
  const value = readJson<string | null>(STORAGE_KEYS.activeProgram, null);
  return value === "master" ? "master" : "bachelor";
}

export function writeActiveProgram(program: Program): void {
  writeJson(STORAGE_KEYS.activeProgram, program);
  notifyActiveProgramChange();
}

export function readBachelorData(): BachelorExportPayload {
  return {
    completedCourses: readJson(
      STORAGE_KEYS.bachelor.completedCourses,
      DEFAULT_BACHELOR.completedCourses,
    ),
    electiveCourses: readJson(
      STORAGE_KEYS.bachelor.electiveCourses,
      DEFAULT_BACHELOR.electiveCourses,
    ),
    freeElectiveCourses: readJson(
      STORAGE_KEYS.bachelor.freeElectiveCourses,
      DEFAULT_BACHELOR.freeElectiveCourses,
    ),
    mathCredits: readJson(
      STORAGE_KEYS.bachelor.mathCredits,
      DEFAULT_BACHELOR.mathCredits,
    ),
    grades: readJson(STORAGE_KEYS.bachelor.grades, DEFAULT_BACHELOR.grades),
    courseSelections: readJson(
      STORAGE_KEYS.bachelor.courseSelections,
      DEFAULT_BACHELOR.courseSelections,
    ),
  };
}

export function writeBachelorData(data: BachelorExportPayload): void {
  writeJson(STORAGE_KEYS.bachelor.completedCourses, data.completedCourses);
  writeJson(STORAGE_KEYS.bachelor.electiveCourses, data.electiveCourses);
  writeJson(
    STORAGE_KEYS.bachelor.freeElectiveCourses,
    data.freeElectiveCourses,
  );
  writeJson(STORAGE_KEYS.bachelor.mathCredits, data.mathCredits);
  writeJson(STORAGE_KEYS.bachelor.grades, data.grades);
  writeJson(
    STORAGE_KEYS.bachelor.courseSelections,
    data.courseSelections ?? {},
  );
}

function normalizeStudyProjectState(raw: unknown): StudyProjectState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_STUDY_PROJECT;
  }

  const data = raw as Record<string, unknown>;

  if (
    typeof data.part1Completed === "boolean" &&
    typeof data.part2Completed === "boolean"
  ) {
    return {
      part1Completed: data.part1Completed,
      part2Completed: data.part2Completed,
    };
  }

  if (typeof data.completed === "boolean") {
    return {
      part1Completed: data.completed,
      part2Completed: data.completed,
    };
  }

  return DEFAULT_STUDY_PROJECT;
}

function migrateStudyProjectGrades(
  grades: Record<string, number | string>,
): Record<string, number | string> {
  const legacyGrade = grades["study-project"];
  if (legacyGrade === undefined) {
    return grades;
  }

  const next = { ...grades };
  for (const part of STUDY_PROJECT_PARTS) {
    if (next[part.id] === undefined) {
      next[part.id] = legacyGrade;
    }
  }
  delete next["study-project"];
  return next;
}

export function readMasterData(): MasterExportPayload {
  const thesisGrade = readJson(
    STORAGE_KEYS.master.thesisGrade,
    DEFAULT_MASTER.thesisGrade,
  );
  const storedThesis = readJson<{ completed?: boolean } | null>(
    STORAGE_KEYS.master.thesis,
    null,
  );
  const thesis =
    storedThesis && typeof storedThesis.completed === "boolean"
      ? { completed: storedThesis.completed }
      : thesisGrade !== null
        ? { completed: true }
        : DEFAULT_MASTER.thesis;

  const studyProject = normalizeStudyProjectState(
    readJson(STORAGE_KEYS.master.studyProject, DEFAULT_MASTER.studyProject),
  );
  const grades = migrateStudyProjectGrades(
    readJson(STORAGE_KEYS.master.grades, DEFAULT_MASTER.grades),
  );

  return {
    studyProject,
    thesis,
    mandatoryElectives: readJson(
      STORAGE_KEYS.master.mandatoryElectives,
      DEFAULT_MASTER.mandatoryElectives,
    ),
    freeElectives: readJson(
      STORAGE_KEYS.master.freeElectives,
      DEFAULT_MASTER.freeElectives,
    ),
    grades,
    thesisGrade,
  };
}

export function writeMasterData(data: MasterExportPayload): void {
  writeJson(STORAGE_KEYS.master.studyProject, data.studyProject);
  writeJson(STORAGE_KEYS.master.thesis, data.thesis);
  writeJson(STORAGE_KEYS.master.mandatoryElectives, data.mandatoryElectives);
  writeJson(STORAGE_KEYS.master.freeElectives, data.freeElectives);
  writeJson(STORAGE_KEYS.master.grades, data.grades);
  writeJson(STORAGE_KEYS.master.thesisGrade, data.thesisGrade);
}

export function exportAllData(): string {
  const payload: CombinedExportPayload = {
    version: 2,
    activeProgram: readActiveProgram(),
    bachelor: readBachelorData(),
    master: readMasterData(),
  };
  return JSON.stringify(payload);
}

function isLegacyV1(payload: unknown): payload is ExportPayload {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as ExportPayload;
  return data.version === 1 && Array.isArray(data.completedCourses);
}

function isCombinedV2(payload: unknown): payload is CombinedExportPayload {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as CombinedExportPayload;
  return data.version === 2 && data.bachelor != null && data.master != null;
}

export function importAllData(payload: unknown): void {
  if (isCombinedV2(payload)) {
    writeBachelorData({
      completedCourses: Array.isArray(payload.bachelor.completedCourses)
        ? payload.bachelor.completedCourses.filter(Boolean)
        : [],
      electiveCourses: Array.isArray(payload.bachelor.electiveCourses)
        ? payload.bachelor.electiveCourses
        : [],
      freeElectiveCourses: Array.isArray(payload.bachelor.freeElectiveCourses)
        ? payload.bachelor.freeElectiveCourses
        : [],
      mathCredits:
        typeof payload.bachelor.mathCredits === "number"
          ? payload.bachelor.mathCredits
          : 9,
      grades:
        payload.bachelor.grades && typeof payload.bachelor.grades === "object"
          ? payload.bachelor.grades
          : {},
      courseSelections:
        payload.bachelor.courseSelections &&
        typeof payload.bachelor.courseSelections === "object"
          ? payload.bachelor.courseSelections
          : {},
    });
    writeMasterData({
      studyProject: normalizeStudyProjectState(
        payload.master.studyProject ?? DEFAULT_MASTER.studyProject,
      ),
      thesis:
        payload.master.thesis &&
        typeof payload.master.thesis.completed === "boolean"
          ? payload.master.thesis
          : typeof payload.master.thesisGrade === "number"
            ? { completed: true }
            : DEFAULT_MASTER.thesis,
      mandatoryElectives: Array.isArray(payload.master.mandatoryElectives)
        ? payload.master.mandatoryElectives
        : [],
      freeElectives: Array.isArray(payload.master.freeElectives)
        ? payload.master.freeElectives
        : [],
      grades: migrateStudyProjectGrades(
        payload.master.grades && typeof payload.master.grades === "object"
          ? payload.master.grades
          : {},
      ),
      thesisGrade:
        typeof payload.master.thesisGrade === "number"
          ? payload.master.thesisGrade
          : null,
    });
    if (
      payload.activeProgram === "master" ||
      payload.activeProgram === "bachelor"
    ) {
      writeJson(STORAGE_KEYS.activeProgram, payload.activeProgram);
    }
    notifyActiveProgramChange();
    return;
  }

  if (isLegacyV1(payload)) {
    writeBachelorData({
      completedCourses: Array.isArray(payload.completedCourses)
        ? payload.completedCourses.filter(Boolean)
        : [],
      electiveCourses: Array.isArray(payload.electiveCourses)
        ? payload.electiveCourses
        : [],
      freeElectiveCourses: Array.isArray(payload.freeElectiveCourses)
        ? payload.freeElectiveCourses
        : [],
      mathCredits:
        typeof payload.mathCredits === "number" ? payload.mathCredits : 9,
      grades:
        payload.grades && typeof payload.grades === "object"
          ? payload.grades
          : {},
      courseSelections:
        payload.courseSelections && typeof payload.courseSelections === "object"
          ? payload.courseSelections
          : {},
    });
    writeJson(STORAGE_KEYS.activeProgram, "bachelor");
    notifyActiveProgramChange();
    return;
  }

  throw new Error(
    "Invalid JSON backup. Expected version 1 (Bachelor) or version 2 (combined).",
  );
}
