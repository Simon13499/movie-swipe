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

let currentMovieIndex = 0;
let indexRecommendation = 0;

const nextButton = document.querySelector("#next-recommendation");

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
// Přes tlačítko další doporučení
// =========================

nextButton.addEventListener("click", () => {

  const scoredMovies = getRecommendation();


  if (indexRecommendation < scoredMovies.length - 1) {
        indexRecommendation++;
        renderMovies();
  }

});

// =========================
//  ZOBRAZENÍ HISTORIE SWIPŮ
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

    document.querySelector("#recommendation-actions").classList.add("hidden");
    overview.classList.remove("overview-on");

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
      <p class="text-zinc-500 text-sm">
        Žádné oblíbené filmy
      </p>
    `;
  } else {
    overviewLiked.innerHTML = likedMovies.map(movie => {
      return `
        <div class="rounded-2xl p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-white">
                ${movie.title}
              </h3>
              <p class="text-sm text-zinc-500 mt-1">
                ${movie.year} · Rating ${movie.rating}
              </p>
            </div>

            ${movie.rating >= 8.5
              ? `<span class="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-[#E50914] text-white">TOP</span>`
              : ""}
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
    overviewDisliked.innerHTML = dislikedMovies.map(movie => {
      return `
        <div class="rounded-2xl p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-white">
                ${movie.title}
              </h3>
              <p class="text-sm text-zinc-500 mt-1">
                ${movie.year} · Rating ${movie.rating}
              </p>
            </div>

            ${movie.rating >= 8.5
              ? `<span class="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-[#E50914] text-white">TOP</span>`
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

  // Po 8 swipech zobrazím doporučení
  if (currentMovieIndex >= 8 || currentMovieIndex >= swipeMovies.length) {
    const scoredMovies = getRecommendation();
    const recommendedMovie = scoredMovies[indexRecommendation];

    document.querySelector("#recommendation-actions").classList.remove("hidden");

    overview.classList.add("overview-on");
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
      <div class="text-center">

        <p class="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">
          Dnešní doporučení
        </p>

        <div class="rounded-2xl overflow-hidden">
          <img
            src="${recommendedMovie.image}"
            alt="${recommendedMovie.title}"
            class="pointer-events-none select-none block w-full h-[min(45dvh,420px)] object-contain"
          >
        </div>

        <h2 class="mt-3 text-xl md:text-2xl font-bold leading-tight">
          ${recommendedMovie.title}
        </h2>

        <p class="text-zinc-400 mt-1 text-sm">
          ${recommendedMovie.year}
        </p>

        <p class="text-zinc-500 mt-2 text-sm">
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
    <div class="movie-card relative cursor-grab select-none touch-pan-y">

      <div class="image-wrapper relative overflow-hidden rounded-2xl">

        <img
          src="${movie.image}"
          alt="${movie.title}"
          draggable="false"
          class="pointer-events-none select-none block w-full h-[min(48dvh,440px)] object-contain"
        >

        <div class="like-overlay pointer-events-none absolute inset-0 bg-green-500/70 opacity-0 flex items-center justify-center">
          <span class="text-white text-5xl font-black tracking-wider">
            LIKE
          </span>
        </div>

        <div class="nope-overlay pointer-events-none absolute inset-0 bg-red-500/70 opacity-0 flex items-center justify-center">
          <span class="text-white text-5xl font-black tracking-wider">
            NOPE
          </span>
        </div>

      </div>

      <h2 class="mt-3 text-xl md:text-2xl font-bold leading-tight">
        ${movie.title}
      </h2>

      <p class="text-zinc-400 mt-1 text-sm">
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
    if (isAnimating || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    isDragging = true;
    horizontalSwipe = false;

    startX = event.clientX;
    startY = event.clientY;
    diffX = 0;
    activePointerId = event.pointerId;

    movieCard.style.transition = "none";

    // Pointer capture nastavujeme jen u myši.
    // Na mobilu necháme prohlížeč ovládat vertikální scroll.
    if (event.pointerType === "mouse") {
      movieCard.setPointerCapture(event.pointerId);
    }
  });

  // =========================
  // POINTER MOVE
  // =========================

  movieCard.addEventListener("pointermove", event => {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const moveX = event.clientX - startX;
    const moveY = event.clientY - startY;

    if (!horizontalSwipe) {
      if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) {
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
    if (!isDragging || event.pointerId !== activePointerId || isAnimating) {
      return;
    }

    isDragging = false;
    activePointerId = null;

    if (!horizontalSwipe || Math.abs(diffX) <= 70) {
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
