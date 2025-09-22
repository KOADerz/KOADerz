document.addEventListener('DOMContentLoaded', () => {
  const studentForm = document.getElementById('studentForm');
  const messageDiv = document.getElementById('formMessage');
  const consultationsGrid = document.getElementById('consultationsGrid');

  const paymentOverlay = document.getElementById('payment-modal-overlay');
  const paymentForm = document.getElementById('payment-form');
  const paymentCancelBtn = document.getElementById('payment-cancel-btn');
  const paymentConsultationIdInput = document.getElementById('payment-consultation-id');

  const createConsultationCard = (consultation) => {
    const card = document.createElement('div');
    card.classList.add('consultation-card');
    card.dataset.id = consultation.id; 
    const submissionTime = new Date(consultation.receivedAt).toLocaleString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let statusHTML = '';

    if (consultation.status === 'pending') {

      statusHTML = `<p class="consultation-status">Status: Pending doctor's response</p>`;
    } else if (consultation.status === 'completed' && consultation.paymentStatus === 'pending') {
  
      statusHTML = `
        <div class="doctor-response">
          <strong>Diagnosis:</strong> ${consultation.response.diagnosis}<br>
          <strong>Medicine:</strong> ${consultation.response.medicine}<br>
          <strong>Fee:</strong> ₹${consultation.response.price}
        </div>
        <button class="payment-btn">Proceed to Payment and Delivery</button>
      `;
    } else if (consultation.paymentStatus === 'paid') {
 
      statusHTML = `
        <div class="doctor-response">
          <strong>Diagnosis:</strong> ${consultation.response.diagnosis}<br>
          <strong>Medicine:</strong> ${consultation.response.medicine}<br>
          <strong>Fee:</strong> ₹${consultation.response.price}
        </div>
        <div class="final-status">
          <p>✅ Payment Successful</p>
          <p>🚚 Your medicine is being prepared for delivery.</p>
        </div>
      `;
    }

    card.innerHTML = `
      <h3 class="consultation-title">${consultation.symptoms}</h3>
      <p class="consultation-time">${submissionTime}</p>
      ${statusHTML}
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

  const openPaymentModal = (consultation) => {
    paymentConsultationIdInput.value = consultation.id;
    paymentOverlay.style.display = 'flex';
  };
  const closePaymentModal = () => {
    paymentOverlay.style.display = 'none';
    paymentForm.reset();
  };
  
  consultationsGrid.addEventListener('click', (event) => {
    if (event.target.classList.contains('payment-btn')) {
      const card = event.target.closest('.consultation-card');
      const consultationId = card.dataset.id;
      openPaymentModal({ id: consultationId });
    }
  });
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
        loadPastConsultations(); 
        studentForm.reset();
      } else {
        messageDiv.textContent = 'An error occurred.';
        messageDiv.style.color = 'red';
      }
    } catch (error) {
      console.error('Submission Error:', error);
      messageDiv.textContent = 'Could not connect to the server.';
      messageDiv.style.color = 'red';
    }
  });

  paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = paymentConsultationIdInput.value;
    const deliveryData = {
      hostelType: document.getElementById('hostel-type').value,
      hostelBlock: document.getElementById('hostel-block').value,
      roomNumber: document.getElementById('room-number').value,
    };
    
    try {
      const response = await fetch(`http://localhost:3000/api/confirm-payment/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData),
      });

      if (response.ok) {
        closePaymentModal();
        loadPastConsultations(); 
      } else {
        alert('Payment confirmation failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment Error:', error);
    }
  });

  paymentCancelBtn.addEventListener('click', closePaymentModal);

  loadPastConsultations();
});