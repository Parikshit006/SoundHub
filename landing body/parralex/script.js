
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    document.querySelectorAll('.parallax-section').forEach((section, index) => {
        const bg = section.querySelector('.parallax-bg');
        const rect = section.getBoundingClientRect();
        const speed = 0.5;

        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
            const offset = rect.top;
            const movement = offset * speed;
            bg.style.transform = `translateY(${movement}px)`;
        }
    });
}, { passive: true });


document.documentElement.style.scrollBehavior = 'smooth';
 const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, {
    threshold: 0.2
  });

  document.querySelectorAll('.footer-section').forEach(el => observer.observe(el));