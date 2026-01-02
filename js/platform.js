// Platform Dashboard JavaScript
import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let userProfile = null;

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserProfile();
            await loadDashboardData();
        } else {
            // Redirect to login
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

async function loadUserProfile() {
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            userProfile = userDoc.data();

            // Update UI with user info
            const userGreeting = document.getElementById('userGreeting');
            if (userGreeting) {
                userGreeting.textContent = `Bonjour, ${userProfile.firstName}`;
            }

            const welcomeTitle = document.getElementById('welcomeTitle');
            if (welcomeTitle) {
                welcomeTitle.textContent = `Bienvenue, ${userProfile.firstName} !`;
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function loadDashboardData() {
    try {
        // Load modules count
        const modulesQuery = query(
            collection(db, 'modules'),
            where('published', '==', true)
        );
        const modulesSnapshot = await getDocs(modulesQuery);

        // Count free vs paid modules user has access to
        let accessibleModules = 0;
        modulesSnapshot.forEach(doc => {
            const module = doc.data();
            if (module.isFree || (userProfile.modulesAccess && userProfile.modulesAccess.includes(doc.id))) {
                accessibleModules++;
            }
        });

        document.getElementById('modulesCount').textContent = accessibleModules;

        // Load consultations count
        const consultationsQuery = query(
            collection(db, 'consultations'),
            where('userId', '==', currentUser.uid),
            where('status', '==', 'scheduled')
        );
        const consultationsSnapshot = await getDocs(consultationsQuery);
        document.getElementById('consultationsCount').textContent = consultationsSnapshot.size;

        // Calculate days active
        if (userProfile.createdAt) {
            const createdDate = userProfile.createdAt.toDate();
            const today = new Date();
            const daysActive = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
            document.getElementById('daysActive').textContent = daysActive;
        }

        // Load featured modules
        await loadFeaturedModules(modulesSnapshot);

        // Load upcoming consultations
        await loadUpcomingConsultations();

        // Load recent activity
        await loadRecentActivity();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadFeaturedModules(modulesSnapshot) {
    const featuredContainer = document.getElementById('featuredModules');
    featuredContainer.innerHTML = '';

    let count = 0;
    modulesSnapshot.forEach(doc => {
        if (count >= 3) return; // Only show 3 featured modules

        const module = doc.data();
        const hasAccess = module.isFree || (userProfile.modulesAccess && userProfile.modulesAccess.includes(doc.id));

        const moduleCard = document.createElement('div');
        moduleCard.className = 'card';
        moduleCard.style.cursor = hasAccess ? 'pointer' : 'default';

        moduleCard.innerHTML = `
            <div style="position: relative;">
                <img src="${module.thumbnailUrl || '../images/module_thumbnails_1767311733043.png'}" 
                     alt="${module.title}" 
                     class="card-image">
                <span class="module-badge badge-${module.isFree ? 'free' : hasAccess ? 'paid' : 'locked'}" 
                      style="position: absolute; top: 1rem; right: 1rem;">
                    ${module.isFree ? 'Gratuit' : hasAccess ? 'Accès' : 'Payant'}
                </span>
            </div>
            <h4 class="card-title">${module.title}</h4>
            <p class="card-text">${module.description || 'Description du module'}</p>
            <a href="module.html?id=${doc.id}" class="btn ${hasAccess ? 'btn-primary' : 'btn-secondary'}" style="width: 100%;">
                ${hasAccess ? 'Accéder' : 'Voir les détails'}
            </a>
        `;

        featuredContainer.appendChild(moduleCard);
        count++;
    });

    if (count === 0) {
        featuredContainer.innerHTML = `
            <div class="card" style="grid-column: 1 / -1;">
                <p style="text-align: center; color: var(--text-medium); padding: 2rem;">
                    Aucun module disponible pour le moment.
                </p>
            </div>
        `;
    }
}

async function loadUpcomingConsultations() {
    try {
        const consultationsQuery = query(
            collection(db, 'consultations'),
            where('userId', '==', currentUser.uid),
            where('status', '==', 'scheduled'),
            orderBy('scheduledDate', 'asc'),
            limit(3)
        );

        const consultationsSnapshot = await getDocs(consultationsQuery);
        const container = document.getElementById('upcomingConsultations');

        if (consultationsSnapshot.empty) {
            return; // Keep default message
        }

        container.innerHTML = '';
        consultationsSnapshot.forEach(doc => {
            const consultation = doc.data();
            const date = consultation.scheduledDate.toDate();

            const consultationCard = document.createElement('div');
            consultationCard.className = 'card';
            consultationCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="color: var(--cosmic-purple); margin-bottom: 0.5rem;">
                            ${consultation.type || 'Consultation'}
                        </h4>
                        <p style="color: var(--text-medium); margin-bottom: 0.5rem;">
                            📅 ${date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p style="color: var(--text-medium);">
                            🕐 ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <a href="${consultation.meetLink || '#'}" class="btn btn-primary" target="_blank">
                        Rejoindre
                    </a>
                </div>
            `;
            container.appendChild(consultationCard);
        });

    } catch (error) {
        console.error('Error loading consultations:', error);
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('recentActivity');

    // This would load from a real activity log in production
    // For now, showing placeholder
    container.innerHTML = `
        <div style="padding: 1rem;">
            <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; border-left: 3px solid var(--cosmic-purple);">
                <span style="font-size: 2rem;">🎉</span>
                <div>
                    <p style="font-weight: 600; margin-bottom: 0.25rem;">Bienvenue sur la plateforme !</p>
                    <p style="font-size: 0.9rem; color: var(--text-medium);">Commencez par explorer les modules gratuits</p>
                </div>
            </div>
        </div>
    `;
}
