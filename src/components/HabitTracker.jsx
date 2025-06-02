// src/components/HabitTracker.jsx
import React, { useState } from "react";
import { useHabits } from "../hooks/useHabits";
import { format, parseISO, subDays } from "date-fns";
import { calculateStreaks } from "../utils/streakUtils";


const HabitTracker = ({ user }) => {
    const { habits, toggleDay, createHabit } = useHabits(user.uid);
    const [newHabit, setNewHabit] = useState("");

    const today = new Date(); // full Date object
    const todayKey = format(today, "yyyy-MM-dd"); // "2025-05-27"

    const daysArray = Array.from({ length: 30 }, (_, i) =>
        format(subDays(today, 29 - i), "yyyy-MM-dd")
    );

    
    const handleToggle = async (el, habitId, dateKey) => {
        // 1. update Firestore
        await toggleDay(habitId, dateKey);

        // 2. spawn sparkles inside `el`
        spawnSparkles(el);
    };
     
    // 3. the sparkle‐spawning helper
    function spawnSparkles(container) {
        const { width, height } = container.getBoundingClientRect();

        for (let i = 0; i < 12; i++) {              // bump count for more bursts
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';

            // pick a random trajectory up to ±40px
            const dx = (Math.random() - 0.5) * 80;
            const dy = (Math.random() - 0.5) * 80;
            sparkle.style.setProperty('--dx', `${dx}px`);
            sparkle.style.setProperty('--dy', `${dy}px`);

            // start each in a random spot inside the button
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
                const { currentStreak, longestStreak } = calculateStreaks(habit.days);

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
                                const done = !!habit.days?.[dateKey];
                                const isToday = dateKey === todayKey;

                                // parse out the day number
                                let dayNumber = "";
                                try {
                                    dayNumber = parseISO(dateKey).getDate();
                                } catch {
                                    dayNumber = "?";
                                }

                                return (
                                    <button
                                        key={dateKey}
                                        title={dateKey}
                                        onClick={(e) => handleToggle(e.currentTarget, habit.id, dateKey)}
                                        className={`
        relative        /* for sparkles */
        w-8 h-8         /* fixed size */
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
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HabitTracker;
