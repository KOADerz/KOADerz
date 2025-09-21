const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = './consultations.json';

// Middleware
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// GET all consultations
app.get('/api/get-consultations', (req, res) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.status(200).json(JSON.parse(data));
  });
});

// POST a new consultation from a student
app.post('/api/submit-consultation', (req, res) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    const consultations = JSON.parse(data);

    const newConsultation = {
      id: Date.now(),
      receivedAt: new Date(),
      studentName: req.body.nameInput,
      studentId: req.body.IdInput,
      symptoms: req.body.symptomsInput,
      status: 'pending',
      paymentStatus: 'n/a', // New field for payment tracking
      response: null,
      deliveryDetails: null
    };

    consultations.unshift(newConsultation);

    fs.writeFile(DB_FILE, JSON.stringify(consultations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.status(201).json({ message: 'Consultation received' });
    });
  });
});

// POST a doctor's response
app.post('/api/respond/:id', (req, res) => {
  const consultationId = parseInt(req.params.id);
  const { diagnosis, medicine, price } = req.body;

  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    let consultations = JSON.parse(data);
    const index = consultations.findIndex(c => c.id === consultationId);

    if (index === -1) return res.status(404).json({ message: 'Not found' });

    consultations[index].status = 'completed';
    consultations[index].paymentStatus = 'pending'; // Set payment as pending
    consultations[index].response = {
      diagnosis, medicine, price, respondedAt: new Date()
    };

    fs.writeFile(DB_FILE, JSON.stringify(consultations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.status(200).json({ message: 'Response submitted' });
    });
  });
});

// --- NEW ENDPOINT TO CONFIRM PAYMENT AND DELIVERY ---
app.post('/api/confirm-payment/:id', (req, res) => {
  const consultationId = parseInt(req.params.id);
  const { hostelType, hostelBlock, roomNumber } = req.body;

  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    let consultations = JSON.parse(data);
    const index = consultations.findIndex(c => c.id === consultationId);
    
    if (index === -1) return res.status(404).json({ message: 'Not found' });

    consultations[index].paymentStatus = 'paid';
    consultations[index].deliveryDetails = {
      hostelType, hostelBlock, roomNumber
    };

    fs.writeFile(DB_FILE, JSON.stringify(consultations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.status(200).json({ message: 'Payment confirmed' });
    });
  });
});


app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});