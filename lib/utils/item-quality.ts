export type ItemQualityGrade = "worthless" | "useable" | "base" | "good" | "best";

export type QualityGradeDefinition = {
    grade: ItemQualityGrade;
    min: number;
    max: number;
    defaultValue: number;
    color: string;
};

export const QUALITY_GRADES: QualityGradeDefinition[] = [
    { grade: "worthless", min: 0, max: 299, defaultValue: 150, color: "#dc4f4f" },
    { grade: "useable", min: 300, max: 449, defaultValue: 375, color: "#f0a500" },
    { grade: "base", min: 450, max: 549, defaultValue: 500, color: "#8899a6" },
    { grade: "good", min: 550, max: 799, defaultValue: 675, color: "#50d278" },
    { grade: "best", min: 800, max: 1000, defaultValue: 900, color: "#deb84f" },
];

export function getQualityGrade(quality: number): ItemQualityGrade {
    const clamped = Math.max(0, Math.min(1000, quality));
    for (const def of QUALITY_GRADES) {
        if (clamped >= def.min && clamped <= def.max) return def.grade;
    }
    return "base";
}

export function getQualityGradeDefinition(grade: ItemQualityGrade): QualityGradeDefinition {
    return QUALITY_GRADES.find((d) => d.grade === grade)!;
}

export function getQualityGradeColor(grade: ItemQualityGrade): string {
    return getQualityGradeDefinition(grade).color;
}

export function getQualityGradeDefault(grade: ItemQualityGrade): number {
    return getQualityGradeDefinition(grade).defaultValue;
}

/**
 * Parse a quality input string — accepts numeric values (0–1000) or grade names.
 * Returns the numeric quality value, or null if invalid.
 */
export function parseQualityInput(input: string): number | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Try numeric
    const num = Number(trimmed);
    if (!isNaN(num) && num >= 0 && num <= 1000) {
        return Math.round(num);
    }

    // Try grade name
    const lower = trimmed.toLowerCase();
    const match = QUALITY_GRADES.find((d) => d.grade === lower);
    if (match) return match.defaultValue;

    return null;
}
