const likedMovies = [];
const dislikedMovies = [];

const overview = document.querySelector(".overview")

const swipeMovies = []

const movieContainer = document.querySelector(".movies");
const movies = [];
const overviewLiked = document.querySelector(".overview-liked")
const overviewDisliked = document.querySelector(".overview-disliked")

let currentMovieIndex = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;
let diffX = 0;

let preferences = {
  genres: {},
  moods: {}
};


// =========================
// FETCH DAT
// =========================

async function fetchMovies() {
  // asynchronní JS, await zajistí že se splní nejdřív synchronni JS, a fetch se děje na pozadí a proběhne až potom
  try {
    const response = await fetch("./movies.json");
    const data = await response.json();

  // data pushneme do pole movies
   movies.push(...data);

   // po fetchi promícháme filmy do pole swipeMovies
   const shuffledMovies = [...movies];
   shuffledMovies.sort(() => 0.5 - Math.random());
   const selectedMovies = shuffledMovies.slice(0, 15);
   swipeMovies.push(...selectedMovies)
  // až po fetchi renderujeme filmy
    renderMovies();

  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}


// =========================
// UPDATE PREFERENCÍ
// =========================
const updatePreferences = (movie, value) => {

  
  movie.genres.forEach(genre => {

    // zkontrolujeme zda v preferencích už tento žánr je, když ne dáme ho tam a nastavíme mu hodnotu 0
    if (preferences.genres[genre] === undefined) {
      preferences.genres[genre] = 0;
    }

    // když už to je v preferncích přičteme value dislikedmovies = -1 likedmovies = +1
    preferences.genres[genre] += value;
  });

    
  movie.moods.forEach(mood => {

    // zkontrolujeme zda v preferencích už tento mood je, když ne dáme ho tam a nastavíme mu hodnotu 0
    if (preferences.moods[mood] === undefined) {
      preferences.moods[mood] = 0;
    }

    // když už to je v preferncích přičteme value dislikedmovies = -1 likedmovies = +1
    preferences.moods[mood] += value;
  });
};


const calculateScore = (movie) => {
  // nastavíme filmu score na 0
  let score = 0;

  
  movie.genres.forEach(genre => {

  // přičteme hodnotu v preferencíh do score filmu, když by v preferencích žánr nebyl nastavíme skore na nulu => (je to pouze fallback, zatím není potřeba)
    score += preferences.genres[genre] || 0;
  });
  
  
  movie.moods.forEach(mood => {

    // přičteme hodnotu v preferencíh do score filmu, když by v preferencích mood nebyl nastavíme skore na nulu => (je to pouze fallback, zatím není potřeba)
    score += preferences.moods[mood] || 0;
  });
  // vrátíme proměnnou score, abychom mohli předat hodnotu proměnné score funkce do jiné funkce(getRecommendation), jinak by proměnná score a její hodnota existovaly jen ve funkci calculate
  return score;
};

const getRecommendation = () => {
  
  // nejdříve odstraníme filmy, které byly už označeny dislikem
  const filteredMovies = movies.filter(movie => {
    return !dislikedMovies.some(dislikedMovie => {

      
      return dislikedMovie.id === movie.id;
    });
  });
  // vytvoříme nový objekt z filtrovaných filmů, dáme jim ten samý obsah + score z funkce calculateScore 
  const scoredMovies = filteredMovies.map(movie => {
    return {
      ...movie,
      score: calculateScore(movie)
    };
  });
  // seřadíme pole filmů vzestupně (podle největšího score)
  scoredMovies.sort((a, b) => b.score - a.score);
  // vybereme první film v poli
  return scoredMovies[0];
};


const renderSwipeHistory = () => {

  if (likedMovies.length === 0) {
    overviewLiked.innerHTML = `
      <p class="text-zinc-500 text-sm">
        Žádné oblíbené filmy
      </p>
    `;
  } else {
    overviewLiked.innerHTML = likedMovies.map(likemovie => {
      return `
        <div class="rounded-2xl p-4">

          <div class="flex items-start justify-between gap-4">

            <div>
              <h3 class="text-lg font-bold text-white">
                ${likemovie.title}
              </h3>

              <p class="text-sm text-zinc-500 mt-1">
                ${likemovie.year} · Rating ${likemovie.rating}
              </p>
            </div>

            ${
              likemovie.rating >= 8.5
                ? `
                  <span class="shrink-0 text-xs font-bold px-2.5 py-1
                               rounded-full bg-[#E50914] text-white">
                     TOP
                  </span>
                `
                : ""
            }

          </div>
        </div>
      `;
    }).join("");
  }


  if (dislikedMovies.length === 0) {
    overviewDisliked.innerHTML = `
      <p class="text-zinc-500 text-sm">
        Žádné odmítnuté filmy
      </p>
    `;
  } else {
    overviewDisliked.innerHTML = dislikedMovies.map(dismovie => {
      return `
        <div class="rounded-2xl p-4">
                   

          <div class="flex items-start justify-between gap-4">

            <div>
              <h3 class="text-lg font-bold text-white">
                ${dismovie.title}
              </h3>

              <p class="text-sm text-zinc-500 mt-1">
                ${dismovie.year} · Rating ${dismovie.rating}
              </p>
            </div>

            ${
              dismovie.rating >= 8.5
                ? `
                  <span class="shrink-0 text-xs font-bold px-2.5 py-1
                               rounded-full bg-[#E50914] text-white">
                     TOP
                  </span>
                `
                : ""
            }

          </div>
        </div>
      `;
    }).join("");
  }

};


// =========================
// RENDER FILMU
// =========================

const renderMovies = () => {

  // konec seznamu
  if (currentMovieIndex >= 8) {
    const recommendedMovie = getRecommendation();
    overview.classList.add("overview-on");

    if (!recommendedMovie) {
    movieContainer.innerHTML = `
      <div class="text-center text-zinc-400">
        <p>Nenašli jsme vhodný film.</p>
      </div>
    `;
    return;
  }

   
   renderSwipeHistory();

   // vykreslení doporučeného filmu

    movieContainer.innerHTML = `
      <div class="text-center">
        
        <p class="text-sm uppercase tracking-[0.3em] text-zinc-500 mb-3">
          Dnešní doporučení
        </p>

        <div class="rounded-2xl overflow-hidden">
          <img
            src="${recommendedMovie.image}"
            alt="${recommendedMovie.title}"
            class="w-full"
          >
        </div>

        <h2 class="mt-4 text-3xl font-bold">
          ${recommendedMovie.title}
        </h2>

        <p class="text-zinc-400 mt-1">
          ${recommendedMovie.year}
        </p>

        <p class="text-zinc-500 mt-3">
          Score: ${recommendedMovie.score}
        </p>

      </div>
    `;

    return;
  }
  // vykreslení aktuálního filmu

  const movie = swipeMovies[currentMovieIndex];

  movieContainer.innerHTML = `
    <div class="movie-card relative cursor-grab select-none touch-none">

      <div class="image-wrapper relative overflow-hidden rounded-2xl">

        <img
          src="${movie.image}"
          alt="${movie.title}"
          draggable="false"
          class="pointer-events-none select-none w-full block"
        >

        <div
          class="like-overlay pointer-events-none absolute inset-0
          bg-green-500/70 opacity-0
          flex items-center justify-center"
        >
          <span class="text-white text-5xl font-black tracking-wider">
            LIKE
          </span>
        </div>

        <div
          class="nope-overlay pointer-events-none absolute inset-0
          bg-red-500/70 opacity-0
          flex items-center justify-center"
        >
          <span class="text-white text-5xl font-black tracking-wider">
            NOPE
          </span>
        </div>

      </div>

      <h2 class="mt-4 text-2xl font-bold">
        ${movie.title}
      </h2>

      <p class="text-zinc-400">
        ${movie.year}
      </p>

    </div>
  `;


  const movieCard = movieContainer.querySelector(".movie-card");
  const likeIndicator = movieCard.querySelector(".like-overlay");
  const nopeIndicator = movieCard.querySelector(".nope-overlay");


  // =========================
  // POINTER DOWN kliknutí a zahájení tažení
  // =========================

  movieCard.addEventListener("pointerdown", (event) => {
    isDragging = true;

    startX = event.clientX;
    currentX = event.clientX;
    diffX = 0;

    movieCard.setPointerCapture(event.pointerId);

    movieCard.style.transition = "none";
    movieCard.style.cursor = "grabbing";
  });


  // =========================
  // POINTER MOVE tažení
  // =========================

  movieCard.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    currentX = event.clientX;
    diffX = currentX - startX;

    const rotate = diffX / 20;

    movieCard.style.transform =
      `translateX(${diffX}px) rotate(${rotate}deg)`;


    const opacity = Math.min(
      Math.abs(diffX) / 120,
      1
    );


    if (diffX > 0) {

      likeIndicator.style.opacity = opacity;
      nopeIndicator.style.opacity = 0;

    } else if (diffX < 0) {

      nopeIndicator.style.opacity = opacity;
      likeIndicator.style.opacity = 0;

    } else {

      likeIndicator.style.opacity = 0;
      nopeIndicator.style.opacity = 0;

    }
  });


  // =========================
  // POINTER UP puštění tažení
  // =========================

  movieCard.addEventListener("pointerup", () => {
    if (!isDragging) return;

    isDragging = false;

    movieCard.style.transition =
      "transform 300ms ease";

    movieCard.style.cursor = "grab";


    // LIKE
    if (diffX > 120) {

      likedMovies.push(
        swipeMovies[currentMovieIndex]
      );

      updatePreferences(
        swipeMovies[currentMovieIndex],
        1
      );

      movieCard.style.transform =
        "translateX(120vw) rotate(20deg)";


      setTimeout(() => {

        currentMovieIndex++;
        diffX = 0;

        renderMovies();

      }, 300);


    // DISLIKE
    } else if (diffX < -120) {

      dislikedMovies.push(
        swipeMovies[currentMovieIndex]
      );

      updatePreferences(
        swipeMovies[currentMovieIndex],
        -1
      );

      movieCard.style.transform =
        "translateX(-120vw) rotate(-20deg)";


      setTimeout(() => {

        currentMovieIndex++;
        diffX = 0;

        renderMovies();

      }, 300);


    // NEDOSTATEČNÝ SWIPE
    } else {

      movieCard.style.transform =
        "translateX(0) rotate(0deg)";

      likeIndicator.style.opacity = 0;
      nopeIndicator.style.opacity = 0;

      diffX = 0;
    }
  });


  // =========================
  // POINTER CANCEL zrušení tažení
  // =========================

  movieCard.addEventListener("pointercancel", () => {
    isDragging = false;

    movieCard.style.transition =
      "transform 300ms ease";

    movieCard.style.transform =
      "translateX(0) rotate(0deg)";

    movieCard.style.cursor = "grab";

    likeIndicator.style.opacity = 0;
    nopeIndicator.style.opacity = 0;

    diffX = 0;
  });
};


// =========================
// START APP
// =========================

fetchMovies();