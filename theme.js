// theme.js - Unified Theme & Language Logic for Pelimotion

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('plm-theme', nextTheme);
}

// Auto-apply on load
(function() {
    const savedTheme = localStorage.getItem('plm-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();
