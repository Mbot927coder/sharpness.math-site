/* global Vue, games, getThumbnail */
const { createApp, computed, onMounted, ref, watch } = Vue;

const categories = {
  Action: ['⚔️', 'var(--accent-orange)', 'rgba(251,86,7,.15)'],
  Adventure: ['🗺️', 'var(--accent-purple)', 'rgba(131,56,236,.15)'],
  Puzzle: ['🧩', 'var(--accent-yellow)', 'rgba(255,190,11,.15)'],
  Racing: ['🏎️', 'var(--accent-magenta)', 'rgba(255,0,110,.15)'],
  Sports: ['🏆', 'var(--accent-cyan)', 'rgba(0,255,198,.15)'],
  Shooter: ['🔫', 'var(--accent-blue)', 'rgba(58,134,255,.15)'],
};

const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
};

createApp({
  setup() {
    const page = ref(location.pathname.endsWith('games.html') ? 'games' : location.pathname.endsWith('about.html') ? 'about' : location.pathname.endsWith('settings.html') ? 'settings' : 'home');
    const hubOpen = ref(false);
    const theme = ref(localStorage.getItem('siteTheme') || 'dark');
    const sidebar = ref(localStorage.getItem('sidebarMode') || 'hub');
    const particles = ref(localStorage.getItem('particlesEnabled') !== 'false');
    const connections = ref(localStorage.getItem('particleConnections') !== 'false');
    const intensity = ref(Number(localStorage.getItem('particleIntensity') || 1));
    const favorites = ref(storage.get('favorites').filter(title => games.some(game => game.title === title)));
    const recents = ref(storage.get('recentlyPlayed').filter(item => games.some(game => game.title === item.title)));
    const urlCategory = new URLSearchParams(location.search).get('category');
    const selected = ref(urlCategory && (urlCategory === 'all' || categories[urlCategory]) ? urlCategory : 'all');
    const library = ref(Boolean(urlCategory));
    const search = ref('');
    const sort = ref(localStorage.getItem('gameSort') || 'default');
    const activeGame = ref(null);
    const gameView = ref(null);

    const categoryNames = computed(() => Object.keys(categories).filter(name => games.some(game => game.category === name)));
    const counts = computed(() => Object.fromEntries(categoryNames.value.map(name => [name, games.filter(game => game.category === name).length])));
    const favouriteGames = computed(() => games.filter(game => favorites.value.includes(game.title)));
    const recentGames = computed(() => recents.value.map(item => games.find(game => game.title === item.title)).filter(Boolean));
    const gameList = computed(() => {
      const needle = search.value.trim().toLowerCase();
      const result = games.filter(game => (!needle || (game.title + ' ' + game.category + ' ' + game.description).toLowerCase().includes(needle)) && (selected.value === 'all' || game.category === selected.value));
      if (sort.value === 'az') result.sort((a, b) => a.title.localeCompare(b.title));
      if (sort.value === 'za') result.sort((a, b) => b.title.localeCompare(a.title));
      if (sort.value === 'fav') result.sort((a, b) => Number(favorites.value.includes(b.title)) - Number(favorites.value.includes(a.title)));
      return result;
    });
    const libraryTitle = computed(() => selected.value === 'all' ? 'All Games' : selected.value + ' Games');
    const summary = computed(() => categoryNames.value.map(name => name.toLowerCase()).join(', ') + ' titles.');

    function href(name, category) {
      const file = name === 'home' ? 'index.html' : name + '.html';
      return category ? file + '?category=' + encodeURIComponent(category) : file;
    }
    function active(name, category) { return page.value === name && (!category || selected.value === category); }
    function go(name, category) {
      page.value = name;
      if (name === 'games') { selected.value = category || 'all'; library.value = Boolean(category); }
      hubOpen.value = false;
    }
    function openLibrary(category) {
      selected.value = category;
      library.value = true;
      search.value = '';
      if (page.value === 'games') history.replaceState({}, '', href('games', category));
    }
    function toggleFavorite(title) {
      favorites.value = favorites.value.includes(title) ? favorites.value.filter(item => item !== title) : favorites.value.concat(title);
      storage.set('favorites', favorites.value);
    }
    function launch(game) {
      if (page.value !== 'games') {
        sessionStorage.setItem('launchGame', game.title);
        location.href = href('games', 'all');
        return;
      }
      activeGame.value = game;
      recents.value = [{ title: game.title, href: game.href, category: game.category, time: Date.now() }].concat(recents.value.filter(item => item.title !== game.title)).slice(0, 12);
      storage.set('recentlyPlayed', recents.value);
      setTimeout(() => scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
    function closeGame() {
      if (document.fullscreenElement === gameView.value) document.exitFullscreen().catch(() => {});
      activeGame.value = null;
    }
    function setSort(value) { sort.value = value; localStorage.setItem('gameSort', value); }
    function signOut() { alert('Nothing to sign out of 😄'); }
    function clearFavorites() { if (confirm('Clear all favorite games?')) { favorites.value = []; localStorage.removeItem('favorites'); } }
    function clearRecents() { if (confirm('Clear recently played history?')) { recents.value = []; localStorage.removeItem('recentlyPlayed'); } }
    function reset() { if (confirm('Reset ALL settings to defaults? This cannot be undone.')) { localStorage.clear(); location.reload(); } }

    function initParticles() {
      const canvas = document.createElement('canvas');
      canvas.id = 'particles-canvas';
      document.body.prepend(canvas);
      const ctx = canvas.getContext('2d');
      let dots = [];
      const resize = () => {
        canvas.width = innerWidth; canvas.height = innerHeight;
        const amount = Math.floor(canvas.width * canvas.height / 18000 * [0.5, 1, 1.8][intensity.value]);
        dots = Array.from({ length: amount }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6, size: Math.random() * 2 + .8 }));
      };
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (particles.value && !document.hidden) {
          dots.forEach((dot, index) => {
            dot.x += dot.vx; dot.y += dot.vy;
            if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
            if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
            if (connections.value) dots.slice(index + 1, index + 4).forEach(other => {
              const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
              if (distance < 120) { ctx.beginPath(); ctx.strokeStyle = 'rgba(0,255,198,' + (1 - distance / 120) * .12 + ')'; ctx.moveTo(dot.x, dot.y); ctx.lineTo(other.x, other.y); ctx.stroke(); }
            });
            ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,255,198,.35)'; ctx.fill();
          });
        }
        requestAnimationFrame(draw);
      };
      addEventListener('resize', resize);
      resize(); draw();
    }

    watch(theme, value => { localStorage.setItem('siteTheme', value); document.documentElement.setAttribute('data-theme', value); });
    watch(sidebar, value => { localStorage.setItem('sidebarMode', value); document.body.classList.toggle('regular-sidebar', value === 'regular'); });
    watch(particles, value => localStorage.setItem('particlesEnabled', value));
    watch(connections, value => localStorage.setItem('particleConnections', value));
    watch(intensity, value => { localStorage.setItem('particleIntensity', value); location.reload(); });
    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
      document.body.classList.toggle('regular-sidebar', sidebar.value === 'regular');
      initParticles();
      const queued = sessionStorage.getItem('launchGame');
      if (queued && page.value === 'games') {
        sessionStorage.removeItem('launchGame');
        const game = games.find(item => item.title === queued);
        if (game) launch(game);
      }
    });

    return { games, categories, categoryNames, counts, page, hubOpen, theme, sidebar, particles, connections, intensity, favorites, recents, favouriteGames, recentGames, selected, library, search, sort, activeGame, gameView, gameList, libraryTitle, summary, getThumbnail, href, active, go, openLibrary, toggleFavorite, launch, closeGame, setSort, signOut, clearFavorites, clearRecents, reset };
  },
  template: `
    <div class="app-container">
      <button class="hub-trigger" :class="{active: hubOpen}" @click="hubOpen = !hubOpen">{{ hubOpen ? '✕' : 'S' }}</button>
      <aside class="sidebar" :class="{active: hubOpen}">
        <div class="sidebar-header"><div class="logo-icon">S</div><span class="brand-text">Sharpness Math</span></div>
        <nav class="sidebar-nav">
          <div class="nav-section-title">Navigation</div>
          <a class="nav-item" :class="{active: active('home')}" href="index.html"><span class="icon">🏠</span> Home</a>
          <a class="nav-item" :class="{active: active('games') && !library}" href="games.html"><span class="icon">🎮</span> Games</a>
          <a class="nav-item" :class="{active: active('about')}" href="about.html"><span class="icon">ℹ️</span> About</a>
          <a class="nav-item" :class="{active: active('settings')}" href="settings.html"><span class="icon">⚙️</span> Settings</a>
          <div class="nav-section-title">Categories</div>
          <a v-for="name in categoryNames" :key="name" class="nav-item" :class="{active: active('games', name)}" :href="href('games', name)"><span class="class-dot" :class="'dot-' + name.toLowerCase()"></span>{{ name }}</a>
        </nav>
        <div class="sidebar-footer"><button class="btn-signout" @click="signOut">↩ Sign Out</button></div>
      </aside>
      <div class="main-column">
        <nav class="mobile-nav"><a class="nav-item" href="index.html">🏠 Home</a><a class="nav-item" href="games.html">🎮 Games</a><a class="nav-item" href="about.html">ℹ️ About</a><a class="nav-item" href="settings.html">⚙️ Settings</a></nav>
        <main class="page-shell">
          <template v-if="page === 'home'">
            <section class="hero"><div class="hero-copy"><div class="hero-chip-row"><span class="hero-chip">🚀 Instant Launch</span><span class="hero-chip">🔒 Unblocked</span><span class="hero-chip">📱 Mobile Ready</span></div><p class="eyebrow">Unblocked Games Portal</p><h1>sharpness<span class="neon-text">.math</span></h1><p class="lead">GUYS, we are officially getting a redesign ⚜️, also, I will change da branding :D. It will kinda look like z-kit and sight.math (legacy was sight.w)</p><div class="hero-actions"><a class="button button-primary" href="games.html">🎮 Browse Games</a><a class="button button-secondary" href="about.html">ℹ️ About</a></div><div class="hero-stats"><div class="stat"><span>{{ games.length }} Games</span><p>{{ summary }}</p></div><div class="stat"><span>One-Click Play</span><p>Launch any game instantly in an embedded iframe player.</p></div><div class="stat"><span>Save Favorites</span><p>Heart your top games and access them quickly from the homepage.</p></div></div></div><aside class="hero-panel"><p class="panel-label">Portal Preview</p><div class="panel-window"><div class="panel-window-bar"><span></span><span></span><span></span></div><div class="panel-screen"><div class="panel-content"><div class="panel-display"><strong>Neon Grid UI</strong><p>Dark mode with cyan, magenta, and blue neon accents.</p></div><ul class="stack-list"><li><strong>Game thumbnails</strong> auto-generated per title</li><li><strong>Favorites & recents</strong> saved in localStorage</li><li><strong>Category filtering</strong> with URL-based state</li></ul></div></div></div></aside></section>
            <section class="category-section"><div class="section-heading-row"><div><p class="section-label">Browse</p><h2>Categories</h2></div><a class="view-all-link" href="games.html?category=all">View all →</a></div><div class="category-grid"><a v-for="name in categoryNames" :key="name" class="category-card" :href="href('games', name)" :style="{'--card-accent':categories[name][1],'--card-glow':categories[name][2]}"><div class="category-icon">{{ categories[name][0] }}</div><h3>{{ name }}</h3><p>{{ counts[name] }} games</p></a></div></section>
            <section class="featured-section"><div class="section-heading-row"><div><p class="section-label">Upcoming</p><h2>Placeholder Games</h2></div><a class="view-all-link" href="games.html?category=all">View all →</a></div><div class="featured-grid"><a v-for="game in games" :key="game.title" class="featured-card" href="games.html?category=all" @click="sessionStorage.setItem('launchGame', game.title)"><img class="featured-thumb" :src="getThumbnail(game.title,game.category)" :alt="game.title"><div class="featured-info"><span class="featured-tag">{{ game.category }}</span><h3>{{ game.title }}</h3><p>{{ game.description }}</p></div></a></div></section>
            <section class="featured-section"><div class="section-heading-row"><div><p class="section-label">History</p><h2>Recently Played</h2></div></div><div class="strip-grid"><div v-if="!recentGames.length" class="empty-state">No games played yet. Start playing to see them here!</div><button v-for="game in recentGames.slice(0,6)" :key="game.title" class="strip-card" @click="launch(game)"><img class="strip-thumb" :src="getThumbnail(game.title,game.category)" :alt="game.title"><div class="strip-info"><h4>{{ game.title }}</h4><p>{{ game.category }}</p></div></button></div></section>
            <section class="featured-section"><div class="section-heading-row"><div><p class="section-label">Saved</p><h2>Your Favorites</h2></div></div><div class="strip-grid"><div v-if="!favouriteGames.length" class="empty-state">No favorites yet. Heart games on the Games page to see them here!</div><button v-for="game in favouriteGames.slice(0,6)" :key="game.title" class="strip-card" @click="launch(game)"><img class="strip-thumb" :src="getThumbnail(game.title,game.category)" :alt="game.title"><div class="strip-info"><h4>{{ game.title }}</h4><p>{{ game.category }}</p></div></button></div></section>
          </template>
          <template v-else-if="page === 'games'">
            <section id="gameView" ref="gameView" :style="{display:activeGame?'flex':'none'}"><div class="game-view-header"><span class="game-view-title">{{ activeGame && activeGame.title }}</span><div class="game-view-actions"><button class="btn-game-control" @click="gameView.requestFullscreen()">⛶ Fullscreen</button><button class="btn-close-game" @click="closeGame">✕ Close</button></div></div><iframe v-if="activeGame" id="gameFrame" :src="activeGame.href" :title="activeGame.title" allowfullscreen></iframe></section>
            <section v-if="!library" class="category-section"><div class="section-heading-row"><div><p class="section-label">Library</p><h2>Choose a Category</h2></div></div><div class="category-grid"><button class="category-card" @click="openLibrary('all')"><div class="category-icon">🎮</div><h3>All Games</h3><p>Every game in the library</p></button><button v-for="name in categoryNames" :key="name" class="category-card" :style="{'--card-accent':categories[name][1],'--card-glow':categories[name][2]}" @click="openLibrary(name)"><div class="category-icon">{{ categories[name][0] }}</div><h3>{{ name }}</h3><p>{{ counts[name] }} games</p></button></div></section>
            <template v-else><section class="toolbar"><div class="toolbar-copy"><p class="section-label">Find Games</p><h2>Search & Filter</h2><p>Use the controls to jump straight to a game by name or browse by category.</p></div><div class="controls"><label class="control"><span>🔍 Search</span><input v-model="search" type="search" placeholder="Search games..."></label><label class="control"><span>📂 Category</span><select v-model="selected" @change="openLibrary(selected)"><option value="all">All games</option><option v-for="name in categoryNames" :key="name" :value="name">{{ name }}</option></select></label></div></section><div class="sort-bar"><span>Sort:</span><button v-for="option in [['default','Default'],['az','A → Z'],['za','Z → A'],['fav','Favorites']]" :key="option[0]" class="sort-btn" :class="{active:sort===option[0]}" @click="setSort(option[0])">{{ option[1] }}</button></div><section class="math-section"><div class="section-heading"><div><p class="section-label">Library</p><h2>{{ libraryTitle }}</h2></div><p class="results-count">{{ gameList.length }} games</p></div><div class="math-grid"><div v-if="!gameList.length" class="empty-state">No games match that search. Try a different title or category.</div><article v-for="game in gameList" :key="game.title" class="math-card"><img class="game-thumb" :src="getThumbnail(game.title,game.category)" :alt="game.title"><div class="math-card-body"><div class="math-top"><div><p class="math-tag">{{ game.category }}</p><h3>{{ game.title }}</h3></div><span class="math-meta">{{ game.status }}</span></div><p class="math-description">{{ game.description }}</p><div class="math-actions"><button class="card-button primary" @click="launch(game)">Play now</button><button class="btn-favorite" :class="{'is-fav':favorites.includes(game.title)}" @click="toggleFavorite(game.title)">{{ favorites.includes(game.title) ? '❤' : '♡' }}</button><a class="card-button" :href="game.href" download>↓</a></div></div></article></div></section></template>
          </template>
          <template v-else-if="page === 'about'"><section class="about"><div><p class="section-label">About</p><h2>Vue-powered game hosting, kept simple</h2><p>sharpness.math is a Vue-powered launcher for verified local HTML game files. It reads from <code>games.js</code>, embeds games inside the Games page viewer, and stores favorites, recents, theme, and particle settings in your browser.</p><p>The current library includes {{ games.length }} working games across {{ summary }}</p><div class="hero-actions" style="margin-top:1.5rem"><a class="button button-primary" href="games.html">Browse Games</a><a class="button button-secondary" href="index.html">Back to Home</a></div></div><ul class="about-list"><li>No backend or build step is required</li><li>Games launch from the local <code>Maths stuff</code> folder</li><li>Favorites and recently played history stay in localStorage</li><li>The Games page supports search, category filters, and fullscreen play</li></ul></section></template>
          <template v-else><div class="section-heading-row"><div><p class="section-label">Preferences</p><h2>Settings</h2></div></div><div class="settings-grid"><section class="settings-card"><h3>🎨 Appearance</h3><p>Customize how the portal looks.</p><div class="toggle-wrap"><div><div class="toggle-label">Dark Mode</div><div class="toggle-sublabel">Toggle between dark and light themes</div></div><label class="switch"><input type="checkbox" :checked="theme==='dark'" @change="theme=$event.target.checked?'dark':'light'"><span class="slider"></span></label></div><div class="toggle-wrap"><div><div class="toggle-label">Static Sidebar</div><div class="toggle-sublabel">Keep sidebar fixed instead of floating hub</div></div><label class="switch"><input type="checkbox" :checked="sidebar==='regular'" @change="sidebar=$event.target.checked?'regular':'hub'"><span class="slider"></span></label></div></section><section class="settings-card"><h3>✨ Particles</h3><p>Adjust the background particle effects.</p><div class="toggle-wrap"><div><div class="toggle-label">Enable Particles</div></div><label class="switch"><input v-model="particles" type="checkbox"><span class="slider"></span></label></div><div class="toggle-wrap"><div><div class="toggle-label">Connection Lines</div></div><label class="switch"><input v-model="connections" type="checkbox"><span class="slider"></span></label></div><div class="toggle-wrap"><div><div class="toggle-label">Particle Intensity</div></div><div><button v-for="item in [[0,'Low'],[1,'Med'],[2,'High']]" :key="item[0]" class="sort-btn" :class="{active:intensity===item[0]}" @click="intensity=item[0]">{{ item[1] }}</button></div></div></section><section class="settings-card"><h3>🗑️ Data</h3><p>Manage your locally saved data.</p><div class="toggle-wrap"><span>Clear Favorites</span><button class="card-button" @click="clearFavorites">Clear</button></div><div class="toggle-wrap"><span>Clear Recently Played</span><button class="card-button" @click="clearRecents">Clear</button></div><div class="toggle-wrap"><span>Reset All Settings</span><button class="btn-close-game" @click="reset">Reset</button></div></section><section class="settings-card"><h3>📊 Stats</h3><p>Your portal usage at a glance.</p><div class="hero-stats"><div class="stat"><span>{{ games.length }}</span><p>Total Games</p></div><div class="stat"><span>{{ favorites.length }}</span><p>Favorites</p></div><div class="stat"><span>{{ recents.length }}</span><p>Recently Played</p></div><div class="stat"><span>{{ categoryNames.length }}</span><p>Categories</p></div></div></section></div></template>
        </main>
      </div>
    </div>
  `,
}).mount('#app');
