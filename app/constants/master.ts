import { MasterArea } from "../types";

export const masterAreaNames: Record<MasterArea, string> = {
  mes: "Cognition: Mind, Ethics, and Society",
  aiml: "Cognition: Artificial Intelligence and Machine Learning",
  neuro: "Cognition: (Computational) Neuroscience",
  plc: "Cognition: Psychology, Language, and Communication",
  methods: "Methods of Cognitive Science",
};

export const masterAreaIdentifiers: Record<MasterArea, string> = {
  mes: "EAI, PHIL",
  aiml: "NI, AI, NAI, CL, CV",
  neuro: "CNS",
  plc: "CMP, LING, CBC",
  methods: "MCS",
};

export const masterFocusAreas: MasterArea[] = ["mes", "aiml", "neuro", "plc"];

export const masterAreaMaxCredits: Record<MasterArea, number> = {
  mes: 32,
  aiml: 32,
  neuro: 32,
  plc: 32,
  methods: 4,
};

export const MASTER_CREDITS = {
  mandatory: 24,
  mandatoryElective: 44,
  freeElective: 22,
  thesis: 30,
  total: 120,
  specializationMin: 20,
  specializationMax: 32,
} as const;

export const STUDY_PROJECT_PARTS = [
  {
    id: "study-project-part-1",
    name: "Study Project Part 1",
    credits: 12,
    semester: 1,
  },
  {
    id: "study-project-part-2",
    name: "Study Project Part 2",
    credits: 12,
    semester: 2,
  },
] as const;

export const STUDY_PROJECT_TOTAL_CREDITS = 24;

export const THESIS = {
  id: "thesis",
  name: "Master's Thesis",
  credits: 30,
} as const;

export const masterAreaOrder: MasterArea[] = [
  "mes",
  "aiml",
  "neuro",
  "plc",
  "methods",
];
