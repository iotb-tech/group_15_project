// This deals with the hamburger toogle effect
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');
const iconOpen = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');

toggle.addEventListener('click', () => {
  const isOpen = !menu.classList.contains('hidden');
  menu.classList.toggle('hidden', isOpen);
  menu.classList.toggle('flex', !isOpen);
  iconOpen.classList.toggle('hidden', !isOpen);
  iconClose.classList.toggle('hidden', isOpen);
  toggle.setAttribute('aria-expanded', String(!isOpen));
});

//The anime API url
const url = 'https://graphql.anilist.co';

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
