// Admin Users Management JavaScript
import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, query, orderBy, where, updateDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let allUsers = [];

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUsers();
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

    // Search functionality
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterUsers(this.value);
        });
    }
});

async function loadUsers() {
    try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);

        allUsers = [];
        let adminCount = 0;
        let clientCount = 0;
        let newThisMonth = 0;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        usersSnapshot.forEach(doc => {
            const userData = { id: doc.id, ...doc.data() };
            allUsers.push(userData);

            if (userData.role === 'admin') adminCount++;
            else clientCount++;

            if (userData.createdAt && userData.createdAt.toDate() >= firstDayOfMonth) {
                newThisMonth++;
            }
        });

        // Update stats
        document.getElementById('totalUsers').textContent = allUsers.length;
        document.getElementById('adminCount').textContent = adminCount;
        document.getElementById('clientCount').textContent = clientCount;
        document.getElementById('newThisMonth').textContent = newThisMonth;

        // Display users
        displayUsers(allUsers);

    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Erreur lors du chargement des utilisateurs', 'error');
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');

    if (users.length === 0) {
        usersList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-medium);">
                    Aucun utilisateur trouvé
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    users.forEach(user => {
        const createdDate = user.createdAt ? user.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';

        html += `
            <tr>
                <td style="padding: 1rem; font-weight: 600;">
                    ${user.firstName || ''} ${user.lastName || ''}
                </td>
                <td style="padding: 1rem;">${user.email}</td>
                <td style="padding: 1rem;">
                    <span class="user-badge badge-${user.role || 'client'}">
                        ${user.role === 'admin' ? '👑 Admin' : '👤 Client'}
                    </span>
                </td>
                <td style="padding: 1rem;">${createdDate}</td>
                <td style="padding: 1rem;">
                    <button onclick="toggleRole('${user.id}', '${user.role}')" class="btn btn-secondary" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                        ${user.role === 'admin' ? '↓ Rétrograder' : '↑ Promouvoir Admin'}
                    </button>
                </td>
            </tr>
        `;
    });

    usersList.innerHTML = html;
}

function filterUsers(searchTerm) {
    const filtered = allUsers.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        return fullName.includes(search) || email.includes(search);
    });

    displayUsers(filtered);
}

// Global function for role toggle
window.toggleRole = async function (userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const confirmMsg = currentRole === 'admin'
        ? 'Rétrograder cet administrateur en client ?'
        : 'Promouvoir cet utilisateur en administrateur ?';

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        await updateDoc(doc(db, 'users', userId), {
            role: newRole
        });

        showNotification(`✅ Rôle mis à jour en ${newRole}`, 'success');
        await loadUsers();

    } catch (error) {
        console.error('Error updating role:', error);
        showNotification('Erreur lors de la mise à jour du rôle', 'error');
    }
};
