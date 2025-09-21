document.addEventListener('DOMContentLoaded', () => {
  const studentForm = document.getElementById('studentForm');
  const messageDiv = document.getElementById('formMessage');
  const consultationsGrid = document.getElementById('consultationsGrid');

  const createConsultationCard = (consultation) => {
    const card = document.createElement('div');
    card.classList.add('consultation-card');

    const submissionTime = new Date(consultation.receivedAt).toLocaleString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    card.innerHTML = `
      <h3 class="consultation-title">${consultation.symptoms}</h3>
      <p class="consultation-time">${submissionTime}</p>
      <p class="consultation-status">Status: Pending doctor's response</p>
    `;
    return card;
  };
  const loadPastConsultations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/get-consultations');
      const consultations = await response.json();
      
      consultationsGrid.innerHTML = ''; 
      consultations.forEach(consultation => {
        const card = createConsultationCard(consultation);
        consultationsGrid.appendChild(card); 
      });
    } catch (error) {
      console.error('Could not load past consultations:', error);
    }
  };

  
  studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(studentForm);
    const dataObject = Object.fromEntries(formData.entries());
    messageDiv.textContent = 'Submitting your request...';

    try {
      const response = await fetch('http://localhost:3000/api/submit-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObject),
      });

      if (response.ok) {
        messageDiv.textContent = 'Your request has been sent successfully!';
        messageDiv.style.color = 'green';
        
        
        const tempConsultationData = { ...dataObject, symptoms: dataObject.symptomsInput, receivedAt: new Date() };
        const newCard = createConsultationCard(tempConsultationData);
        consultationsGrid.prepend(newCard);

        studentForm.reset();
      } else {
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.style.color = 'red';
      }
    } catch (error) {
      console.error('Submission Error:', error);
      messageDiv.textContent = 'Could not connect to the server.';
      messageDiv.style.color = 'red';
    }
  });

 
  loadPastConsultations();
});