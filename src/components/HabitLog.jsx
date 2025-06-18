import React from "react";
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { useHabits } from "../hooks/useHabits";

const HabitLog = ({ user, onViewChange }) => {
    const { habits } = useHabits(user.uid);

    // Group entries by date
    const entriesByDate = habits.reduce((acc, habit) => {
        Object.entries(habit.days || {}).forEach(([dateKey, data]) => {
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push({
                habitId: habit.id,
                habitTitle: habit.title,
                ...data
            });
        });
        return acc;
    }, {});

    // Sort dates in reverse chronological order
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

    const formatDateHeader = (dateKey) => {
        const date = parseISO(dateKey);
        if (isToday(date)) {
            return "Today";
        } else if (isYesterday(date)) {
            return "Yesterday";
        } else if (isThisWeek(date)) {
            return format(date, "EEEE"); // Day name
        } else if (isThisMonth(date)) {
            return format(date, "EEEE, MMMM d"); // Day name, Month day
        } else {
            return format(date, "MMMM d, yyyy"); // Full date
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-4 pb-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Habit Log</h2>
                <div className="space-y-6">
                    {sortedDates.map((dateKey) => (
                        <div key={dateKey} className="relative">
                            {/* Date header */}
                            <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 py-2 z-10">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatDateHeader(dateKey)}
                                </h3>
                            </div>

                            {/* Entries for this date */}
                            <div className="space-y-3">
                                {entriesByDate[dateKey].map((entry) => (
                                    <div 
                                        key={`${dateKey}-${entry.habitId}`}
                                        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Completion status */}
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                entry.completed 
                                                    ? "bg-green-500 text-white" 
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            }`}>
                                                {entry.completed ? "✓" : ""}
                                            </div>

                                            {/* Habit title and note */}
                                            <div className="flex-grow">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {entry.habitTitle}
                                                </h4>
                                                {entry.note && (
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.note}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Time */}
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                {format(parseISO(dateKey), "h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-around p-2">
                    <button
                        onClick={() => onViewChange("today")}
                        className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400 font-medium"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => onViewChange("log")}
                        className="flex-1 py-3 text-center text-blue-600 dark:text-blue-400 font-medium"
                    >
                        Log
                    </button>
                    <button
                        onClick={() => onViewChange("insights")}
                        className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400"
                    >
                        Insights
                    </button>
                    {user.email === "geoffabrown@gmail.com" && (
                        <button
                            onClick={() => onViewChange("admin")}
                            className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400"
                        >
                            Admin
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HabitLog; 