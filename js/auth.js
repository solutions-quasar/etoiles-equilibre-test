// Authentication Module - Firebase Auth Integration
import { auth, db } from '../firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    // Tab Switching
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginTab.addEventListener('click', function () {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginTab.style.borderBottomColor = 'var(--cosmic-purple)';
        loginTab.style.color = 'var(--cosmic-purple)';
        registerTab.style.borderBottomColor = 'transparent';
        registerTab.style.color = 'var(--text-medium)';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerTab.addEventListener('click', function () {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerTab.style.borderBottomColor = 'var(--cosmic-purple)';
        registerTab.style.color = 'var(--cosmic-purple)';
        loginTab.style.borderBottomColor = 'transparent';
        loginTab.style.color = 'var(--text-medium)';
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Login Form Handler
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            showNotification('✅ Connexion réussie !', 'success');

            // Redirect based on user role
            setTimeout(() => {
                // Check if admin
                if (email === 'admin@etoiles-equilibre.com') {
                    window.location.href = 'admin/index.html';
                } else {
                    window.location.href = 'platform/index.html';
                }
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Erreur de connexion. Vérifiez vos identifiants.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Aucun compte trouvé avec cet email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Mot de passe incorrect.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Adresse email invalide.';
            }

            showNotification(errorMessage, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Register Form Handler
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('registerFirstName').value.trim();
        const lastName = document.getElementById('registerLastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const termsAccepted = document.getElementById('registerTerms').checked;

        // Validation
        if (password !== passwordConfirm) {
            showNotification('Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        if (!termsAccepted) {
            showNotification('Veuillez accepter les conditions d\'utilisation.', 'error');
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Création du compte...';

        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                firstName: firstName,
                lastName: lastName,
                email: email,
                role: 'client',
                createdAt: serverTimestamp(),
                subscription: 'free',
                modulesAccess: []
            });

            showNotification('✅ Compte créé avec succès !', 'success');

            // Redirect to platform
            setTimeout(() => {
                window.location.href = 'platform/index.html';
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Erreur lors de la création du compte.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Un compte existe déjà avec cet email.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Adresse email invalide.';
            }

            showNotification(errorMessage, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Forgot Password Handler
    const forgotPasswordLink = document.getElementById('forgotPassword');
    forgotPasswordLink.addEventListener('click', async function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();

        if (!email) {
            showNotification('Veuillez entrer votre email d\'abord.', 'error');
            document.getElementById('loginEmail').focus();
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showNotification('✅ Email de réinitialisation envoyé !', 'success');
        } catch (error) {
            console.error('Password reset error:', error);
            showNotification('Erreur lors de l\'envoi de l\'email.', 'error');
        }
    });

    // Check if user is already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, redirect to platform
            if (window.location.pathname.includes('connexion.html')) {
                window.location.href = 'platform/index.html';
            }
        }
    });
});
