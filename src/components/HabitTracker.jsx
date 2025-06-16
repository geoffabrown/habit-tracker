// src/components/HabitTracker.jsx
import React, { useState } from "react";
import { useHabits } from "../hooks/useHabits";
import { format, parseISO, subDays } from "date-fns";
import { calculateStreaks } from "../utils/streakUtils";

const HabitTracker = ({ user }) => {
    const { habits, toggleDay, updateNote, createHabit } = useHabits(user.uid);
    const [newHabit, setNewHabit] = useState("");
    const [selectedDay, setSelectedDay] = useState(null);
    const [noteText, setNoteText] = useState("");

    const today = new Date();
    const todayKey = format(today, "yyyy-MM-dd");

    const daysArray = Array.from({ length: 30 }, (_, i) =>
        format(subDays(today, 29 - i), "yyyy-MM-dd")
    );

    const handleToggle = async (el, habitId, dateKey) => {
        const currentNote = habits
            .find(h => h.id === habitId)?.days?.[dateKey]?.note || "";
        await toggleDay(habitId, dateKey, currentNote);
        spawnSparkles(el);
    };

    const handleNoteClick = (habitId, dateKey) => {
        const currentNote = habits
            .find(h => h.id === habitId)?.days?.[dateKey]?.note || "";
        setSelectedDay({ habitId, dateKey });
        setNoteText(currentNote);
    };

    const handleNoteSave = async () => {
        if (selectedDay) {
            await updateNote(selectedDay.habitId, selectedDay.dateKey, noteText);
            setSelectedDay(null);
            setNoteText("");
        }
    };

    function spawnSparkles(container) {
        const { width, height } = container.getBoundingClientRect();

        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';

            const dx = (Math.random() - 0.5) * 80;
            const dy = (Math.random() - 0.5) * 80;
            sparkle.style.setProperty('--dx', `${dx}px`);
            sparkle.style.setProperty('--dy', `${dy}px`);

            sparkle.style.left = Math.random() * width + 'px';
            sparkle.style.top = Math.random() * height + 'px';

            container.appendChild(sparkle);
            sparkle.addEventListener('animationend', () => sparkle.remove());
        }
    }

    const handleCreate = () => {
        if (newHabit.trim()) {
            createHabit(newHabit.trim());
            setNewHabit("");
        }
    };

    return (
        <div className="space-y-4">
            <div className="mb-4 flex gap-2">
                <input
                    className="border px-2 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="New habit name"
                />
                <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={handleCreate}
                >
                    Add Habit
                </button>
            </div>

            {habits.map((habit) => {
                const { currentStreak, longestStreak } = calculateStreaks(
                    Object.fromEntries(
                        Object.entries(habit.days || {}).map(([key, value]) => [
                            key,
                            value.completed
                        ])
                    )
                );

                return (
                    <div key={habit.id} className="mb-6">
                        <h3 className="font-semibold text-lg">
                            {habit.title}{" "}
                            <span className="text-sm text-gray-500 ml-2">
                                🔥 {currentStreak} day streak • 🏆 {longestStreak} longest
                            </span>
                        </h3>
                        <div className="flex gap-1 overflow-x-auto">
                            {daysArray.map((dateKey) => {
                                const dayData = habit.days?.[dateKey] || { completed: false, note: "" };
                                const done = dayData.completed;
                                const isToday = dateKey === todayKey;
                                const hasNote = dayData.note?.trim().length > 0;

                                let dayNumber = "";
                                try {
                                    dayNumber = parseISO(dateKey).getDate();
                                } catch {
                                    dayNumber = "?";
                                }

                                return (
                                    <div key={dateKey} className="flex flex-col items-center">
                                        <button
                                            title={dateKey}
                                            onClick={(e) => handleToggle(e.currentTarget, habit.id, dateKey)}
                                            className={`
                                                relative
                                                w-8 h-8
                                                text-xs rounded
                                                transition-all duration-200
                                                ${done
                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                }
                                                ${isToday ? "ring-2 ring-blue-400" : ""}
                                            `}
                                        >
                                            {done ? "✓" : dayNumber}
                                        </button>
                                        <button
                                            onClick={() => handleNoteClick(habit.id, dateKey)}
                                            className={`
                                                mt-1 text-xs px-1 py-0.5 rounded
                                                transition-colors duration-200
                                                ${hasNote 
                                                    ? "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                                                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }
                                            `}
                                            title={dayData.note || "Add note"}
                                        >
                                            {hasNote ? "📝" : "✎"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {selectedDay && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-2">
                            Note for {format(parseISO(selectedDay.dateKey), "MMMM d, yyyy")}
                        </h3>
                        <textarea
                            className="w-full h-32 p-2 border rounded mb-2 bg-white text-black dark:bg-gray-700 dark:text-white"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your notes here..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => {
                                    setSelectedDay(null);
                                    setNoteText("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={handleNoteSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;
