// E-book Lead Capture and Firebase Integration
import { db } from '../firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const ebookForm = document.getElementById('ebookForm');

    if (ebookForm) {
        ebookForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const email = document.getElementById('email').value.trim();
            const consent = document.getElementById('consent').checked;

            if (!firstName || !email || !consent) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }

            // Disable submit button
            const submitBtn = ebookForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';

            try {
                // Save lead to Firestore
                await addDoc(collection(db, 'leads'), {
                    firstName: firstName,
                    email: email,
                    consent: consent,
                    source: 'ebook-gratuit',
                    createdAt: serverTimestamp(),
                    ebookSent: false
                });

                // Show success message
                showNotification('✅ E-book envoyé ! Vérifiez votre email.', 'success');

                // Reset form
                ebookForm.reset();

                // Redirect to thank you page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'merci-ebook.html';
                }, 2000);

            } catch (error) {
                console.error('Error saving lead:', error);
                showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Smooth scroll to form
    document.querySelectorAll('a[href="#ebookForm"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const form = document.getElementById('ebookForm');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Focus on first input
                setTimeout(() => {
                    document.getElementById('firstName').focus();
                }, 500);
            }
        });
    });
});
