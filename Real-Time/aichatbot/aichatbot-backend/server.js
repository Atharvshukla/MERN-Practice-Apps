const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const API_KEY = 'AIzaSyCkRR1yOAUU7W36v19bfgxvDcZ1Tz-gz3I';
const genAI = new GoogleGenerativeAI(API_KEY);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Server is working!',
        status: 'API Connected'
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    console.log('=== Chat Request Started ===');
    
    try {
        // Log the incoming message
        const { message } = req.body;
        console.log('Received message:', message);

        // Configure the model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        // Create the prompt
        const prompt = {
            text: message
        };

        // Generate the content
        const result = await model.generateContent([prompt]);
        console.log('Generation completed');

        // Get the first response
        const response = await result.response;
        console.log('Response received');

        // Get the text
        const responseText = response.text();
        console.log('Final text:', responseText);

        // Send the response
        return res.status(200).json({
            response: responseText
        });

    } catch (error) {
        console.error('Error details:', error);
        return res.status(500).json({
            error: 'Failed to generate response',
            details: error.message
        });
    }
});

// Add error handler for uncaught errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

const PORT = 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Gemini API initialized');
});