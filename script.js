const games = [
  {
    title: "Subway Surfers",
    category: "Runner",
    status: "Ready idea",
    description: "A fast-paced endless runner slot for one of the most recognizable unblocked game picks.",
    primaryLabel: "Add launcher",
    primaryHref: "#",
    secondaryLabel: "Category: Runner"
  },
  {
    title: "2048",
    category: "Puzzle",
    status: "Ready idea",
    description: "A clean puzzle card that fits perfectly into a simple grid-based game hub.",
    primaryLabel: "Add launcher",
    primaryHref: "#",
    secondaryLabel: "Category: Puzzle"
  },
  {
    title: "Fireboy and Watergirl",
    category: "Co-op",
    status: "Ready idea",
    description: "A co-op slot that shows how multiplayer-friendly games can sit beside solo titles.",
    primaryLabel: "Add launcher",
    primaryHref: "#",
    secondaryLabel: "Category: Co-op"
  },
  {
    title: "Geometry Dash",
    category: "Platformer",
    status: "Ready idea",
    description: "A rhythm platformer example that works well for search, tags, and future filtering.",
    primaryLabel: "Add launcher",
    primaryHref: "#",
    secondaryLabel: "Category: Platformer"
  },
  {
    title: "Among Us",
    category: "Party",
    status: "Future add",
    description: "A social game example to show how broader genres can fit into the same UI.",
    primaryLabel: "Add launcher",
    primaryHref: "#",
    secondaryLabel: "Category: Party"
  },
  {
    title: "Hollow Knight",
    category: "Adventure",
    status: "Future add",
    description: "An adventure entry that helps the site feel more complete as your collection grows.",
    primaryLabel: "Add launcher",
    primaryHref: "#",
    secondaryLabel: "Category: Adventure"
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
        No games match that search yet. Try a different word or category.
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
