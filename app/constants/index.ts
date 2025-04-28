import { Course } from "../types";

export const areaNames = {
    ai: "Artificial Intelligence and Machine Learning",
    philosophy: "Mind, Ethics, and Society",
    psychology: "Psychology, Communication, Neuroscience, and Behavior",
    cs: "Computer Science",
    math: "Mathematics",
    foundation: "Methods of Cognitive Science"
};

export const courses: Course[] = [
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
];

export const validGrades = ["-", "1.0", "1.3", "1.7", "2.0", "2.3", "2.7", "3.0", "3.3", "3.7", "4.0"]; 