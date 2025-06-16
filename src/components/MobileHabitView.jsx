import React, { useState } from 'react';
import { format } from 'date-fns';
import { useHabits } from '../hooks/useHabits';
import HabitLog from './HabitLog';
import HabitInsights from './HabitInsights';
import AdminReport from './AdminReport';
import { useDarkMode } from '../hooks/useDarkMode';

const ADMIN_EMAIL = "geoffabrown@gmail.com";

const MobileHabitView = ({ user, onViewChange }) => {
  const { habits, toggleHabit, addNote } = useHabits(user.uid);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleToggleHabit = async (habitId) => {
    await toggleHabit(habitId);
  };

  const handleShowNote = (habit) => {
    setSelectedHabit(habit);
    setNoteInput(habit.days?.[format(new Date(), "yyyy-MM-dd")]?.note || "");
    setShowNoteInput(true);
  };

  const handleSubmitNote = async () => {
    if (selectedHabit) {
      await addNote(selectedHabit.id, noteInput);
      setShowNoteInput(false);
      setNoteInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {format(new Date(), "EEEE, MMMM d")}
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="p-4 space-y-4">
        {habits.map((habit) => {
          const today = format(new Date(), "yyyy-MM-dd");
          const isCompleted = habit.days?.[today]?.completed || false;
          const hasNote = habit.days?.[today]?.note;

          return (
            <div
              key={habit.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {habit.title}
                  </h3>
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {isCompleted ? "✓" : "+"}
                  </button>
                </div>
                
                {/* Note Button */}
                <button
                  onClick={() => handleShowNote(habit)}
                  className={`mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    hasNote
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {hasNote ? "Edit Note" : "Add Note"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around p-2">
          <button
            onClick={() => onViewChange("today")}
            className="flex-1 py-3 text-center text-blue-600 dark:text-blue-400 font-medium"
          >
            Today
          </button>
          <button
            onClick={() => onViewChange("log")}
            className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400"
          >
            Log
          </button>
          <button
            onClick={() => onViewChange("insights")}
            className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400"
          >
            Insights
          </button>
          {user.email === ADMIN_EMAIL && (
            <button
              onClick={() => onViewChange("admin")}
              className="flex-1 py-3 text-center text-gray-600 dark:text-gray-400"
            >
              Admin
            </button>
          )}
        </div>
      </div>

      {/* Note Input Modal */}
      {showNoteInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full p-4 rounded-t-xl">
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add a note..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNoteInput(false)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNote}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg"
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

export default MobileHabitView; 