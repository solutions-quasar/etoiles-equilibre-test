// Rich Content Editor for Modules
let contentBlocks = [];
let blockIdCounter = 0;

// Initialize content editor
export function initContentEditor() {
    const addTextBtn = document.getElementById('addTextBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');

    if (addTextBtn) addTextBtn.addEventListener('click', () => addBlock('text'));
    if (addImageBtn) addImageBtn.addEventListener('click', () => addBlock('image'));
    if (addVideoBtn) addVideoBtn.addEventListener('click', () => addBlock('video'));
}

// Add a new content block
function addBlock(type) {
    const block = {
        id: `block-${blockIdCounter++}`,
        type: type,
        content: '',
        order: contentBlocks.length
    };

    contentBlocks.push(block);
    renderBlocks();

    // Focus on the new block's input
    setTimeout(() => {
        const blockElement = document.getElementById(block.id);
        if (blockElement) {
            const input = blockElement.querySelector('textarea, input');
            if (input) input.focus();
        }
    }, 100);
}

// Render all blocks
function renderBlocks() {
    const container = document.getElementById('blocksContainer');
    const emptyState = document.getElementById('emptyState');

    if (!container) return;

    if (contentBlocks.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = '';
    contentBlocks.forEach((block, index) => {
        const blockElement = createBlockElement(block, index);
        container.appendChild(blockElement);
    });

    initDragAndDrop();
}

// Create a block element
function createBlockElement(block, index) {
    const div = document.createElement('div');
    div.className = 'content-block';
    div.id = block.id;
    div.draggable = true;
    div.dataset.index = index;

    const typeIcons = {
        text: '📝',
        image: '🖼️',
        video: '🎥'
    };

    const typeLabels = {
        text: 'Bloc de Texte',
        image: 'Image',
        video: 'Vidéo'
    };

    div.innerHTML = `
        <div class="block-header">
            <span class="block-type">${typeIcons[block.type]} ${typeLabels[block.type]}</span>
            <div class="block-actions">
                <button type="button" class="block-btn" onclick="moveBlockUp(${index})" ${index === 0 ? 'disabled' : ''}>
                    ↑
                </button>
                <button type="button" class="block-btn" onclick="moveBlockDown(${index})" ${index === contentBlocks.length - 1 ? 'disabled' : ''}>
                    ↓
                </button>
                <button type="button" class="block-btn" onclick="deleteBlock(${index})" style="color: #e74c3c;">
                    🗑️
                </button>
            </div>
        </div>
        <div class="block-content">
            ${getBlockContentHTML(block)}
        </div>
    `;

    // Add event listeners for content changes
    const contentInput = div.querySelector('textarea, input');
    if (contentInput) {
        contentInput.addEventListener('input', (e) => {
            block.content = e.target.value;
        });
    }

    return div;
}

// Get HTML for block content based on type
function getBlockContentHTML(block) {
    switch (block.type) {
        case 'text':
            return `
                <textarea 
                    class="form-textarea" 
                    rows="5" 
                    placeholder="Entrez votre texte ici..."
                    style="width: 100%; resize: vertical;"
                >${block.content || ''}</textarea>
            `;
        case 'image':
            return `
                <input 
                    type="url" 
                    class="form-input" 
                    placeholder="URL de l'image (https://...)"
                    value="${block.content || ''}"
                    style="width: 100%; margin-bottom: 0.5rem;"
                >
                ${block.content ? `<img src="${block.content}" style="max-width: 100%; border-radius: var(--radius-md); margin-top: 0.5rem;" onerror="this.style.display='none'">` : ''}
                <p style="font-size: 0.875rem; color: var(--text-medium); margin-top: 0.5rem;">
                    💡 Astuce: Uploadez votre image sur Firebase Storage et collez l'URL ici
                </p>
            `;
        case 'video':
            return `
                <input 
                    type="url" 
                    class="form-input" 
                    placeholder="URL de la vidéo YouTube ou Vimeo"
                    value="${block.content || ''}"
                    style="width: 100%; margin-bottom: 0.5rem;"
                >
                ${block.content ? `
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin-top: 0.5rem;">
                        <iframe 
                            src="${getEmbedUrl(block.content)}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: var(--radius-md);"
                            allowfullscreen
                        ></iframe>
                    </div>
                ` : ''}
                <p style="font-size: 0.875rem; color: var(--text-medium); margin-top: 0.5rem;">
                    💡 Formats supportés: YouTube, Vimeo, liens directs MP4
                </p>
            `;
        default:
            return '';
    }
}

// Convert video URL to embed URL
function getEmbedUrl(url) {
    if (!url) return '';

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (videoId) return `https://www.youtube.com/embed/${videoId[1]}`;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
        const videoId = url.match(/vimeo\.com\/(\d+)/);
        if (videoId) return `https://player.vimeo.com/video/${videoId[1]}`;
    }

    // Direct video link
    return url;
}

// Move block up
window.moveBlockUp = function (index) {
    if (index === 0) return;

    const temp = contentBlocks[index];
    contentBlocks[index] = contentBlocks[index - 1];
    contentBlocks[index - 1] = temp;

    renderBlocks();
};

// Move block down
window.moveBlockDown = function (index) {
    if (index === contentBlocks.length - 1) return;

    const temp = contentBlocks[index];
    contentBlocks[index] = contentBlocks[index + 1];
    contentBlocks[index + 1] = temp;

    renderBlocks();
};

// Delete block
window.deleteBlock = function (index) {
    if (confirm('Supprimer ce bloc de contenu ?')) {
        contentBlocks.splice(index, 1);
        renderBlocks();
    }
};

// Initialize drag and drop
function initDragAndDrop() {
    const blocks = document.querySelectorAll('.content-block');

    blocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragover', handleDragOver);
        block.addEventListener('drop', handleDrop);
        block.addEventListener('dragend', handleDragEnd);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        const temp = contentBlocks[draggedIndex];
        contentBlocks.splice(draggedIndex, 1);
        contentBlocks.splice(targetIndex, 0, temp);

        renderBlocks();
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

// Get content as JSON
export function getContentBlocks() {
    return contentBlocks.map((block, index) => ({
        ...block,
        order: index
    }));
}

// Set content from JSON
export function setContentBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) {
        contentBlocks = [];
        renderBlocks();
        return;
    }

    contentBlocks = blocks.sort((a, b) => a.order - b.order);
    blockIdCounter = Math.max(...contentBlocks.map(b => parseInt(b.id.replace('block-', '')) || 0), 0) + 1;
    renderBlocks();
}

// Clear all blocks
export function clearContentBlocks() {
    contentBlocks = [];
    blockIdCounter = 0;
    renderBlocks();
}
