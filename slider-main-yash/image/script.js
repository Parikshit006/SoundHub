const items = document.querySelectorAll('.slider .list .item');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const thumbnails = document.querySelectorAll('.thumbnail-item');
const barrel = document.getElementById('barrel');

// Configuration
const totalItems = items.length;
let activeIndex = 0;
let isAutoPlay = true;
let autoPlayTimer;

// Initialize the slider
function init() {
    startAutoPlay();
    updateSlider();
    updateBarrelRotation();
    resetContentAnimations();
}

// Auto-play functionality
function startAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    
    autoPlayTimer = setInterval(() => {
        if (isAutoPlay) {
            nextSlide();
        }
    }, 5000);
}

function pauseAutoPlay() {
    isAutoPlay = false;
    setTimeout(() => {
        isAutoPlay = true;
    }, 10000); // Resume after 10 seconds
}

// Navigation functions
function nextSlide() {
    activeIndex = (activeIndex + 1) % totalItems;
    updateSlider();
    updateBarrelRotation();
    resetContentAnimations();
}

function prevSlide() {
    activeIndex = (activeIndex - 1 + totalItems) % totalItems;
    updateSlider();
    updateBarrelRotation();
    resetContentAnimations();
}

function goToSlide(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    updateSlider();
    updateBarrelRotation();
    resetContentAnimations();
}

// Update slider display
function updateSlider() {
    // Remove active class from all items
    items.forEach(item => item.classList.remove('active'));
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    
    // Add active class to current items
    items[activeIndex].classList.add('active');
    thumbnails[activeIndex].classList.add('active');
}

// Calculate and apply barrel rotation (ROTATION ONLY - NO REVOLUTION)
function updateBarrelRotation() {
    // Rotate the entire barrel container to bring active thumbnail to front
    const rotationAngle = -activeIndex * 72; // 360deg / 5 items = 72deg per item
    barrel.style.transform = `rotateY(${rotationAngle}deg)`;
    
    // Update CSS custom property for individual thumbnail transforms
    thumbnails.forEach((thumbnail, index) => {
        const individualRotation = index * 72;
        thumbnail.style.setProperty('--rotation', `${individualRotation}deg`);
    });
}

// Reset content animations for smooth entrance
function resetContentAnimations() {
    const activeItem = items[activeIndex];
    const contentElements = activeItem.querySelectorAll('.content .category, .content h2, .content .description');
    
    contentElements.forEach(element => {
        // Force animation restart
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = null;
    });
}

// Enhanced thumbnail interaction
function setupThumbnailInteractions() {
    thumbnails.forEach((thumbnail, index) => {
        // Click event
        thumbnail.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
            pauseAutoPlay();
        });
        
        // Mouse enter for preview (optional)
        thumbnail.addEventListener('mouseenter', () => {
            if (index !== activeIndex) {
                // Optional: Show preview on hover
                thumbnail.style.filter = 'brightness(0.85) saturate(1)';
            }
        });
        
        // Mouse leave
        thumbnail.addEventListener('mouseleave', () => {
            if (index !== activeIndex) {
                thumbnail.style.filter = '';
            }
        });
    });
}

// Button event listeners
nextBtn.addEventListener('click', () => {
    nextSlide();
    pauseAutoPlay();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    pauseAutoPlay();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            prevSlide();
            pauseAutoPlay();
            break;
        case 'ArrowRight':
            nextSlide();
            pauseAutoPlay();
            break;
        case ' ': // Spacebar
            e.preventDefault();
            isAutoPlay = !isAutoPlay;
            if (isAutoPlay) startAutoPlay();
            break;
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            prevSlide();
        } else {
            nextSlide();
        }
        pauseAutoPlay();
    }
}

// Intersection Observer for performance optimization
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoPlay();
            } else {
                isAutoPlay = false;
                if (autoPlayTimer) clearInterval(autoPlayTimer);
            }
        });
    });
    
    observer.observe(document.querySelector('.slider'));
}

// Page visibility change handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isAutoPlay = false;
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    } else {
        isAutoPlay = true;
        startAutoPlay();
    }
});

// Window resize handler for responsive updates
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateBarrelRotation();
    }, 250);
});

// Error handling for images
function setupImageErrorHandling() {
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        img.addEventListener('error', () => {
            console.warn('Image failed to load:', img.src);
            // You could set a fallback image here
            // img.src = 'path/to/fallback-image.jpg';
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupThumbnailInteractions();
    setupIntersectionObserver();
    setupImageErrorHandling();
    
    console.log('🚀 3D Cyber Slider initialized successfully!');
});

// Export functions for potential external use
window.SliderAPI = {
    next: nextSlide,
    prev: prevSlide,
    goTo: goToSlide,
    pause: () => isAutoPlay = false,
    resume: () => {
        isAutoPlay = true;
        startAutoPlay();
    },
    getCurrentIndex: () => activeIndex
};