import { Course, MasterArea } from "../types";

export const getCategoryColor = (category: Course["category"] | MasterArea) => {
  switch (category) {
    case "foundation":
    case "methods":
      return "border-purple-500";
    case "ai":
    case "aiml":
      return "border-blue-500";
    case "philosophy":
    case "mes":
      return "border-green-500";
    case "psychology":
    case "plc":
      return "border-yellow-500";
    case "cs":
      return "border-orange-500";
    case "math":
      return "border-red-500";
    case "neuro":
      return "border-teal-500";
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
};

export const getMasterAreaColor = (area: MasterArea): string =>
  getCategoryColor(area);
