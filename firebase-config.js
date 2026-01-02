// Firebase Configuration for Étoiles d'Équilibre
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASZoEi0Fe5XbhbfFftCczBajEBIgxbioo",
    authDomain: "etoiles-equilibre.firebaseapp.com",
    projectId: "etoiles-equilibre",
    storageBucket: "etoiles-equilibre.firebasestorage.app",
    messagingSenderId: "219568507420",
    appId: "1:219568507420:web:5def1c4a2503b9aff92dd9",
    measurementId: "G-DBCPV9H65L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other modules
export { app, analytics, auth, db, storage };
