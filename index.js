// This deals with the hamburger toggle effect
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        mobileNav.classList.toggle('hidden');
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    });
}

//The anime API url
const url = 'https://graphql.anilist.co';

// Current focus: handle anime search requests and render the results UI in the page.
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('searchButton');
const searchResultsSection = document.getElementById('search-results-section');
const searchResultsContainer = document.getElementById('search-results');
const searchResultsSummary = document.getElementById('search-results-summary');
const clearSearchButton = document.getElementById('clear-search');

function getAnimeCardMarkup(anime) {
    const title = anime.title?.english || anime.title?.romaji || 'Untitled Anime';
    const image = anime.coverImage?.large || 'logo/anime-away-face-svgrepo-com.svg';
    let airingHtml = '<p class="mt-2 text-center font-[Montserrat] text-sm text-slate-300">Status: Finished Airing</p>';

    if (anime.nextAiringEpisode) {
        const days = Math.floor(anime.nextAiringEpisode.timeUntilAiring / (3600 * 24));
        airingHtml = `
            <div class="mt-2 text-center font-[Montserrat] text-sm text-slate-300">
                Next Up: Episode ${anime.nextAiringEpisode.episode} drops in ${days} days!
            </div>`;
    }

    return `
        <article class="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/25">
            <img class="h-56 w-full object-cover" src="${image}" alt="${title}">
            <div class="p-3">
                <h3 class="text-center text-sm font-semibold uppercase text-slate-100">${title}</h3>
                ${airingHtml}
            </div>
        </article>
    `;
}

function showSearchResults(animeList, query) {
    if (!searchResultsSection || !searchResultsContainer || !searchResultsSummary) {
        return;
    }

    searchResultsSection.classList.remove('hidden');
    clearSearchButton?.classList.remove('hidden');

    if (!animeList.length) {
        searchResultsSummary.textContent = `No anime matched “${query}”.`;
        searchResultsContainer.innerHTML = `
            <div class="col-span-full rounded-xl border border-dashed border-white/15 bg-slate-900/70 p-8 text-center text-slate-300">
                Try a different title, keyword, or season name.
            </div>`;
        return;
    }

    searchResultsSummary.textContent = `${animeList.length} result${animeList.length > 1 ? 's' : ''} for “${query}”`;
    searchResultsContainer.innerHTML = animeList.map(getAnimeCardMarkup).join('');
}

function clearSearchResults() {
    if (searchResultsSection) {
        searchResultsSection.classList.add('hidden');
    }
    if (clearSearchButton) {
        clearSearchButton.classList.add('hidden');
    }
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = '';
    }
    if (searchResultsSummary) {
        searchResultsSummary.textContent = '';
    }
    if (searchInput) {
        searchInput.value = '';
    }
}

async function searchAnime(query) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        clearSearchResults();
        return;
    }

    if (searchResultsSection) {
        searchResultsSection.classList.remove('hidden');
    }
    if (searchResultsSummary) {
        searchResultsSummary.textContent = `Searching for “${trimmedQuery}”...`;
    }
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = `
            <div class="col-span-full rounded-xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-300">
                Loading results...
            </div>`;
    }
    if (clearSearchButton) {
        clearSearchButton.classList.remove('hidden');
    }

    const searchQuery = `
        query($search: String!) {
            Page(page: 1, perPage: 20) {
                media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
                    title {
                        english
                        romaji
                    }
                    coverImage {
                        large
                    }
                    nextAiringEpisode {
                        episode
                        timeUntilAiring
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: searchQuery,
                variables: { search: trimmedQuery }
            })
        });

        const result = await response.json();
        const animeList = result?.data?.Page?.media || [];
        showSearchResults(animeList, trimmedQuery);
    } catch (error) {
        console.error('Search error:', error);
        if (searchResultsSummary) {
            searchResultsSummary.textContent = 'We could not load search results right now.';
        }
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = `
                <div class="col-span-full rounded-xl border border-red-500/20 bg-red-950/40 p-8 text-center text-red-200">
                    Failed to fetch search results. Please try again.
                </div>`;
        }
    }
}

if (searchButton) {
    searchButton.addEventListener('click', () => searchAnime(searchInput?.value || ''));
}

if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchAnime(searchInput.value);
        }
    });
}

if (clearSearchButton) {
    clearSearchButton.addEventListener('click', clearSearchResults);
}

// feteches data from the api url based on popularity(finished or still airing) status
const popularQuery = `
  query {
    Page(page: 1, perPage: 50) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        title {
          english
          romaji
        }
        coverImage {
          large
        }
        nextAiringEpisode {
          episode
          timeUntilAiring
        }
      }
    }
  }
`;

const popularOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({ query: popularQuery })
};

fetch(url, popularOptions)
    .then(response => response.json())
    .then(result => {
        const animeList = result.data.Page.media;
        const container = document.getElementById('anime-container');

        container.innerHTML = animeList.map(anime => {
            const title = anime.title.english || anime.title.romaji;
            let airingHtml = '<p class="text-center font-[Montserrat] text-sm mt-2">Status: Finished Airing</p>';
            if (anime.nextAiringEpisode) {
                const days = Math.floor(anime.nextAiringEpisode.timeUntilAiring / (3600 * 24));
                airingHtml = `
                    <div class="text-center font-[Montserrat] text-sm mt-2">
                        Next Up: Episode ${anime.nextAiringEpisode.episode} drops in ${days} days!
                    </div>`;
            }

            return `
                <div class=" rounded-md bg-zinc-900 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/25 mx-3">
                    <img  class="rounded-t-md" src="${anime.coverImage.large}" alt="${title}">
                    <h2 class="text-center uppercase">${title}</h2>
                    ${airingHtml}
                </div>
            `;
        }).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('anime-container').innerText = 'Failed to load anime data.';
    });

// fetches the trending anime data from the api url
const trendingQuery = `
  query {
    Page(page: 1, perPage: 50) {
      media(type: ANIME, sort: TRENDING_DESC) {
        title {
          english
          romaji
        }
        coverImage {
          large
        }
        nextAiringEpisode {
          episode
          timeUntilAiring
        }
      }
    }
  }
`;

const trendingOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({ query: trendingQuery })
};

fetch(url, trendingOptions)
    .then(response => response.json())
    .then(result => {
        const animeList = result.data.Page.media;
        const trendingContainer = document.getElementById('trending-container');

        trendingContainer.innerHTML = animeList.map(anime => {
            const title = anime.title.english || anime.title.romaji;
            let airingHtml = '<p class="text-center font-[Montserrat] text-sm mt-2">Status: Finished Airing</p>';
            if (anime.nextAiringEpisode) {
                const days = Math.floor(anime.nextAiringEpisode.timeUntilAiring / (3600 * 24));
                airingHtml = `
                    <div class="text-center font-[Montserrat] text-sm mt-2">
                        Next Up: Episode ${anime.nextAiringEpisode.episode} drops in ${days} days!
                    </div>`;
            }

            return `
                <div class=" rounded-md bg-zinc-900 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/25 mx-3">
                    <img class="rounded-t-md" src="${anime.coverImage.large}" alt="${title}">
                    <h2 class="text-center uppercase">${title}</h2>
                    ${airingHtml}
                  </div>
            `;
        }).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('trending-container').innerText = 'Failed to load trending anime data.';
    });

