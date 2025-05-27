// src/App.js
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";
import Login from "./components/Login";
import HabitTracker from "./components/HabitTracker";
import DarkModeToggle from "./components/DarkModeToggle";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        return onAuthStateChanged(auth, setUser);
    }, []);

    if (!user) return <Login onLogin={() => { }} />;

    return (
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white p-4">

        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
                <button
                    onClick={() => signOut(auth)}
                    className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                >
                    Sign Out
                </button>
            </div>
            <DarkModeToggle />
            <HabitTracker user={user} />
            </div>
        </div>
    );
}

export default App;
