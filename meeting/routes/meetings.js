const express = require('express');
const Meeting = require('../models/Meeting');
const router = express.Router();
const moment = require('moment');

// Create a meeting
router.post('/', async (req, res) => {
    try {
        const meeting = new Meeting(req.body);
        await meeting.save();
        res.status(201).json(meeting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all meetings for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const meetings = await Meeting.find({ userId: req.params.userId });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get available slots based on scheduled meetings
router.get('/available-slots/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        // Validate date format
        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const meetings = await Meeting.find({ date });
        const bookedSlots = meetings
            .map(meeting => ({
                start: moment(`${date}T${meeting.startTime}`),
                end: moment(`${date}T${meeting.endTime}`),
            }))
            .sort((a, b) => a.start.valueOf() - b.start.valueOf()); // Sort by start time

        const availableSlots = calculateAvailableSlots(bookedSlots);
        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

function calculateAvailableSlots(bookedSlots) {
    const businessHours = [
        { start: "09:00", end: "17:00" }
    ];

    let availableSlots = [];

    businessHours.forEach(hour => {
        let start = moment(hour.start, "HH:mm");
        let end = moment(hour.end, "HH:mm");

        // Initialize with business hours start
        let currentStart = start.clone();

        // Handle case with no bookings
        if (bookedSlots.length === 0) {
            availableSlots.push({
                start: start.format("HH:mm"),
                end: end.format("HH:mm")
            });
            return availableSlots;
        }

        // Process booked slots
        bookedSlots.forEach(slot => {
            // Validate if slot is within business hours
            if (slot.start.isBefore(end) && slot.end.isAfter(start)) {
                if (slot.start.isAfter(currentStart)) {
                    availableSlots.push({
                        start: currentStart.format("HH:mm"),
                        end: slot.start.format("HH:mm")
                    });
                }
                currentStart = moment.max(currentStart, slot.end);
            }
        });

        // Add remaining time slot if exists
        if (currentStart.isBefore(end)) {
            availableSlots.push({
                start: currentStart.format("HH:mm"),
                end: end.format("HH:mm")
            });
        }
    });

    return availableSlots;
}

module.exports = router;

