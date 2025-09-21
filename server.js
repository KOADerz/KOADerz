const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Import the File System module

const app = express();
const PORT = 3000;
const DB_FILE = './consultations.json'; // Path to our JSON file

// Middleware
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// 1. Endpoint to RECEIVE a new consultation
app.post('/api/submit-consultation', (req, res) => {
  // Read the existing data from the file
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading from database file:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    const consultations = JSON.parse(data); // Convert JSON string to an array

    const newConsultation = {
      studentName: req.body.nameInput,
      studentId: req.body.IdInput,
      symptoms: req.body.symptomsInput,
      receivedAt: new Date(),
      id: Date.now()
    };

    // Add the new consultation to the beginning of the array
    consultations.unshift(newConsultation);

    // Write the updated array back to the file
    fs.writeFile(DB_FILE, JSON.stringify(consultations, null, 2), (err) => {
      if (err) {
        console.error('Error writing to database file:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      console.log('New consultation saved to database:', newConsultation);
      res.status(201).json({ message: 'Consultation received successfully' });
    });
  });
});

// 2. Endpoint to SEND all consultations
app.get('/api/get-consultations', (req, res) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading from database file:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(JSON.parse(data));
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});