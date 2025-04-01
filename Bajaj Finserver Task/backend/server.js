const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// GET Endpoint
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        operation_code: 1
    });
});

// POST Endpoint
app.post('/bfhl', (req, res) => {
    const { name, dob, email, roll_number, data } = req.body;

    // Input validation
    if (!name || !dob || !email || !roll_number || !data || !Array.isArray(data)) {
        return res.status(400).json({
            is_success: false,
            message: "Invalid input. Ensure 'name', 'dob', 'email', 'roll_number', and 'data' (as an array) are provided."
        });
    }

    const numbers = [];
    const alphabets = [];
    let highestLowercaseAlphabet = null;

    // Processing the data
    data.forEach((item) => {
        if (!isNaN(item)) {
            numbers.push(item);
        } else if (typeof item === 'string') {
            alphabets.push(item);
            if (item === item.toLowerCase() && (!highestLowercaseAlphabet || item > highestLowercaseAlphabet)) {
                highestLowercaseAlphabet = item;
            }
        }
    });

    // Responding with dynamic user data and processed information
    res.status(200).json({
        is_success: true,
        user_id: `${name.replace(/ /g, "_").toLowerCase()}_${dob}`,
        email: email,
        roll_number: roll_number,
        numbers: numbers,
        alphabets: alphabets,
        highest_lowercase_alphabet: highestLowercaseAlphabet ? [highestLowercaseAlphabet] : []
    });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
