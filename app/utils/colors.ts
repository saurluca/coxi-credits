import { Course } from "../types";

export const getCategoryColor = (category: Course["category"]) => {
    switch (category) {
        case "foundation":
            return "border-purple-500";
        case "ai":
            return "border-blue-500";
        case "philosophy":
            return "border-green-500";
        case "psychology":
            return "border-yellow-500";
        case "cs":
            return "border-orange-500";
        case "math":
            return "border-red-500";
        default:
            return "";
    }
}; 