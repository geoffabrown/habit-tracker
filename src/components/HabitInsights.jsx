import React, { useState, useRef, useEffect } from "react";
import { useHabits } from "../hooks/useHabits";
import { format, parseISO, subDays } from "date-fns";

const HabitInsights = ({ user }) => {
    const { habits } = useHabits(user.uid);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const analyzeHabits = async () => {
        setIsLoading(true);
        try {
            // Prepare habit data for analysis
            const habitData = habits.map(habit => ({
                title: habit.title,
                days: Object.entries(habit.days || {}).map(([date, data]) => ({
                    date,
                    completed: data.completed,
                    note: data.note
                }))
            }));

            console.log('Sending habit data for analysis:', habitData);

            const response = await fetch('http://localhost:3001/api/analyze-habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    habits: habitData,
                    userId: user.uid
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to get insights');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.insights }]);
        } catch (error) {
            console.error('Error getting insights:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Error: ${error.message}. Please try again.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        setIsLoading(true);
        try {
            console.log('Sending chat message:', userMessage);

            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    habits: habits,
                    userId: user.uid
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error getting response:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Error: ${error.message}. Please try again.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Insights</h2>
                <button
                    onClick={analyzeHabits}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {isLoading ? "Analyzing..." : "Get Insights"}
                </button>
            </div>

            <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <p>Ask me about your habits or click "Get Insights" for an analysis.</p>
                        <p className="mt-2">Try questions like:</p>
                        <ul className="mt-2 space-y-1">
                            <li>"What's my most consistent habit?"</li>
                            <li>"How can I improve my morning routine?"</li>
                            <li>"What patterns do you notice in my habits?"</li>
                        </ul>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <p className="text-gray-900 dark:text-white">{msg.content}</p>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
                        <p>AI is thinking...</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your habits..."
                    className="flex-grow p-2 border rounded bg-white dark:bg-gray-800 dark:text-white"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default HabitInsights; 