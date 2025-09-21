const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;


let consultations = [];


app.use(cors()); 
app.use(express.json()); 
app.post('/api/submit-consultation', (req, res) => {
  const newConsultation = {
    studentName: req.body.nameInput,
    studentId: req.body.IdInput,
    symptoms: req.body.symptomsInput,
    receivedAt: new Date(), 
    id: Date.now() 
  };

  console.log('Received new consultation:', newConsultation);
  
  consultations.unshift(newConsultation);

  res.status(201).json({ message: 'Consultation received successfully' });
});

app.get('/api/get-consultations', (req, res) => {
  res.status(200).json(consultations);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});