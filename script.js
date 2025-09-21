document.addEventListener('DOMContentLoaded', () => {

  const studentForm = document.getElementById('studentForm');
  const messageDiv = document.getElementById('formMessage');

  studentForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const formData = new FormData(studentForm);
    const dataObject = Object.fromEntries(formData.entries());


    messageDiv.textContent = 'Submitting your request...';
    messageDiv.style.color = '#333';

    try {
      const response = await fetch('http://localhost:3000/api/submit-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataObject),
      });

      if (response.ok) {
        messageDiv.textContent = 'Your consultation request has been sent successfully!';
        messageDiv.style.color = 'green';
        studentForm.reset();
      } else {
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.style.color = 'red';
      }
    } catch (error) {
      console.error('Submission Error:', error);
      messageDiv.textContent = 'Could not connect to the server. Please try again later.';
      messageDiv.style.color = 'red';
    }
  });

});