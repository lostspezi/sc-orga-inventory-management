import {
    startOfISOWeek,
    endOfISOWeek,
    subWeeks,
    getISOWeek,
    getISOWeekYear,
    setMilliseconds,
    setSeconds,
    setMinutes,
    setHours,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export interface WeekBoundaries {
    weekStart: Date; // Monday 00:00:00.000 UTC
    weekEnd: Date;   // Sunday 23:59:59.999 UTC
    weekLabel: string; // e.g. "2026-W10"
}

/**
 * Compute the ISO week (Mon–Sun) boundaries for the week containing
 * `referenceDate`, expressed in `timezone`, then converted back to UTC.
 */
export function getWeekBoundaries(
    referenceDate: Date,
    timezone = "UTC"
): WeekBoundaries {
    // Convert the reference point to the org's timezone
    const zoned = toZonedTime(referenceDate, timezone);

    // ISO week starts Monday
    const startZoned = startOfISOWeek(zoned);
    const endZoned = endOfISOWeek(zoned);

    // Build explicit Date objects at day boundaries (still in zoned representation)
    const startLocal = setMilliseconds(setSeconds(setMinutes(setHours(startZoned, 0), 0), 0), 0);
    const endLocal   = setMilliseconds(setSeconds(setMinutes(setHours(endZoned, 23), 59), 59), 999);

    // Convert back to UTC for storage
    const weekStart = fromZonedTime(startLocal, timezone);
    const weekEnd   = fromZonedTime(endLocal,   timezone);

    const week = getISOWeek(startZoned);
    const year = getISOWeekYear(startZoned);
    const weekLabel = `${year}-W${String(week).padStart(2, "0")}`;

    return { weekStart, weekEnd, weekLabel };
}

/** Returns boundaries for the week immediately before the current one. */
export function getPreviousWeekBoundaries(timezone = "UTC"): WeekBoundaries {
    return getWeekBoundaries(subWeeks(new Date(), 1), timezone);
}

/** Returns boundaries for the current week. */
export function getCurrentWeekBoundaries(timezone = "UTC"): WeekBoundaries {
    return getWeekBoundaries(new Date(), timezone);
}

/** Parse a weekLabel like "2026-W10" into a Date (the Monday of that week in UTC). */
export function weekLabelToStartDate(weekLabel: string, timezone = "UTC"): Date | null {
    const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return null;

    const year = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);

    // Jan 4th is always in week 1 of the ISO year
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Zoned = toZonedTime(jan4, timezone);
    const week1Monday = startOfISOWeek(jan4Zoned);
    const targetMonday = new Date(week1Monday);
    targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7);

    return fromZonedTime(
        setMilliseconds(setSeconds(setMinutes(setHours(targetMonday, 0), 0), 0), 0),
        timezone
    );
}

/** Format a date range for display, e.g. "Mar 3 – Mar 9, 2026". */
export function formatWeekRange(weekStart: string | Date, weekEnd: string | Date): string {
    const s = new Date(weekStart);
    const e = new Date(weekEnd);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
    const startStr = s.toLocaleDateString("en-US", opts);
    const endStr = e.toLocaleDateString("en-US", { ...opts, year: "numeric" });
    return `${startStr} – ${endStr}`;
}
