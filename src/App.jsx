import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import HabitTracker from './components/HabitTracker';
import HabitLog from './components/HabitLog';
import HabitInsights from './components/HabitInsights';
import AdminReport from './components/AdminReport';
import MobileHabitView from './components/MobileHabitView';
import { useMediaQuery } from 'react-responsive';
import Login from './components/Login';
import { useDarkMode } from './hooks/useDarkMode';

const ADMIN_EMAIL = "geoffabrown@gmail.com";

function App() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('today');
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Ensure dark mode is applied globally
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Always use MobileHabitView for mobile, and pass navigation props
  if (isMobile) {
    // Debug indicator for mobile view
    return (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, background: 'yellow', color: 'black', fontWeight: 'bold', padding: '2px 8px', fontSize: 12 }}>
          MOBILE VIEW
        </div>
        {activeView === 'today' && <MobileHabitView user={user} onViewChange={setActiveView} />}
        {activeView === 'log' && <HabitLog user={user} />}
        {activeView === 'insights' && <HabitInsights user={user} />}
        {activeView === 'admin' && user.email === ADMIN_EMAIL && <AdminReport />}
        {!(activeView === 'today' || activeView === 'log' || activeView === 'insights' || (activeView === 'admin' && user.email === ADMIN_EMAIL)) && (
          <MobileHabitView user={user} onViewChange={setActiveView} />
        )}
      </>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Habit Tracker
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('tracker')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'tracker'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Tracker
            </button>
            <button
              onClick={() => setActiveView('log')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'log'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Log
            </button>
            <button
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'insights'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Insights
            </button>
            {user.email === ADMIN_EMAIL && (
              <button
                onClick={() => setActiveView('admin')}
                className={`px-4 py-2 rounded-lg ${
                  activeView === 'admin'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Admin
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeView === 'tracker' && <HabitTracker user={user} />}
          {activeView === 'log' && <HabitLog user={user} />}
          {activeView === 'insights' && <HabitInsights user={user} />}
          {activeView === 'admin' && user.email === ADMIN_EMAIL && <AdminReport />}
        </div>
      </div>
    </div>
  );
}

export default App; 