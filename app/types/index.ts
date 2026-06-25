export interface Course {
  id: string;
  name: string;
  credits: number;
  category: "foundation" | "cs" | "math" | "ai" | "philosophy" | "psychology";
  required?: boolean;
  options?: number;
  totalInGroup?: number;
  grade?: number;
}

export interface ElectiveCourse {
  id: string;
  name: string;
  credits: number;
  area: "ai" | "philosophy" | "psychology" | "cs" | "math" | "foundation";
  grade?: number;
}

export interface FreeElectiveCourse {
  id: string;
  name: string;
  credits: number;
}

export type MasterArea = "mes" | "aiml" | "neuro" | "plc" | "methods";

export interface MasterElectiveCourse {
  id: string;
  name: string;
  credits: number;
  area: MasterArea;
}

export interface MasterFreeElectiveCourse {
  id: string;
  name: string;
  credits: number;
  graded: boolean;
}

export interface StudyProjectState {
  part1Completed: boolean;
  part2Completed: boolean;
}

export interface ThesisState {
  completed: boolean;
}

export type Program = "bachelor" | "master";

export interface BachelorExportPayload {
  completedCourses: string[];
  electiveCourses: ElectiveCourse[];
  freeElectiveCourses: FreeElectiveCourse[];
  mathCredits: number;
  grades: Record<string, number | string>;
  courseSelections?: Record<string, string>;
}

export interface MasterExportPayload {
  studyProject: StudyProjectState;
  thesis: ThesisState;
  mandatoryElectives: MasterElectiveCourse[];
  freeElectives: MasterFreeElectiveCourse[];
  grades: Record<string, number | string>;
  thesisGrade: number | null;
}

/** @deprecated Use CombinedExportPayload v2 instead */
export interface ExportPayload extends BachelorExportPayload {
  version: 1;
}

export interface CombinedExportPayload {
  version: 2;
  activeProgram?: Program;
  bachelor: BachelorExportPayload;
  master: MasterExportPayload;
}
