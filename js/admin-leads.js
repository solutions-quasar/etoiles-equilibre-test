// Admin Leads Management JavaScript
import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let allLeads = [];

document.addEventListener('DOMContentLoaded', function () {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadLeads();
        } else {
            window.location.href = '../connexion.html';
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            await signOut(auth);
            window.location.href = '../index.html';
        });
    }

    const exportBtn = document.getElementById('exportLeadsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
});

async function loadLeads() {
    try {
        const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
        const leadsSnapshot = await getDocs(leadsQuery);

        allLeads = [];
        let thisWeek = 0;
        let converted = 0;

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        leadsSnapshot.forEach(doc => {
            const lead = { id: doc.id, ...doc.data() };
            allLeads.push(lead);

            if (lead.createdAt && lead.createdAt.toDate() >= weekAgo) {
                thisWeek++;
            }

            if (lead.convertedToUser) {
                converted++;
            }
        });

        const conversionRate = allLeads.length > 0 ? ((converted / allLeads.length) * 100).toFixed(1) : 0;

        document.getElementById('totalLeads').textContent = allLeads.length;
        document.getElementById('thisWeekLeads').textContent = thisWeek;
        document.getElementById('convertedLeads').textContent = converted;
        document.getElementById('conversionRate').textContent = conversionRate + '%';

        displayLeads();

    } catch (error) {
        console.error('Error loading leads:', error);
        showNotification('Erreur lors du chargement des leads', 'error');
    }
}

function displayLeads() {
    const leadsList = document.getElementById('leadsList');

    if (allLeads.length === 0) {
        leadsList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-medium);">
                    Aucun lead enregistré
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    allLeads.forEach(lead => {
        const date = lead.createdAt ? lead.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';

        html += `
            <tr>
                <td style="padding: 1rem;">${lead.firstName || 'N/A'}</td>
                <td style="padding: 1rem;">${lead.email}</td>
                <td style="padding: 1rem;">
                    <span style="background: var(--cosmic-purple); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">
                        ${lead.source || 'ebook-gratuit'}
                    </span>
                </td>
                <td style="padding: 1rem;">${date}</td>
                <td style="padding: 1rem; text-align: center;">
                    ${lead.ebookSent ? '✅' : '❌'}
                </td>
                <td style="padding: 1rem; text-align: center;">
                    ${lead.convertedToUser ? '✅' : '❌'}
                </td>
            </tr>
        `;
    });

    leadsList.innerHTML = html;
}

function exportToCSV() {
    if (allLeads.length === 0) {
        alert('Aucun lead à exporter');
        return;
    }

    let csv = 'Prénom,Email,Source,Date,E-book Envoyé,Converti\n';

    allLeads.forEach(lead => {
        const date = lead.createdAt ? lead.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';
        csv += `${lead.firstName || ''},${lead.email},${lead.source || 'ebook-gratuit'},${date},${lead.ebookSent ? 'Oui' : 'Non'},${lead.convertedToUser ? 'Oui' : 'Non'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('✅ Export CSV réussi !', 'success');
}
