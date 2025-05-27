// src/components/HabitTracker.jsx
import React, { useState } from "react";
import { useHabits } from "../hooks/useHabits";
import { format } from "date-fns";
import { parseISO } from "date-fns";
import { calculateStreaks } from "../utils/streakUtils";
import { subDays } from "date-fns";



const HabitTracker = ({ user }) => {
    const { habits, toggleDay, createHabit } = useHabits(user.uid);
    const [newHabit, setNewHabit] = useState("");

    const today = new Date();
    const todayKey = format(today, "yyyy-MM-dd");
    const daysArray = Array.from({ length: 30 }, (_, i) =>
        format(subDays(today, 29 - i), "yyyy-MM-dd")
    );

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
                                const done = !!habit.days?.[dateKey]; // should now be true/false
                                const isToday = dateKey === todayKey;
                                //console.log("Rendering habit:", habit.title, habit.days);
                                //console.log("Checking day:", dateKey, "→", habit.days?.[dateKey]);
                                console.log(`${habit.title} | ${dateKey} →`, done);
                                return (
                                    
                                    <button
                                        key={dateKey}
                                        className={`w-8 h-8 text-xs rounded transition-all duration-200
    ${done
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            }
    ${isToday ? "ring-2 ring-blue-400" : ""}
  `}
                                        title={dateKey}
                                        onClick={() => toggleDay(habit.id, dateKey)}
                                    >
                                        {new Date(dateKey).getDate()}
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
