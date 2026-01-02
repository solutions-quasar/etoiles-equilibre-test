// Admin Dashboard JavaScript
import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let userProfile = null;

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication and admin role
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                userProfile = userDoc.data();

                // Check if user is admin
                if (userProfile.role !== 'admin') {
                    // Not an admin, redirect to client platform
                    window.location.href = '../platform/index.html';
                    return;
                }

                // Load admin dashboard
                await loadAdminDashboard();
            } else {
                window.location.href = '../connexion.html';
            }
        } else {
            window.location.href = '../connexion.html';
        }
    });

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            try {
                await signOut(auth);
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});

async function loadAdminDashboard() {
    // Update greeting
    const adminGreeting = document.getElementById('adminGreeting');
    if (adminGreeting) {
        adminGreeting.textContent = `Admin: ${userProfile.firstName}`;
    }

    try {
        // Load total users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        document.getElementById('totalUsers').textContent = usersSnapshot.size;

        // Load total modules
        const modulesSnapshot = await getDocs(collection(db, 'modules'));
        document.getElementById('totalModules').textContent = modulesSnapshot.size;

        // Load total consultations
        const consultationsSnapshot = await getDocs(collection(db, 'consultations'));
        document.getElementById('totalConsultations').textContent = consultationsSnapshot.size;

        // Load total leads
        const leadsSnapshot = await getDocs(collection(db, 'leads'));
        document.getElementById('totalLeads').textContent = leadsSnapshot.size;

        // Load recent activity
        await loadRecentActivity();

    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showNotification('Erreur lors du chargement des données', 'error');
    }
}

async function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');

    try {
        // Get recent users
        const usersQuery = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        const usersSnapshot = await getDocs(usersQuery);

        let activityHTML = '';

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            const date = user.createdAt ? user.createdAt.toDate() : new Date();

            activityHTML += `
                <tr>
                    <td><span style="background: var(--healing-green); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">Nouvel utilisateur</span></td>
                    <td>${user.firstName} ${user.lastName} s'est inscrit</td>
                    <td>${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            `;
        });

        if (activityHTML === '') {
            activityHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: var(--text-medium); padding: 2rem;">
                        Aucune activité récente
                    </td>
                </tr>
            `;
        }

        activityContainer.innerHTML = activityHTML;

    } catch (error) {
        console.error('Error loading recent activity:', error);
        activityContainer.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: var(--text-medium); padding: 2rem;">
                    Erreur lors du chargement de l'activité
                </td>
            </tr>
        `;
    }
}
