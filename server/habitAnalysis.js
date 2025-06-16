const OpenAI = require('openai');
require('dotenv').config();

// Debug: Check if API key is loaded
console.log('API Key available:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const analyzeHabits = async (habits) => {
    if (!habits || !Array.isArray(habits) || habits.length === 0) {
        throw new Error('No habits data provided for analysis');
    }

    const prompt = `Analyze the following habit data and provide insights about patterns, consistency, and suggestions for improvement. 
    Focus on completion rates, streaks, and any notable patterns in the notes. Be encouraging and constructive in your feedback.

    Habit Data:
    ${JSON.stringify(habits, null, 2)}

    Please provide a detailed analysis in the following format:
    1. Overall Progress
    2. Most Consistent Habits
    3. Areas for Improvement
    4. Suggestions for Better Results
    5. Notable Patterns in Notes`;

    try {
        console.log('Attempting to analyze habits...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 1000
        });

        if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Detailed error in analyzeHabits:', error);
        if (error.response) {
            console.error('OpenAI API Error Response:', error.response.data);
        }
        throw new Error(`Failed to analyze habits: ${error.message}`);
    }
};

const chatWithAI = async (message, habits) => {
    if (!message || typeof message !== 'string') {
        throw new Error('Invalid message provided');
    }

    if (!habits || !Array.isArray(habits)) {
        throw new Error('Invalid habits data provided');
    }

    const prompt = `You are a helpful habit coach analyzing the following habit data. 
    The user has asked: "${message}"
    
    Habit Data:
    ${JSON.stringify(habits, null, 2)}

    Please provide a helpful, encouraging response that addresses their question while considering their actual habit data. 
    Be specific about their habits and provide actionable advice when appropriate.`;

    try {
        console.log('Attempting to chat with AI...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 500
        });

        if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Detailed error in chatWithAI:', error);
        if (error.response) {
            console.error('OpenAI API Error Response:', error.response.data);
        }
        throw new Error(`Failed to get response: ${error.message}`);
    }
};

const generateAdminReport = async (users, selectedUserId) => {
    if (!users || !Array.isArray(users)) {
        throw new Error('Invalid users data provided');
    }

    // Filter users if a specific user is selected
    const filteredUsers = selectedUserId 
        ? users.filter(user => user.id === selectedUserId)
        : users;

    if (filteredUsers.length === 0) {
        throw new Error('No user data available for analysis');
    }

    const prompt = `Analyze the following habit data for ${selectedUserId ? 'a specific user' : 'all users'} and provide a comprehensive report.
    Focus on patterns, consistency, and group dynamics. Be encouraging and constructive in your feedback.

    User Data:
    ${JSON.stringify(filteredUsers, null, 2)}

    Please provide a detailed report in the following format:
    1. Overall Group Progress
    2. Individual User Highlights
    3. Common Patterns and Trends
    4. Areas for Group Improvement
    5. Suggestions for Better Results
    6. Notable Achievements
    7. Recommendations for Next Steps

    For each user, analyze their habits and provide specific insights about their progress and areas for improvement.`;

    try {
        console.log('Generating admin report...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 2000
        });

        if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Detailed error in generateAdminReport:', error);
        if (error.response) {
            console.error('OpenAI API Error Response:', error.response.data);
        }
        throw new Error(`Failed to generate admin report: ${error.message}`);
    }
};

module.exports = { analyzeHabits, chatWithAI, generateAdminReport }; 