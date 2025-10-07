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

export interface ExportPayload {
    version: 1;
    completedCourses: string[];
    electiveCourses: ElectiveCourse[];
    freeElectiveCourses: FreeElectiveCourse[];
    mathCredits: number;
    grades: Record<string, number | string>;
}