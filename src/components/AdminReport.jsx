import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/config";

const ADMIN_EMAIL = "geoffabrown@gmail.com";

export default function AdminReport() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [report, setReport] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('all');
    const [userDetails, setUserDetails] = useState({});

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching users...');
            
            // Get all authenticated users from the server
            const response = await fetch('http://localhost:3001/api/admin/users');
            if (!response.ok) {
                let msg = 'Failed to fetch authenticated users';
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  msg += ' (Are you running the backend server? This will not work in production unless the backend is deployed and the URL is updated.)';
                }
                throw new Error(msg);
            }
            const { users: authUsers } = await response.json();
            console.log('Fetched authenticated users:', authUsers.length);
            
            // Create a map to store user habits and details
            const userHabitsMap = new Map();
            const userDetailsMap = new Map();
            
            // Process each authenticated user
            for (const authUser of authUsers) {
                const userId = authUser.uid;
                console.log('Processing user:', userId, authUser);
                
                // Store user details
                userDetailsMap.set(userId, {
                    email: authUser.email,
                    displayName: authUser.displayName || authUser.email,
                    createdAt: authUser.metadata.creationTime,
                    lastLogin: authUser.metadata.lastSignInTime
                });
                
                // Initialize empty habits array for this user
                userHabitsMap.set(userId, []);
                
                // Get habits from user's subcollection
                const userHabitsSnapshot = await getDocs(collection(db, 'users', userId, 'habits'));
                console.log(`Found ${userHabitsSnapshot.size} habits for user ${userId}`);
                
                if (userHabitsSnapshot.size > 0) {
                    const habits = userHabitsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    userHabitsMap.set(userId, habits);
                }
            }
            
            // Also check the top-level habits collection for backward compatibility
            const topLevelHabitsSnapshot = await getDocs(collection(db, 'habits'));
            console.log('Fetched top-level habits:', topLevelHabitsSnapshot.size);
            
            topLevelHabitsSnapshot.forEach(doc => {
                const habit = doc.data();
                if (habit.userId) {
                    if (!userHabitsMap.has(habit.userId)) {
                        userHabitsMap.set(habit.userId, []);
                    }
                    userHabitsMap.get(habit.userId).push({
                        id: doc.id,
                        ...habit
                    });
                }
            });
            
            // Convert map to array of user objects, including users with no habits
            const usersList = Array.from(userDetailsMap.entries()).map(([userId, details]) => ({
                id: userId,
                habits: userHabitsMap.get(userId) || [],
                ...details
            }));
            
            console.log('Final processed users:', usersList);
            setUsers(usersList);
            setUserDetails(userDetailsMap);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(`Failed to fetch users: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Generating report for users:', users);
            
            // Filter users if a specific user is selected
            const usersToReport = selectedUserId === 'all' 
                ? users 
                : users.filter(user => user.id === selectedUserId);
            
            const response = await fetch('http://localhost:3001/api/admin/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ users: usersToReport }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate report');
            }

            const data = await response.json();
            console.log('Received report:', data);
            setReport(data.report);
        } catch (error) {
            console.error('Error generating report:', error);
            setError(`Failed to generate report: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser?.email === ADMIN_EMAIL) {
            fetchUsers();
        } else {
            setError('Unauthorized access');
        }
    }, []);

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Admin Report</h2>
            
            <div className="mb-4">
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Refresh Users'}
                </button>
            </div>

            {users.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <label className="font-medium text-gray-900 dark:text-white">Select User:</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Users</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {userDetails.get(user.id)?.email || user.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 text-gray-900 dark:text-white">User Details:</h3>
                        {selectedUserId === 'all' ? (
                            <p className="text-gray-900 dark:text-white">Showing all {users.length} users</p>
                        ) : (
                            <div className="text-gray-900 dark:text-white">
                                <p><strong>Email:</strong> {userDetails.get(selectedUserId)?.email}</p>
                                <p><strong>Display Name:</strong> {userDetails.get(selectedUserId)?.displayName}</p>
                                <p><strong>Created:</strong> {new Date(userDetails.get(selectedUserId)?.createdAt).toLocaleString()}</p>
                                <p><strong>Last Login:</strong> {new Date(userDetails.get(selectedUserId)?.lastLogin).toLocaleString()}</p>
                                <p><strong>Habits:</strong> {users.find(u => u.id === selectedUserId)?.habits.length || 0}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            ) : (
                <p className="text-gray-900 dark:text-white">No users found</p>
            )}

            {report && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Report</h3>
                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">{report}</pre>
                </div>
            )}
        </div>
    );
} 