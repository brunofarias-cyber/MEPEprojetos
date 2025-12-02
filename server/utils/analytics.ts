/**
 * Analytics Utility Functions
 * Helper functions for calculating metrics and analytics
 */

import type { Submission, Student } from "@shared/schema";

/**
 * Calculate average submission rate
 * @param totalSubmissions Number of submissions received
 * @param totalStudents Total number of students
 * @param totalProjects Total number of projects
 * @returns Submission rate as percentage (0-100)
 */
export function calculateSubmissionRate(
    totalSubmissions: number,
    totalStudents: number,
    totalProjects: number
): number {
    if (totalStudents === 0 || totalProjects === 0) {
        return 0;
    }

    const totalPossible = totalStudents * totalProjects;
    const rate = (totalSubmissions / totalPossible) * 100;

    return Math.min(Math.round(rate), 100); // Cap at 100%
}

/**
 * Calculate engagement rate for a class
 * @param classSubmissions Number of submissions from the class
 * @param classStudents Number of students in the class
 * @param benchmarkProjects Benchmark number of projects (default: 5)
 * @returns Engagement rate as percentage (0-100)
 */
export function calculateEngagement(
    classSubmissions: number,
    classStudents: number,
    benchmarkProjects: number = 5
): number {
    if (classStudents === 0) {
        return 0;
    }

    const expectedSubmissions = classStudents * benchmarkProjects;
    const rate = (classSubmissions / expectedSubmissions) * 100;

    return Math.min(Math.round(rate), 100); // Cap at 100%
}

/**
 * Calculate attendance rate
 * @param presentCount Number of present records
 * @param totalRecords Total attendance records
 * @returns Attendance rate as percentage (0-100)
 */
export function calculateAttendanceRate(
    presentCount: number,
    totalRecords: number
): number {
    if (totalRecords === 0) {
        return 0;
    }

    return Math.round((presentCount / totalRecords) * 100);
}

/**
 * Calculate average grade from submissions
 * @param submissions Array of submissions
 * @returns Average grade (0-100), or 0 if no graded submissions
 */
export function calculateAverageGrade(submissions: Submission[]): number {
    const grades = submissions
        .filter(s => s.grade !== null)
        .map(s => s.grade!);

    if (grades.length === 0) {
        return 0;
    }

    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return Math.round(sum / grades.length);
}

/**
 * Determine if a student is at risk
 * @param student Student object
 * @param absenceCount Number of absences
 * @param submissionCount Number of submissions
 * @param thresholds Risk thresholds (optional)
 * @returns true if student is at risk
 */
export function isStudentAtRisk(
    student: Student,
    absenceCount: number,
    submissionCount: number,
    thresholds = {
        minXp: 100,
        maxAbsences: 5,
        minSubmissions: 1
    }
): boolean {
    const isLowXp = student.xp < thresholds.minXp;
    const hasHighAbsences = absenceCount > thresholds.maxAbsences;
    const hasFewSubmissions = submissionCount < thresholds.minSubmissions;

    return isLowXp || hasHighAbsences || hasFewSubmissions;
}

/**
 * Deduplicate array of objects by a key
 * @param items Array of items
 * @param keyFn Function to extract key from item
 * @returns Deduplicated array
 */
export function deduplicateBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
    const map = new Map<string | number, T>();

    for (const item of items) {
        const key = keyFn(item);
        if (!map.has(key)) {
            map.set(key, item);
        }
    }

    return Array.from(map.values());
}
