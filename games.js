const games = [
  { title: "Action Placeholder", category: "Action", status: "Coming soon", description: "A placeholder slot for a future action game.", href: "placeholder-game.html?title=Action%20Placeholder" },
  { title: "Adventure Placeholder", category: "Adventure", status: "Coming soon", description: "A placeholder slot for a future adventure game.", href: "placeholder-game.html?title=Adventure%20Placeholder" },
  { title: "Puzzle Placeholder", category: "Puzzle", status: "Coming soon", description: "A placeholder slot for a future puzzle game.", href: "placeholder-game.html?title=Puzzle%20Placeholder" },
  { title: "Racing Placeholder", category: "Racing", status: "Coming soon", description: "A placeholder slot for a future racing game.", href: "placeholder-game.html?title=Racing%20Placeholder" },
  { title: "Sports Placeholder", category: "Sports", status: "Coming soon", description: "A placeholder slot for a future sports game.", href: "placeholder-game.html?title=Sports%20Placeholder" },
  { title: "Shooter Placeholder", category: "Shooter", status: "Coming soon", description: "A placeholder slot for a future shooter game.", href: "placeholder-game.html?title=Shooter%20Placeholder" },
];

// ── Thumbnail generation ──
const thumbCanvas = document.createElement('canvas');
thumbCanvas.width = 320;
thumbCanvas.height = 200;
const thumbCtx = thumbCanvas.getContext('2d');

const categoryColors = {
  Action:    ['#ff6b35', '#f7c59f'],
  Sports:    ['#00ffc6', '#004d3d'],
  Adventure: ['#8338ec', '#c4a4ff'],
  Puzzle:    ['#ffbe0b', '#fff3cd'],
  Racing:    ['#ff006e', '#ffb3d1'],
  Shooter:   ['#3a86ff', '#b3d1ff'],
};

function generateThumbnail(title, category) {
  const colors = categoryColors[category] || ['#00ffc6', '#004d3d'];
  const c1 = colors[0];
  const c2 = colors[1];

  // Reset the shared canvas so previous labels don't bleed into the next thumb.
  thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
  thumbCtx.fillStyle = '#05070d';
  thumbCtx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);

  // Background gradient
  const grad = thumbCtx.createLinearGradient(0, 0, 320, 200);
  grad.addColorStop(0, c1 + '22');
  grad.addColorStop(1, c2 + '18');
  thumbCtx.fillStyle = grad;
  thumbCtx.fillRect(0, 0, 320, 200);

  // Grid pattern
  thumbCtx.strokeStyle = c1 + '11';
  thumbCtx.lineWidth = 1;
  for (let x = 0; x < 320; x += 40) {
    thumbCtx.beginPath(); thumbCtx.moveTo(x, 0); thumbCtx.lineTo(x, 200); thumbCtx.stroke();
  }
  for (let y = 0; y < 200; y += 40) {
    thumbCtx.beginPath(); thumbCtx.moveTo(0, y); thumbCtx.lineTo(320, y); thumbCtx.stroke();
  }

  // Corner accents
  thumbCtx.fillStyle = c1 + '33';
  thumbCtx.fillRect(0, 0, 60, 4);
  thumbCtx.fillRect(0, 0, 4, 60);
  thumbCtx.fillRect(320-60, 200-4, 60, 4);
  thumbCtx.fillRect(320-4, 200-60, 4, 60);

  // Large initial(s)
  const initials = title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  thumbCtx.font = 'bold 80px "Orbitron", sans-serif';
  thumbCtx.fillStyle = c1 + '18';
  thumbCtx.textAlign = 'center';
  thumbCtx.textBaseline = 'middle';
  thumbCtx.fillText(initials, 160, 90);

  // Title
  thumbCtx.font = '600 16px "Inter", sans-serif';
  thumbCtx.fillStyle = '#f0f0f5';
  thumbCtx.textAlign = 'left';
  thumbCtx.fillText(title.length > 22 ? title.slice(0, 22) + '...' : title, 16, 170);

  // Category tag
  thumbCtx.font = '600 11px "Orbitron", sans-serif';
  thumbCtx.fillStyle = c1;
  thumbCtx.textAlign = 'right';
  thumbCtx.fillText(category.toUpperCase(), 304, 170);

  // Decorative line
  thumbCtx.strokeStyle = c1 + '44';
  thumbCtx.lineWidth = 2;
  thumbCtx.beginPath(); thumbCtx.moveTo(16, 185); thumbCtx.lineTo(304, 185); thumbCtx.stroke();

  return thumbCanvas.toDataURL('image/png');
}

const thumbnailCache = {};

function getThumbnail(title, category) {
  const key = title + '|' + category;
  if (!thumbnailCache[key]) {
    thumbnailCache[key] = generateThumbnail(title, category);
  }
  return thumbnailCache[key];
}

// ── Favorites & Recently Played ──
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
  catch { return []; }
}

function setFavorites(arr) {
  localStorage.setItem('favorites', JSON.stringify(arr));
}

function toggleFavorite(title) {
  const favs = getFavorites();
  const idx = favs.indexOf(title);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(title);
  setFavorites(favs);
  return idx < 0; // true if now favorited
}

function isFavorite(title) {
  return getFavorites().includes(title);
}

function getRecentlyPlayed() {
  try { return JSON.parse(localStorage.getItem('recentlyPlayed') || '[]'); }
  catch { return []; }
}

function addRecentlyPlayed(title, href, category) {
  let recents = getRecentlyPlayed().filter(r => r.title !== title);
  recents.unshift({ title, href, category, time: Date.now() });
  recents = recents.slice(0, 12);
  localStorage.setItem('recentlyPlayed', JSON.stringify(recents));
}
