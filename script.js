const games = [
  {
    title: "Placeholder Item One",
    category: "Group A",
    status: "Sample status",
    description: "Example card copy used to preview the component without showing final content details.",
    primaryLabel: "Primary link",
    primaryHref: "#",
    secondaryLabel: "Tag: Group A"
  },
  {
    title: "Placeholder Item Two",
    category: "Group B",
    status: "Sample status",
    description: "Neutral supporting text fills out the card while keeping the recent changes abstracted away.",
    primaryLabel: "Primary link",
    primaryHref: "#",
    secondaryLabel: "Tag: Group B"
  },
  {
    title: "Placeholder Item Three",
    category: "Group C",
    status: "Sample status",
    description: "This card exists only to preserve layout balance and demonstrate repeated content styling.",
    primaryLabel: "Primary link",
    primaryHref: "#",
    secondaryLabel: "Tag: Group C"
  },
  {
    title: "Placeholder Item Four",
    category: "Group A",
    status: "Preview only",
    description: "Generic copy here keeps the interface populated without documenting the exact work completed.",
    primaryLabel: "Primary link",
    primaryHref: "#",
    secondaryLabel: "Tag: Group A"
  },
  {
    title: "Placeholder Item Five",
    category: "Group B",
    status: "Preview only",
    description: "Another sample card keeps the search and filter behavior visible while the content stays generic.",
    primaryLabel: "Primary link",
    primaryHref: "#",
    secondaryLabel: "Tag: Group B"
  },
  {
    title: "Placeholder Item Six",
    category: "Group C",
    status: "Preview only",
    description: "This final placeholder entry rounds out the grid and avoids exposing any specific implementation notes.",
    primaryLabel: "Primary link",
    primaryHref: "#",
    secondaryLabel: "Tag: Group C"
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
        No placeholder items match that search. Try a different word or filter.
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
