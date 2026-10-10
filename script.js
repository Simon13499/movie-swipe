
// =========================
// DATA A ELEMENTY
// =========================

const likedMovies = [];
const dislikedMovies = [];
const swipeMovies = [];
const movies = [];

const overviewButton = document.querySelector("#show-overview");
const restartButton = document.querySelector("#restart-swipe");
const overview = document.querySelector(".overview");
const movieContainer = document.querySelector(".movies");
const overviewLiked = document.querySelector(".overview-liked");
const overviewDisliked = document.querySelector(".overview-disliked");
const nextButton = document.querySelector("#next-recommendation");
const recommendationActions = document.querySelector("#recommendation-actions");

let currentMovieIndex = 0;
let indexRecommendation = 0;

let preferences = {
  genres: {},
  moods: {}
};

// =========================
// FETCH DAT
// =========================

async function fetchMovies() {
  try {
    const response = await fetch("./movies.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    movies.push(...data);

    const shuffledMovies = [...movies];
    shuffledMovies.sort(() => 0.5 - Math.random());

    const selectedMovies = shuffledMovies.slice(0, 15);
    swipeMovies.push(...selectedMovies);

    renderMovies();

  } catch (error) {
    console.error("Error fetching movies:", error);
    movieContainer.textContent = "Filmy se nepodařilo načíst.";
  }
}

// =========================
// UPDATE PREFERENCÍ
// =========================

const updatePreferences = (movie, value) => {
  movie.genres.forEach(genre => {
    if (preferences.genres[genre] === undefined) {
      preferences.genres[genre] = 0;
    }

    preferences.genres[genre] += value;
  });

  movie.moods.forEach(mood => {
    if (preferences.moods[mood] === undefined) {
      preferences.moods[mood] = 0;
    }

    preferences.moods[mood] += value;
  });
};

// =========================
// VÝPOČET SKÓRE
// =========================

const calculateScore = movie => {
  let score = 0;

  movie.genres.forEach(genre => {
    score += preferences.genres[genre] || 0;
  });

  movie.moods.forEach(mood => {
    score += preferences.moods[mood] || 0;
  });

  return score;
};

// =========================
// DOPORUČENÍ FILMU
// =========================

const getRecommendation = () => {
  const filteredMovies = movies.filter(movie => {
    return !swipeMovies.slice(0, currentMovieIndex).some(swipedMovie => {
      return swipedMovie.id === movie.id;
    });
  });

  const scoredMovies = filteredMovies.map(movie => {
    return {
      ...movie,
      score: calculateScore(movie)
    };
  });

  scoredMovies.sort((a, b) => b.score - a.score);

  return scoredMovies;
};

// =========================
// DALŠÍ DOPORUČENÝ FILM
// =========================

nextButton.addEventListener("click", () => {
  const scoredMovies = getRecommendation();

  if (indexRecommendation < scoredMovies.length - 1) {
    indexRecommendation++;
    renderMovies();
  }
});

// =========================
// ZOBRAZENÍ HISTORIE SWIPŮ
// =========================

overviewButton.addEventListener("click", () => {
  overview.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// =========================
// RESET APLIKACE
// =========================

restartButton.addEventListener("click", () => {
  likedMovies.length = 0;
  dislikedMovies.length = 0;

  renderSwipeHistory();

  currentMovieIndex = 0;
  indexRecommendation = 0;

  preferences = {
    genres: {},
    moods: {}
  };

  swipeMovies.length = 0;

  const shuffledMovies = [...movies];
  shuffledMovies.sort(() => 0.5 - Math.random());

  swipeMovies.push(...shuffledMovies.slice(0, 15));

  recommendationActions.classList.add("hidden");
  overview.classList.add("hidden");

  renderMovies();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// =========================
// HISTORIE SWIPŮ
// =========================

const renderSwipeHistory = () => {
  if (likedMovies.length === 0) {
    overviewLiked.innerHTML = `
      <p class="text-sm text-zinc-500">
        Žádné oblíbené filmy
      </p>
    `;
  } else {
    overviewLiked.innerHTML = likedMovies.map(movie => {
      return `
        <div class="rounded-2xl border border-[#202020] bg-[#171717] p-4">
          <div class="flex items-start justify-between gap-4">

            <div class="min-w-0">
              <h3 class="break-words text-lg font-bold text-white">
                ${movie.title}
              </h3>

              <p class="mt-1 text-sm text-zinc-500">
                ${movie.year} · Rating ${movie.rating}
              </p>
            </div>

            ${movie.rating >= 8.5
              ? `<span class="shrink-0 rounded-full bg-[#E50914] px-2.5 py-1 text-xs font-bold text-white">TOP</span>`
              : ""}

          </div>
        </div>
      `;
    }).join("");
  }

  if (dislikedMovies.length === 0) {
    overviewDisliked.innerHTML = `
      <p class="text-sm text-zinc-500">
        Žádné odmítnuté filmy
      </p>
    `;
  } else {
    overviewDisliked.innerHTML = dislikedMovies.map(movie => {
      return `
        <div class="rounded-2xl border border-[#202020] bg-[#171717] p-4">
          <div class="flex items-start justify-between gap-4">

            <div class="min-w-0">
              <h3 class="break-words text-lg font-bold text-white">
                ${movie.title}
              </h3>

              <p class="mt-1 text-sm text-zinc-500">
                ${movie.year} · Rating ${movie.rating}
              </p>
            </div>

            ${movie.rating >= 8.5
              ? `<span class="shrink-0 rounded-full bg-[#E50914] px-2.5 py-1 text-xs font-bold text-white">TOP</span>`
              : ""}

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

  // =========================
  // DOPORUČENÍ PO 8 SWIPECH
  // =========================

  if (
    currentMovieIndex >= 8 ||
    currentMovieIndex >= swipeMovies.length
  ) {
    const scoredMovies = getRecommendation();
    const recommendedMovie = scoredMovies[indexRecommendation];

    recommendationActions.classList.remove("hidden");

    // Přehled bude po 8 swipech viditelný.
    overview.classList.remove("hidden");

    renderSwipeHistory();

    if (!recommendedMovie) {
      movieContainer.innerHTML = `
        <div class="text-center text-zinc-400">
          <p>Nenašli jsme vhodný film.</p>
        </div>
      `;
      return;
    }

    movieContainer.innerHTML = `
      <div class="w-full text-center">

        <p class="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#E50914]">
          Dnešní doporučení
        </p>

        <div class="relative mx-auto aspect-[2/3] w-full max-w-[340px] overflow-hidden rounded-[22px] bg-[#151515] shadow-[0_20px_65px_rgba(0,0,0,0.65)] sm:max-w-[390px]">

          <img
            src="${recommendedMovie.image}"
            alt="${recommendedMovie.title}"
            draggable="false"
            class="pointer-events-none block h-full w-full select-none object-cover"
          >

        </div>

        <h2 class="mt-5 text-[24px] font-bold leading-tight tracking-tight sm:text-[28px] lg:text-[32px]">
          ${recommendedMovie.title}
        </h2>

        <p class="mt-2 text-sm text-zinc-400 sm:text-base">
          ${recommendedMovie.year}
        </p>

        <p class="mt-2 text-sm text-zinc-500">
          Score: ${recommendedMovie.score}
        </p>

      </div>
    `;

    return;
  }

  // =========================
  // AKTUÁLNÍ FILM
  // =========================

  const movie = swipeMovies[currentMovieIndex];

  movieContainer.innerHTML = `
    <div class="movie-card relative w-full cursor-grab select-none touch-pan-y text-center">

      <div class="image-wrapper relative mx-auto aspect-[2/3] w-full max-w-[340px] overflow-hidden rounded-[22px] bg-[#151515] shadow-[0_20px_65px_rgba(0,0,0,0.65)] sm:max-w-[390px]">

        <img
          src="${movie.image}"
          alt="${movie.title}"
          draggable="false"
          class="pointer-events-none block h-full w-full select-none object-cover"
        >

        <!-- LIKE OVERLAY -->
        <div class="like-overlay pointer-events-none absolute inset-0 flex items-center justify-center bg-green-500/70 opacity-0">

          <span class="text-4xl font-black tracking-wider text-white sm:text-5xl">
            LIKE
          </span>

        </div>

        <!-- DISLIKE OVERLAY -->
        <div class="nope-overlay pointer-events-none absolute inset-0 flex items-center justify-center bg-red-500/70 opacity-0">

          <span class="text-4xl font-black tracking-wider text-white sm:text-5xl">
            NOPE
          </span>

        </div>

      </div>

      <h2 class="mt-5 text-[24px] font-bold leading-tight tracking-tight sm:text-[28px] lg:text-[32px]">
        ${movie.title}
      </h2>

      <p class="mt-2 text-sm text-zinc-400 sm:text-base">
        ${movie.year}
      </p>

    </div>
  `;

  const movieCard = movieContainer.querySelector(".movie-card");
  const likeIndicator = movieCard.querySelector(".like-overlay");
  const nopeIndicator = movieCard.querySelector(".nope-overlay");

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let diffX = 0;
  let horizontalSwipe = false;
  let activePointerId = null;
  let isAnimating = false;

  // =========================
  // RESET POHYBU KARTY
  // =========================

  const resetCard = () => {
    movieCard.style.transition = "transform 250ms ease-out";
    movieCard.style.transform = "translateX(0) rotate(0deg)";
    movieCard.style.cursor = "grab";

    likeIndicator.style.opacity = 0;
    nopeIndicator.style.opacity = 0;

    diffX = 0;
  };

  // =========================
  // POINTER DOWN
  // =========================

  movieCard.addEventListener("pointerdown", event => {
    if (
      isAnimating ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    isDragging = true;
    horizontalSwipe = false;

    startX = event.clientX;
    startY = event.clientY;
    diffX = 0;
    activePointerId = event.pointerId;

    movieCard.style.transition = "none";

    // Pointer capture pouze pro myš.
    // Na mobilu zachováváme vertikální scroll.

    if (event.pointerType === "mouse") {
      movieCard.setPointerCapture(event.pointerId);
    }
  });

  // =========================
  // POINTER MOVE
  // =========================

  movieCard.addEventListener("pointermove", event => {
    if (
      !isDragging ||
      event.pointerId !== activePointerId
    ) {
      return;
    }

    const moveX = event.clientX - startX;
    const moveY = event.clientY - startY;

    if (!horizontalSwipe) {
      if (
        Math.abs(moveX) < 10 &&
        Math.abs(moveY) < 10
      ) {
        return;
      }

      // Pokud uživatel táhne převážně vertikálně,
      // necháme stránku scrollovat.

      if (Math.abs(moveY) > Math.abs(moveX)) {
        return;
      }

      horizontalSwipe = true;
    }

    diffX = moveX;

    const rotate = diffX / 20;

    movieCard.style.transform =
      `translateX(${diffX}px) rotate(${rotate}deg)`;

    const opacity = Math.min(Math.abs(diffX) / 120, 1);

    if (diffX > 0) {
      likeIndicator.style.opacity = opacity;
      nopeIndicator.style.opacity = 0;
    } else {
      nopeIndicator.style.opacity = opacity;
      likeIndicator.style.opacity = 0;
    }
  });

  // =========================
  // POINTER UP
  // =========================

  movieCard.addEventListener("pointerup", event => {
    if (
      !isDragging ||
      event.pointerId !== activePointerId ||
      isAnimating
    ) {
      return;
    }

    isDragging = false;
    activePointerId = null;

    if (
      !horizontalSwipe ||
      Math.abs(diffX) <= 70
    ) {
      resetCard();
      return;
    }

    isAnimating = true;

    const liked = diffX > 0;
    const selectedMovie = swipeMovies[currentMovieIndex];

    if (liked) {
      likedMovies.push(selectedMovie);
      updatePreferences(selectedMovie, 1);
    } else {
      dislikedMovies.push(selectedMovie);
      updatePreferences(selectedMovie, -1);
    }

    movieCard.style.transition = "transform 250ms ease-out";

    movieCard.style.transform = liked
      ? "translateX(120vw) rotate(20deg)"
      : "translateX(-120vw) rotate(-20deg)";

    setTimeout(() => {
      currentMovieIndex++;
      renderMovies();
    }, 300);
  });

  // =========================
  // POINTER CANCEL
  // =========================

  movieCard.addEventListener("pointercancel", () => {
    isDragging = false;
    horizontalSwipe = false;
    activePointerId = null;

    resetCard();
  });
};

// =========================
// START APP
// =========================

fetchMovies();
