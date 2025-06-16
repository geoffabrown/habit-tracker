const express = require('express');
const cors = require('cors');
const { analyzeHabits, chatWithAI, generateAdminReport } = require('./habitAnalysis');
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Debug: Log when server starts
console.log('Server starting...');
console.log('Environment variables loaded:', {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    PORT: process.env.PORT
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/analyze', async (req, res) => {
    try {
        console.log('Received analyze request');
        const { habits } = req.body;
        
        if (!habits) {
            throw new Error('No habits data provided');
        }

        const analysis = await analyzeHabits(habits);
        res.json({ analysis });
    } catch (error) {
        console.error('Error in /api/analyze:', error);
        res.status(500).json({ 
            error: 'Failed to analyze habits',
            details: error.message 
        });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received chat request');
        const { message, habits } = req.body;
        
        if (!message) {
            throw new Error('No message provided');
        }

        if (!habits) {
            throw new Error('No habits data provided');
        }

        const response = await chatWithAI(message, habits);
        res.json({ response });
    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ 
            error: 'Failed to get AI response',
            details: error.message 
        });
    }
});

app.post('/api/admin/report', async (req, res) => {
    try {
        const { users } = req.body;
        console.log('Received request for admin report');
        console.log('Request body:', req.body);
        console.log('Number of users:', users?.length);
        console.log('Users data:', JSON.stringify(users, null, 2));

        if (!users || !Array.isArray(users) || users.length === 0) {
            console.error('Invalid users data received:', users);
            return res.status(400).json({ error: 'Invalid users data' });
        }

        const report = await generateAdminReport(users);
        console.log('Generated report successfully');
        res.json({ report });
    } catch (error) {
        console.error('Error generating admin report:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin users endpoint
app.get('/api/admin/users', async (req, res) => {
  try {
    console.log('Fetching all authenticated users...');
    const listUsersResult = await admin.auth().listUsers();
    console.log(`Found ${listUsersResult.users.length} users`);
    
    // Filter out any users that don't have an email
    const users = listUsersResult.users.filter(user => user.email);
    console.log(`Found ${users.length} users with email addresses`);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment variables loaded:', {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV
    });
}); 