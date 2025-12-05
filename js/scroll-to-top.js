// Force scroll to top on page load/refresh
window.addEventListener('beforeunload', function () {
    window.scrollTo(0, 0);
});

// Also scroll to top immediately when page loads
window.onload = function () {
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 0);
};

// Fallback for browsers that restore scroll position
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Ensure we're at the top
document.addEventListener('DOMContentLoaded', function () {
    window.scrollTo(0, 0);
});
