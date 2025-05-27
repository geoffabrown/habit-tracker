import { useEffect, useState } from "react";

const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("darkMode") === "true"
    );

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    return (
        <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 dark:text-white text-sm"
            onClick={() => setDarkMode(!darkMode)}
        >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
    );
};

export default DarkModeToggle;
