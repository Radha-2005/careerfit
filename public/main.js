document.addEventListener("DOMContentLoaded", () => {
    // Bubble Animation
    const bubblesContainer = document.querySelector('.bubbles-container');
    if (bubblesContainer) {
        createBubbles();
        setInterval(createBubbles, 3000);

        function createBubbles() {
            const numBubbles = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numBubbles; i++) {
                const bubble = document.createElement('div');
                bubble.classList.add('bubble', 'blue-bubble');
                const size = Math.random() * 60 + 10;
                const left = Math.random() * 100;
                const duration = Math.random() * 10 + 8;
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                bubble.style.left = `${left}%`;
                bubble.style.animationDuration = `${duration}s`;
                bubble.style.opacity = Math.random() * 0.5 + 0.1;
                bubblesContainer.appendChild(bubble);
                setTimeout(() => bubble.remove(), duration * 1000);
            }
        }
    }

    // Signup Form Submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorElement = document.getElementById('signupError');
            errorElement.style.display = 'none';

            const formData = new FormData(signupForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.href = '/login.html';
                } else {
                    errorElement.textContent = data.error || 'Signup failed';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                errorElement.textContent = 'Server error';
                errorElement.style.display = 'block';
            }
        });
    }

    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorElement = document.getElementById('loginError');
            errorElement.style.display = 'none';

            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.href = '/fit.html';
                } else {
                    errorElement.textContent = data.error || 'Login failed';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                errorElement.textContent = 'Server error';
                errorElement.style.display = 'block';
            }
        });
    }

    // Resume Analysis
    if (document.getElementById('resumeFile')) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';
        const API_KEY = 'AIzaSyAcjpHlitpRpG7XM1qwHxTx4o9p6i31MOc';

        async function extractTextFromPDF(file) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + ' ';
            }
            return text;
        }

        window.analyzeResume = async () => {
            const fileInput = document.getElementById('resumeFile');
            const resultDiv = document.getElementById('result');
            const spinner = document.getElementById('spinner');
            const button = document.getElementById('analyzeButton');

            if (!fileInput.files.length) {
                alert('Please select a PDF resume.');
                return;
            }

            const file = fileInput.files[0];
            if (file.type !== 'application/pdf') {
                alert('Please upload a PDF file.');
                return;
            }

            button.disabled = true;
            spinner.style.display = 'block';
            resultDiv.style.display = 'none';
            resultDiv.innerHTML = '';

            try {
                const text = await extractTextFromPDF(file);
                if (!text.trim()) {
                    resultDiv.innerHTML = '<p style="color: red;">No text found in PDF.</p>';
                    resultDiv.style.display = 'block';
                    return;
                }

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Analyze this resume and return a structured plain text response with:
1. Best Match: The job position that matches the resume most closely.
2. Matches: A list of at least three job positions, each with a percentage match (0-100) and two specific suggestions for improving the resume for that job.
Format the output exactly as follows:
Best Match: <job_position>
Matches:
- <job_position>: <percentage>%, <suggestion1>, <suggestion2>
- <job_position>: <percentage>%, <suggestion1>, <suggestion2>
- <job_position>: <percentage>%, <suggestion1>, <suggestion2>

Resume text:\n${text}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.2,
                            topP: 0.8,
                            topK: 40,
                            maxOutputTokens: 1024
                        }
                    })
                });

                if (!response.ok) throw new Error('API request failed');
                const data = await response.json();
                const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available';
                resultDiv.innerHTML = `<h3 style="font-size: 18px; color: #1f2937; margin-bottom: 8px;">Analysis Results</h3><pre>${resultText}</pre>`;
                resultDiv.style.display = 'block';
            } catch (error) {
                resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                resultDiv.style.display = 'block';
            } finally {
                button.disabled = false;
                spinner.style.display = 'none';
            }
        };
    }
});