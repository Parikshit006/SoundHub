document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize loading animation
    function initLoadingAnimation() {
        const loadingAnimation = document.getElementById('loadingAnimation');
        if (loadingAnimation) {
            // Simulate loading time
            setTimeout(() => {
                loadingAnimation.classList.add('fade-out');
                setTimeout(() => {
                    loadingAnimation.style.display = 'none';
                }, 500);
            }, 1500);
        }
    }
    
    // Initialize scroll iAndicator
    function initScrollIndicator() {
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (scrollIndicator) {
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                
                // Update the scroll indicator progress
                scrollIndicator.style.setProperty('--scroll-progress', `${scrollPercent}%`);
            }, { passive: true });
        }
    }
    
    function initBackgrounds() {
        document.querySelectorAll('.parallax-bg').forEach(bg => {
            const bgUrl = bg.dataset.bg;
            if (bgUrl) {
                bg.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgUrl})`;
            }
        });
    }
    
    function initParallax() {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;

            document.querySelectorAll('.parallax-section').forEach((section) => {
                const bg = section.querySelector('.parallax-bg');
                if (bg) {
                    const rect = section.getBoundingClientRect();
                    const speed = 0.5;

                    if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                        const offset = rect.top;
                        const movement = offset * speed;
                        bg.style.transform = `translateY(${movement}px)`;
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    function initAnimationObserver() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    if (entry.target.classList.contains('sound-bar')) {
                        entry.target.style.animationPlayState = 'running';
                    }
                    
                    if (entry.target.classList.contains('cultural-card')) {
                        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                        entry.target.style.animationDelay = `${delay}ms`;
                    }
                    
                    // Enhanced animation for instrument cards
                    if (entry.target.classList.contains('instrument-card')) {
                        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 150;
                        entry.target.style.animationDelay = `${delay}ms`;
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px)';
                        
                        setTimeout(() => {
                            entry.target.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, delay);
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.instrument-card, .cultural-card, .sound-bar').forEach(el => {
            observer.observe(el);
        });
    }

    function initFooterObserver() {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sections = entry.target.querySelectorAll('.footer-section');
                    sections.forEach((section, index) => {
                        setTimeout(() => {
                            section.classList.add('in-view');
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.2
        });

        const footer = document.querySelector('.musical-footer');
        if (footer) {
            footerObserver.observe(footer);
        }
    }

    // Enhanced card interactions with better animations
    function initCardInteractions() {
        
        document.querySelectorAll('.instrument-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                
                // Enhanced sound icon animation
                const soundElement = this.querySelector('.sound-icon');
                if (soundElement) {
                    soundElement.style.animation = 'pulse 0.6s ease-in-out';
                }
                
                // Add glow effect
                this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
                
                const soundElement = this.querySelector('.sound-icon');
                if (soundElement) {
                    soundElement.style.animation = 'pulse 2s ease-in-out infinite';
                }
            });
        });

        // Enhanced cultural card interactions
        document.querySelectorAll('.cultural-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                
                const soundElement = this.querySelector('.sound-icon');
                if (soundElement) {
                    soundElement.style.animation = 'pulse 0.6s ease-in-out';
                }
                
                // Add cultural-specific glow
                const culture = this.dataset.culture;
                if (culture) {
                    const colors = {
                        indian: 'hsla(45, 100%, 50%, 0.3)',
                        african: 'hsla(25, 100%, 50%, 0.3)',
                        latin: 'hsla(340, 100%, 50%, 0.3)',
                        japanese: 'hsla(0, 100%, 50%, 0.3)'
                    };
                    this.style.boxShadow = `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px ${colors[culture]}`;
                }
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
                
                const soundElement = this.querySelector('.sound-icon');
                if (soundElement) {
                    soundElement.style.animation = 'pulse 2s ease-in-out infinite';
                }
            });
        });
    }

    // Enhanced sound bars with better timing
    function initSoundBars() {
        const soundBars = document.querySelectorAll('.sound-bar');
        
        const animateBars = () => {
            soundBars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.animation = 'soundWave 1.5s ease-in-out infinite';
                }, index * 100);
            });
        };

        // Trigger animation when section comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateBars();
                }
            });
        }, { threshold: 0.5 });

        const soundSection = document.querySelector('#section1');
        if (soundSection) {
            observer.observe(soundSection);
        }
    }

    // Enhanced keyboard navigation
    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            const sections = document.querySelectorAll('.parallax-section');
            const currentSection = Array.from(sections).findIndex(section => {
                const rect = section.getBoundingClientRect();
                return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
            });

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                if (currentSection < sections.length - 1) {
                    sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (currentSection > 0) {
                    sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Enhanced performance optimization
    function optimizePerformance() {
        let ticking = false;

        function updateAnimations() {
            // Update floating notes positions based on scroll
            const scrolled = window.pageYOffset;
            document.querySelectorAll('.note').forEach((note, index) => {
                const speed = 0.1 + (index * 0.05);
                note.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateAnimations);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Enhanced floating elements animation
    function initFloatingElements() {
        const floatingIcons = document.querySelectorAll('.floating-icon');
        
        floatingIcons.forEach((icon, index) => {
            // Add random movement to floating icons
            setInterval(() => {
                const randomX = (Math.random() - 0.5) * 20;
                const randomY = (Math.random() - 0.5) * 20;
                icon.style.transform = `translate(${randomX}px, ${randomY}px)`;
            }, 3000 + (index * 500));
        });
    }

    // Enhanced section transitions
    function initSectionTransitions() {
        const sections = document.querySelectorAll('.parallax-section');
        
        sections.forEach((section, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Add entrance animation
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(50px)';
                        
                        setTimeout(() => {
                            section.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, index * 200);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(section);
        });
    }

    // Enhanced click interactions for cultural cards
    function initCulturalCardClicks() {
        document.querySelectorAll('.cultural-card').forEach(card => {
            card.addEventListener('click', function() {
                const culture = this.dataset.culture;
                const cultureName = this.querySelector('.cultural-name').textContent;
                
                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                }, 150);
                
                // Show culture info (you can enhance this with actual navigation)
                console.log(`Exploring ${cultureName} music culture...`);
            });
        });
    }

    // Enhanced scroll-based effects
    function initScrollEffects() {
        let lastScrollY = window.pageYOffset;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.pageYOffset;
            const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            
            // Add subtle parallax to floating notes based on scroll direction
            document.querySelectorAll('.note').forEach((note, index) => {
                const speed = 0.05 + (index * 0.02);
                const movement = scrollDirection === 'down' ? speed : -speed;
                note.style.transform += ` translateY(${movement}px)`;
            });
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    // Initialize all functions
    function init() {
        initLoadingAnimation();
        initScrollIndicator();
        initBackgrounds();
        initParallax();
        initAnimationObserver();
        initFooterObserver();
        initCardInteractions();
        initSoundBars();
        initKeyboardNavigation();
        optimizePerformance();
        initFloatingElements();
        initSectionTransitions();
        initCulturalCardClicks();
        initScrollEffects();
        
        console.log('🎵 SoundHub Landing Page Enhanced!');
    }

    init();
});

// Enhanced section navigation function
function playSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Add visual feedback
        section.style.transform = 'scale(1.02)';
        setTimeout(() => {
            section.style.transform = 'scale(1)';
        }, 300);
    }
}

window.LifeOfSound = {
    playSection,
    version: '1.0.0'
};
