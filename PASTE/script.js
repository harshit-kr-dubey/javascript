// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const pasteForm = document.getElementById('paste-form');
const createView = document.getElementById('create-view');
const viewPaste = document.getElementById('view-paste');
const codeEditor = document.getElementById('code-editor');
const syntaxHighlight = document.getElementById('syntax-highlight');
const pasteCodeDisplay = document.getElementById('paste-code-display');
const pasteTitleDisplay = document.getElementById('paste-title-display');
const languageDisplay = document.getElementById('language-display');
const successMessage = document.getElementById('success-message');
const pasteUrl = document.getElementById('paste-url');
const copyBtn = document.getElementById('copy-btn');
const rawBtn = document.getElementById('raw-btn');
const newPasteBtn = document.getElementById('new-paste-btn');
const pasteDate = document.getElementById('paste-date');
const pasteExpiration = document.getElementById('paste-expiration');

// Theme Toggle
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeToggle.checked);
    localStorage.setItem('darkMode', themeToggle.checked);
});

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true') {
    themeToggle.checked = true;
    document.body.classList.add('dark-mode');
}

// Generate a random ID for paste URLs
function generateId(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Handle form submission
pasteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const pasteData = {
        id: generateId(),
        title: document.getElementById('paste-title').value || 'Untitled Paste',
        content: codeEditor.value,
        language: syntaxHighlight.value,
        expiration: document.getElementById('expiration').value,
        visibility: document.getElementById('visibility').value,
        created: new Date().toISOString()
    };
    
    // In a real app, you would send this data to a server
    // For demonstration, we'll just store it in localStorage
    savePaste(pasteData);
    
    // Show success message
    const pasteLink = `${window.location.origin}${window.location.pathname}?id=${pasteData.id}`;
    pasteUrl.textContent = pasteLink;
    pasteUrl.setAttribute('data-url', pasteLink);
    successMessage.style.display = 'block';
    
    // Also show the paste view
    showPasteView(pasteData);
});

// Save paste to localStorage
function savePaste(pasteData) {
    const pastes = JSON.parse(localStorage.getItem('pastes')) || {};
    pastes[pasteData.id] = pasteData;
    localStorage.setItem('pastes', JSON.stringify(pastes));
}

// Show the paste view
function showPasteView(pasteData) {
    createView.style.display = 'none';
    viewPaste.style.display = 'block';
    
    pasteTitleDisplay.textContent = pasteData.title;
    pasteCodeDisplay.textContent = pasteData.content;
    pasteCodeDisplay.className = pasteData.language;
    
    // Format language display
    const languageMap = {
        'plaintext': 'Plain Text',
        'javascript': 'JavaScript',
        'python': 'Python',
        'java': 'Java',
        'csharp': 'C#',
        'cpp': 'C++',
        'php': 'PHP',
        'ruby': 'Ruby',
        'html': 'HTML',
        'css': 'CSS',
        'sql': 'SQL',
        'json': 'JSON',
        'xml': 'XML',
        'markdown': 'Markdown'
    };
    
    languageDisplay.textContent = languageMap[pasteData.language] || pasteData.language;
    
    // Format date
    const created = new Date(pasteData.created);
    pasteDate.textContent = `Created ${created.toLocaleDateString()} at ${created.toLocaleTimeString()}`;
    
    // Format expiration
    const expirationMap = {
        'never': 'Never',
        '10m': '10 Minutes',
        '1h': '1 Hour',
        '1d': '1 Day',
        '1w': '1 Week',
        '1m': '1 Month'
    };
    
    pasteExpiration.textContent = `Expires: ${expirationMap[pasteData.expiration] || pasteData.expiration}`;
    
    // Apply syntax highlighting
    hljs.highlightElement(pasteCodeDisplay);
    
    // Update URL
    if (history.pushState) {
        const newUrl = `${window.location.pathname}?id=${pasteData.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }
}

// Check if we should load a paste from URL
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('id');
    
    if (pasteId) {
        const pastes = JSON.parse(localStorage.getItem('pastes')) || {};
        const pasteData = pastes[pasteId];
        
        if (pasteData) {
            showPasteView(pasteData);
        }
    }
});

// Copy paste content
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(pasteCodeDisplay.textContent)
        .then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
});

// Show raw paste content
rawBtn.addEventListener('click', () => {
    const rawContent = pasteCodeDisplay.textContent;
    const newWindow = window.open();
    newWindow.document.write(`<pre style="white-space: pre-wrap; word-break: break-all;">${rawContent}</pre>`);
});

// New paste button
newPasteBtn.addEventListener('click', () => {
    createView.style.display = 'block';
    viewPaste.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Clear form
    document.getElementById('paste-title').value = '';
    codeEditor.value = '';
    
    // Update URL
    if (history.pushState) {
        window.history.pushState({}, '', window.location.pathname);
    }
});

// Click on paste URL to copy
pasteUrl.addEventListener('click', () => {
    const url = pasteUrl.getAttribute('data-url');
    navigator.clipboard.writeText(url)
        .then(() => {
            const originalText = pasteUrl.textContent;
            pasteUrl.textContent = 'Copied!';
            setTimeout(() => {
                pasteUrl.textContent = originalText;
            }, 2000);
        });
});