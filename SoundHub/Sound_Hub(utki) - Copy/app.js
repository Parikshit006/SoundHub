let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let thumbnails = document.querySelectorAll('.thumbnail .item');

// tracking active slide
let countItem = items.length;
let itemActive = 0;

const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
  item.addEventListener('click', e => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// navigation
next.onclick = () => {
  itemActive = (itemActive + 1) % countItem;
  showSlider();
};

prev.onclick = () => {
  itemActive = (itemActive - 1 + countItem) % countItem;
  showSlider();
};

// main slider control
function showSlider() {
  document.querySelector('.slider .list .item.active')?.classList.remove('active');
  document.querySelector('.thumbnail .item.active')?.classList.remove('active');

  items[itemActive].classList.add('active');
  thumbnails[itemActive].classList.add('active');

  scrollThumbnailIntoView(thumbnails[itemActive]);
}

// center active thumbnail
function scrollThumbnailIntoView(el) {
  let rect = el.getBoundingClientRect();
  if (rect.left < 0 || rect.right > window.innerWidth) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }
}

// hover scale on thumbnail dock
const thumbnailContainer = document.querySelector('.thumbnail');

thumbnailContainer.addEventListener('mousemove', (e) => {
  const containerRect = thumbnailContainer.getBoundingClientRect();
  const mouseX = e.clientX - containerRect.left;

  thumbnails.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2 - containerRect.left;
    const distance = Math.abs(mouseX - itemCenter);
    const maxDist = 200;

    let scale = 1 + Math.max(0, (1 - distance / maxDist)) * 0.3; // reduced hover scale
    scale = Math.min(scale, 1.3); // hover effect is now more subtle
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

// click-to-jump using hover too
thumbnails.forEach((thumb, index) => {
  thumb.addEventListener('mouseenter', () => {
    itemActive = index;
    showSlider();
  });
});
