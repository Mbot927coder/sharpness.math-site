const games = [
  {
    title: "Basket Random",
    category: "Sports",
    status: "Ready to play",
    description: "Arcade basketball chaos with quick rounds and simple controls.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/Basket%20Random.html",
    secondaryLabel: "File: Basket Random.html"
  },
  {
    title: "Boxing Random",
    category: "Sports",
    status: "Ready to play",
    description: "A goofy one-on-one boxing game built for short, fast matches.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/Boxing%20Random.html",
    secondaryLabel: "File: Boxing Random.html"
  },
  {
    title: "Brotato",
    category: "Action",
    status: "Ready to play",
    description: "Arena survival action with swarms, upgrades, and constant movement.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/Brotato.html",
    secondaryLabel: "File: Brotato.html"
  },
  {
    title: "Hollow Knight",
    category: "Adventure",
    status: "Ready to play",
    description: "An exploration-heavy action adventure with platforming and combat.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/Hollow%20Knight.html",
    secondaryLabel: "File: Hollow Knight.html"
  },
  {
    title: "Soccer Random",
    category: "Sports",
    status: "Ready to play",
    description: "Physics-heavy soccer matches with unpredictable bounces and fast pacing.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/Soccer%20Random.html",
    secondaryLabel: "File: Soccer Random.html"
  },
  {
    title: "Volley Random",
    category: "Sports",
    status: "Ready to play",
    description: "A volleyball spin on the random sports formula with quick back-and-forth rounds.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/Volley%20Random.html",
    secondaryLabel: "File: Volley Random.html"
  },
  {
    title: "10 Minutes Till Dawn",
    category: "Action",
    status: "Ready to play",
    description: "A survival shooter focused on crowd control, dodging, and weapon upgrades.",
    primaryLabel: "Play now",
    primaryHref: "Video%20Games/cl10minutestildawn.html",
    secondaryLabel: "File: cl10minutestildawn.html"
  }
];

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const gamesGrid = document.getElementById("gamesGrid");
const resultsCount = document.getElementById("resultsCount");

function uniqueCategories(items) {
  return [...new Set(items.map((item) => item.category))].sort();
}

function fillCategoryOptions() {
  uniqueCategories(games).forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

function matchesSearch(game, query) {
  const haystack = `${game.title} ${game.category} ${game.description}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function filteredGames() {
  const query = searchInput.value.trim();
  const category = categoryFilter.value;

  return games.filter((game) => {
    const searchMatch = query ? matchesSearch(game, query) : true;
    const categoryMatch = category === "all" ? true : game.category === category;
    return searchMatch && categoryMatch;
  });
}

function gameCardMarkup(game) {
  return `
    <article class="game-card">
      <div class="game-top">
        <div>
          <p class="game-tag">${game.category}</p>
          <h3>${game.title}</h3>
        </div>
        <span class="game-meta">${game.status}</span>
      </div>
      <p class="game-description">${game.description}</p>
      <div class="game-actions">
        <a class="card-button primary" href="${game.primaryHref}">${game.primaryLabel}</a>
        <span class="card-button">${game.secondaryLabel}</span>
      </div>
    </article>
  `;
}

function renderGames() {
  const items = filteredGames();
  resultsCount.textContent = `${items.length} game${items.length === 1 ? "" : "s"} shown`;

  if (!items.length) {
    gamesGrid.innerHTML = `
      <div class="empty-state">
        No games match that search. Try a different title or category.
      </div>
    `;
    return;
  }

  gamesGrid.innerHTML = items.map(gameCardMarkup).join("");
}

fillCategoryOptions();
renderGames();

searchInput.addEventListener("input", renderGames);
categoryFilter.addEventListener("change", renderGames);
