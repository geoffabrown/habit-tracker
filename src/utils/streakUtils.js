import { format, subDays, isSameDay } from "date-fns";

export function calculateStreaks(daysMap) {
    if (!daysMap) return { currentStreak: 0, longestStreak: 0 };

    const sortedDates = Object.keys(daysMap)
        .filter((date) => daysMap[date]) // only completed days
        .sort();

    let longest = 0;
    let current = 0;
    let tempStreak = 0;

    let prevDate = null;
    for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        if (
            prevDate &&
            isSameDay(date, subDays(prevDate, -1)) // next day after prev
        ) {
            tempStreak += 1;
        } else {
            tempStreak = 1;
        }
        longest = Math.max(longest, tempStreak);
        prevDate = date;
    }

    // Check current streak: count back from today
    let today = new Date();
    let streakCount = 0;
    while (true) {
        const key = format(today, "yyyy-MM-dd");
        if (daysMap[key]) {
            streakCount++;
            today = subDays(today, 1);
        } else {
            break;
        }
    }

    return {
        currentStreak: streakCount,
        longestStreak: longest,
    };
}
