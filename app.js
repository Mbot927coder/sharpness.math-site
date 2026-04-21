function toggleHub() {
    if (document.body.classList.contains('regular-sidebar')) return;
    const sidebar = document.querySelector('.sidebar');
    const trigger = document.querySelector('.hub-trigger');
    const isActive = sidebar.classList.toggle('active');
    trigger.classList.toggle('active', isActive);
    trigger.textContent = isActive ? '✕' : 'S';
}

function applySidebarSetting() {
    document.body.classList.toggle('regular-sidebar', localStorage.getItem('sidebarMode') === 'regular');
}

window.toggleSidebarMode = function(isRegular) {
    localStorage.setItem('sidebarMode', isRegular ? 'regular' : 'hub');
    applySidebarSetting();
};

// Close hub when clicking outside
document.addEventListener('click', e => {
    if (document.body.classList.contains('regular-sidebar')) return;
    const sidebar = document.querySelector('.sidebar');
    const trigger = document.querySelector('.hub-trigger');
    if (sidebar && sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) && !trigger.contains(e.target)) {
        sidebar.classList.remove('active');
        trigger.classList.remove('active');
        trigger.textContent = 'S';
    }
});

// Scroll-in animation
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    applySidebarSetting();

    document.querySelectorAll('.hero-copy > *, .math-section, .about > *, .hero-panel, .math-card').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${i * 0.1}s`;
        observer.observe(el);
    });

    // Watch for dynamically added game cards
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('math-card')) {
                        node.style.opacity = '0';
                        node.style.animationDelay = `${mutation.target.children.length * 0.05}s`;
                        observer.observe(node);
                    }
                });
            });
        }).observe(gamesGrid, { childList: true });
    }
});