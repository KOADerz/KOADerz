
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = './consultations.json';

app.use(cors());
app.use(express.json());


app.get('/api/get-consultations', (req, res) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json(JSON.parse(data));
  });
});

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
      response: null
    };

    consultations.unshift(newConsultation);

    fs.writeFile(DB_FILE, JSON.stringify(consultations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      // Log to the terminal, not the browser console
      console.log('New consultation saved:', newConsultation.studentName);
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

    if (index === -1) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultations[index].status = 'completed';
    consultations[index].response = {
      diagnosis,
      medicine,
      price,
      respondedAt: new Date()
    };

    fs.writeFile(DB_FILE, JSON.stringify(consultations, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      console.log('Response submitted for:', consultations[index].studentName);
      res.status(200).json({ message: 'Response submitted successfully' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});