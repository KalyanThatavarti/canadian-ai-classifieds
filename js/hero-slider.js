// ================================
// Hero Slider JavaScript
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
});

function initHeroSlider() {
    const slides = document.querySelectorAll('.slider-image');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let currentSlide = 0;
    let slideInterval;

    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');

        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-play slider
    function startSlider() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Stop auto-play
    function stopSlider() {
        clearInterval(slideInterval);
    }

    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlider();
            showSlide(index);
            startSlider(); // Restart auto-play after manual click
        });
    });

    // Start the slider
    startSlider();

    // Pause on hover (optional)
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopSlider);
        heroSlider.addEventListener('mouseleave', startSlider);
    }
}

// Trigger fade-in animations when elements come into view
function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-up');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    initFadeInAnimations();
});
