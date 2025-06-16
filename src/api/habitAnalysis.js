import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY
});

export const analyzeHabits = async (habits) => {
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
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 1000
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error analyzing habits:', error);
        throw new Error('Failed to analyze habits');
    }
};

export const chatWithAI = async (message, habits) => {
    const prompt = `You are a helpful habit coach analyzing the following habit data. 
    The user has asked: "${message}"
    
    Habit Data:
    ${JSON.stringify(habits, null, 2)}

    Please provide a helpful, encouraging response that addresses their question while considering their actual habit data. 
    Be specific about their habits and provide actionable advice when appropriate.`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 500
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error in chat:', error);
        throw new Error('Failed to get response');
    }
}; 