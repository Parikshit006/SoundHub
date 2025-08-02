const items = document.querySelectorAll('.slider .list .item');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const thumbnails = document.querySelectorAll('.thumbnail .item');
const navItems = document.querySelectorAll('.nav-item');
const thumbnailContainer = document.querySelector('.thumbnail');

let itemActive = 0;
const countItem = items.length;

// Navigation bar active state
navItems.forEach(item => {
  item.addEventListener('click', e => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Slider navigation (Next/Prev buttons)
nextButton.addEventListener('click', () => {
  itemActive = (itemActive + 1) % countItem;
  showSlider();
});

prevButton.addEventListener('click', () => {
  itemActive = (itemActive - 1 + countItem) % countItem;
  showSlider();
});

// Main slider control function
function showSlider() {
  document.querySelector('.slider .list .item.active')?.classList.remove('active');
  document.querySelector('.thumbnail .item.active')?.classList.remove('active');

  items[itemActive].classList.add('active');
  thumbnails[itemActive].classList.add('active');

  scrollThumbnailIntoView(thumbnails[itemActive]);
}

// Center active thumbnail in view
function scrollThumbnailIntoView(el) {
  const rect = el.getBoundingClientRect();
  if (rect.left < 0 || rect.right > window.innerWidth) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }
}

// Thumbnail hover effect (scaling)
thumbnailContainer.addEventListener('mousemove', (e) => {
  const containerRect = thumbnailContainer.getBoundingClientRect();
  const mouseX = e.clientX - containerRect.left;

  thumbnails.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2 - containerRect.left;
    const distance = Math.abs(mouseX - itemCenter);
    const maxDist = 200;

    let scale = 1 + Math.max(0, (1 - distance / maxDist)) * 0.3;
    scale = Math.min(scale, 1.3);
    item.style.transform = `scale(${scale})`;
    item.style.zIndex = Math.floor(scale * 100);
  });
});

thumbnailContainer.addEventListener('mouseleave', () => {
  thumbnails.forEach(item => {
    item.style.transform = 'scale(1)';
    item.style.zIndex = '';
  });
});

// Thumbnail click to jump
thumbnails.forEach((thumb, index) => {
  thumb.addEventListener('mouseenter', () => { // Changed to mouseenter for consistency with the hover effect
    itemActive = index;
    showSlider();
  });
});