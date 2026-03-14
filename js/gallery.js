// Loads data/gallery.json and renders per-section galleries.
// Keyboard and click handlers for the lightbox.
// Add images by editing data/gallery.json (see the example file).

const galleryDataUrl = 'data/gallery.json';

async function loadData() {
  const resp = await fetch(galleryDataUrl, {cache: "no-cache"});
  if (!resp.ok) {
    console.error('Failed to load gallery data', resp.status);
    return [];
  }
  return resp.json();
}

function createTile(item, index) {
  const a = document.createElement('a');
  a.href = "#";
  a.className = 'tile';
  a.dataset.index = index;
  a.dataset.section = item.section;
  a.setAttribute('aria-label', item.title || 'Gallery item');

  const img = document.createElement('img');
  img.src = item.thumb;
  img.alt = item.title || '';
  img.loading = 'lazy';

  const cap = document.createElement('div');
  cap.className = 'tile-caption';
  cap.textContent = item.title || '';

  a.appendChild(img);
  if (item.title) a.appendChild(cap);
  return a;
}

function renderGalleries(items) {
  const containers = document.querySelectorAll('.gallery-grid');
  // flatten indexable list for lightbox navigation
  const indexList = [];
  items.forEach((it) => {
    const container = document.querySelector(`.gallery-grid[data-section="${it.section}"]`);
    if (!container) return;
    const tile = createTile(it, indexList.length);
    container.appendChild(tile);
    indexList.push(it);
  });
  return indexList;
}

/* Lightbox */
const lightbox = document.getElementById('lightbox');
const lbImage = lightbox.querySelector('.lightbox-image');
const lbTitle = lightbox.querySelector('.lightbox-caption .title');
const lbResource = lightbox.querySelector('.lightbox-caption .open-resource');
const closeBtn = lightbox.querySelector('.close');
const prevBtn = lightbox.querySelector('.prev');
const nextBtn = lightbox.querySelector('.next');

let currentIndex = -1;
let itemsIndex = [];

function openLightbox(index) {
  const item = itemsIndex[index];
  if (!item) return;
  currentIndex = index;
  lbImage.src = item.full;
  lbImage.alt = item.title || '';
  lbTitle.textContent = item.title || '';
  if (item.resource) {
    lbResource.style.display = 'inline-block';
    lbResource.href = item.resource;
    lbResource.textContent = item.resourceLabel || 'Open resource';
  } else {
    lbResource.style.display = 'none';
  }
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox.setAttribute('aria-hidden', 'true');
  lbImage.src = '';
  currentIndex = -1;
}

function goNext() {
  if (itemsIndex.length === 0) return;
  openLightbox((currentIndex + 1) % itemsIndex.length);
}
function goPrev() {
  if (itemsIndex.length === 0) return;
  openLightbox((currentIndex - 1 + itemsIndex.length) % itemsIndex.length);
}

function attachHandlers(indexList) {
  itemsIndex = indexList;

  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = Number(tile.dataset.index);
      openLightbox(idx);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
  });
}

(async function init() {
  const data = await loadData();
  if (!data || !Array.isArray(data)) return;
  // Render
  const indexList = renderGalleries(data);
  attachHandlers(indexList);
})();