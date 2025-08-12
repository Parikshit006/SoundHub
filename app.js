const items = document.querySelectorAll('.slider .list .item');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const thumbnails = document.querySelectorAll('.thumbnail .item');
const navItems = document.querySelectorAll('.nav-item');
const thumbnailContainer = document.querySelector('.thumbnail');
const playButtons = document.querySelectorAll('.play-button');

let itemActive = 0;
const countItem = items.length;

const pageMap = [
  'drumpad.html',
  'piano.html',
  'shamisen.html'
];


// 🚀 Add click event to each Play button to navigate to its page
playButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    window.location.href = pageMap[index];
  });
});

// Navigation bar active state
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Slider navigation
nextButton.addEventListener('click', () => {
  itemActive = (itemActive + 1) % countItem;
  showSlider();
});

prevButton.addEventListener('click', () => {
  itemActive = (itemActive - 1 + countItem) % countItem;
  showSlider();
});

function showSlider() {
  document.querySelector('.slider .list .item.active')?.classList.remove('active');
  document.querySelector('.thumbnail .item.active')?.classList.remove('active');

  items[itemActive].classList.add('active');
  thumbnails[itemActive].classList.add('active');

  // Re-trigger animations
  const activeItem = items[itemActive];
  const animatedElements = activeItem.querySelectorAll('.category, .instrument-name, .description, .play-button');

  animatedElements.forEach(el => {
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
  });

  scrollThumbnailIntoView(thumbnails[itemActive]);
}

function scrollThumbnailIntoView(el) {
  const rect = el.getBoundingClientRect();
  if (rect.left < 0 || rect.right > window.innerWidth) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }
}

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

thumbnails.forEach((thumb, index) => {
  thumb.addEventListener('mouseenter', () => {
    itemActive = index;
    showSlider();
  });
});

// Initialize the slider to show DrumPad as default
document.addEventListener('DOMContentLoaded', () => {
  // Ensure DrumPad is active by default
  itemActive = 0;
  showSlider();
});
