// Add different animations for different section titles
const categoryTitle = document.querySelector('.featured-categories .section-title');
const safetyTitle = document.querySelector('.ai-safety .section-title');
const listingsTitle = document.querySelector('.local-listings .section-title');

// Tumbling effect for category title
if (categoryTitle) {
    categoryTitle.classList.add('slide-in-right-down');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    observer.observe(categoryTitle);
}

// Zoom-in effect for safety title
if (safetyTitle) {
    safetyTitle.classList.add('zoom-in-effect');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    observer.observe(safetyTitle);
}

// Zoom-out effect for listings title
if (listingsTitle) {
    listingsTitle.classList.add('zoom-out-effect');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    observer.observe(listingsTitle);
}
