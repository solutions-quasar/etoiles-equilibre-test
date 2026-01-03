// Admin Module Management JavaScript
import { auth, db, storage } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initContentEditor, getContentBlocks, setContentBlocks, clearContentBlocks } from './content-editor.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadModules();
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

    // Modal handlers
    const modal = document.getElementById('moduleModal');
    const createBtn = document.getElementById('createModuleBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    createBtn.addEventListener('click', function () {
        openModal();
    });

    closeBtn.addEventListener('click', function () {
        closeModal();
    });

    cancelBtn.addEventListener('click', function () {
        closeModal();
    });

    // Form submission
    const moduleForm = document.getElementById('moduleForm');
    moduleForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        await saveModule();
    });

    // Module type change handler
    const moduleType = document.getElementById('moduleType');
    const modulePrice = document.getElementById('modulePrice');

    moduleType.addEventListener('change', function () {
        if (this.value === 'free') {
            modulePrice.value = '0';
            modulePrice.disabled = true;
        } else {
            modulePrice.disabled = false;
        }
    });

    // Initialize content editor
    initContentEditor();
});

async function loadModules() {
    try {
        const modulesQuery = query(collection(db, 'modules'), orderBy('order', 'asc'));
        const modulesSnapshot = await getDocs(modulesQuery);

        const modulesList = document.getElementById('modulesList');

        if (modulesSnapshot.empty) {
            modulesList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-medium);">
                        Aucun module créé. Cliquez sur "Créer un Module" pour commencer.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        modulesSnapshot.forEach(doc => {
            const module = doc.data();
            html += `
                <tr>
                    <td style="padding: 1rem; font-weight: 600;">${module.title}</td>
                    <td style="padding: 1rem;">
                        <span style="background: ${module.isFree ? 'var(--healing-green)' : 'var(--telluric-gold)'}; color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">
                            ${module.isFree ? 'Gratuit' : 'Payant'}
                        </span>
                    </td>
                    <td style="padding: 1rem;">${module.price > 0 ? module.price + '€' : '-'}</td>
                    <td style="padding: 1rem;">
                        <span style="background: ${module.published ? 'var(--healing-green)' : 'var(--gentle-gray)'}; color: ${module.published ? 'white' : 'var(--text-medium)'}; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">
                            ${module.published ? 'Publié' : 'Brouillon'}
                        </span>
                    </td>
                    <td style="padding: 1rem;">
                        <button onclick="editModule('${doc.id}')" class="btn btn-secondary" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                            ✏️ Modifier
                        </button>
                        <button onclick="deleteModule('${doc.id}')" class="btn" style="padding: 0.5rem 1rem; background: #e74c3c; color: white;">
                            🗑️ Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        modulesList.innerHTML = html;

    } catch (error) {
        console.error('Error loading modules:', error);
        showNotification('Erreur lors du chargement des modules', 'error');
    }
}

function openModal(moduleId = null) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('moduleForm');

    if (moduleId) {
        modalTitle.textContent = 'Modifier le Module';
        loadModuleData(moduleId);
    } else {
        modalTitle.textContent = 'Créer un Module';
        form.reset();
        document.getElementById('moduleId').value = '';
        clearContentBlocks();
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('moduleModal');
    modal.classList.remove('active');
    document.getElementById('moduleForm').reset();
    clearContentBlocks();
}

async function loadModuleData(moduleId) {
    try {
        const moduleDoc = await getDoc(doc(db, 'modules', moduleId));
        if (moduleDoc.exists()) {
            const module = moduleDoc.data();

            document.getElementById('moduleId').value = moduleId;
            document.getElementById('moduleTitle').value = module.title;
            document.getElementById('moduleDescription').value = module.description || '';

            // Load content blocks if they exist, otherwise clear
            if (module.contentBlocks && Array.isArray(module.contentBlocks)) {
                setContentBlocks(module.contentBlocks);
            } else {
                clearContentBlocks();
            }

            document.getElementById('moduleType').value = module.isFree ? 'free' : 'paid';
            document.getElementById('modulePrice').value = module.price || 0;
            document.getElementById('moduleCategory').value = module.category || '';
            document.getElementById('moduleTags').value = module.tags ? module.tags.join(', ') : '';
            document.getElementById('moduleVideoUrl').value = module.videoUrl || '';
            document.getElementById('moduleOrder').value = module.order || 0;
            document.getElementById('modulePublished').checked = module.published || false;
        }
    } catch (error) {
        console.error('Error loading module data:', error);
        showNotification('Erreur lors du chargement du module', 'error');
    }
}

async function saveModule() {
    const moduleId = document.getElementById('moduleId').value;
    const title = document.getElementById('moduleTitle').value.trim();
    const description = document.getElementById('moduleDescription').value.trim();
    const type = document.getElementById('moduleType').value;
    const price = parseFloat(document.getElementById('modulePrice').value) || 0;
    const category = document.getElementById('moduleCategory').value.trim();
    const tagsInput = document.getElementById('moduleTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    const videoUrl = document.getElementById('moduleVideoUrl').value.trim();
    const order = parseInt(document.getElementById('moduleOrder').value) || 0;
    const published = document.getElementById('modulePublished').checked;

    // Get content blocks from editor
    const contentBlocks = getContentBlocks();

    if (contentBlocks.length === 0) {
        showNotification('⚠️ Veuillez ajouter du contenu au module', 'error');
        return;
    }

    const moduleData = {
        title,
        description,
        contentBlocks,  // Store structured content blocks
        isFree: type === 'free',
        price: type === 'free' ? 0 : price,
        category,
        tags,
        videoUrl,
        order,
        published,
        updatedAt: serverTimestamp()
    };

    try {
        if (moduleId) {
            // Update existing module
            await updateDoc(doc(db, 'modules', moduleId), moduleData);
            showNotification('✅ Module mis à jour avec succès', 'success');
        } else {
            // Create new module
            moduleData.createdAt = serverTimestamp();
            moduleData.createdBy = currentUser.uid;
            moduleData.thumbnailUrl = '../images/module_thumbnails_1767311733043.png'; // Default thumbnail

            await addDoc(collection(db, 'modules'), moduleData);
            showNotification('✅ Module créé avec succès', 'success');
        }

        closeModal();
        await loadModules();

    } catch (error) {
        console.error('Error saving module:', error);
        showNotification('Erreur lors de l\'enregistrement du module', 'error');
    }
}

// Global functions for button onclick
window.editModule = function (moduleId) {
    openModal(moduleId);
};

window.deleteModule = async function (moduleId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, 'modules', moduleId));
        showNotification('✅ Module supprimé', 'success');
        await loadModules();
    } catch (error) {
        console.error('Error deleting module:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
};
