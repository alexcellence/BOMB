// Normalize actor name (e.g., handle 'the rock' special case)
export const normalizeActorName = (actorName) => {
  if (actorName === 'the rock' || actorName === 'rock') {
    return 'Dwayne Johnson';
  }
  return actorName;
};

// Process filmography search results
export const processFilmographyResults = (data) => {
  let relevantFilmography = data.data.filter(movie => movie.vote_count > 500);
  console.log('Relevant filmography ', relevantFilmography);

  let filmographyByDate = relevantFilmography.sort((a, b) => {
    return new Date(b.release_date) - new Date(a.release_date);
  });
  console.log('filmographyByDate ', filmographyByDate);

  // Return full movie objects, not just titles
  return filmographyByDate;
};

// Find matching movie in actor's filmography
export const findMatchingMovieInFilmography = (searchTerm, filmographyResults, existingMovies) => {
  // Extract titles for Fuse search
  const filmographyTitles = filmographyResults.map(movie => movie.title);

  const MovieOptions = {
    includeScore: true,
    threshold: 0.3,
    includeMatches: true
  };

  const filmographyFuse = new Fuse(filmographyTitles, MovieOptions);
  let movieGuess = searchTerm.toLowerCase();

  // Remove 'the' prefix
  if (movieGuess.indexOf('the ') === 0) {
    movieGuess = movieGuess.replace('the ', '');
  }

  console.log('Original movie search term ', movieGuess);

  let movieResults = filmographyFuse.search(movieGuess);
  console.log('movieFuse results ', movieResults);

  // Sort by score (lower is better), then by refIndex (to prefer later additions which are usually more recent)
  let sortedMovieResults = movieResults.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score; // Lower score = better match
    }
    return b.refIndex - a.refIndex; // If scores are equal, prefer later ones
  });
  console.log('Movies sorted by score then refIndex ', sortedMovieResults);

  let movieTitles = sortedMovieResults.map(movie => movie.item);
  console.log('movieFuse results with only titles ', movieTitles);

  // Filter out movies that were already used
  for (var i = 0; i < existingMovies.length; i++) {
    for (var j = 0; j < movieTitles.length; j++) {
      var currentMovie = existingMovies[i];
      console.log('currentMovie without year ', currentMovie.slice(0, currentMovie.length - 7));
      if (currentMovie.slice(0, currentMovie.length - 7) === movieTitles[j]) {
        movieTitles.splice(j, 1);
      }
    }
  }
  console.log('movieTitles without previous results ', movieTitles);

  let movieResultsTitles = movieTitles.map(movie => movie.toLowerCase());
  console.log('Lowercase movie titles ', movieResultsTitles);

  // Remove 'the' from titles
  movieResultsTitles = movieResultsTitles.map(function (movie) {
    if (movie.indexOf('the ') === 0) {
      movie = movie.slice(4);
    }
    return movie;
  });

  console.log('movieGuess ', movieGuess);

  // Prioritize exact title matches before score-based selection
  // This ensures "Star Trek" matches "Star Trek" not "Star Trek Into Darkness"
  let movieIndex = -1;

  // First, look for exact matches (case insensitive)
  for (let i = 0; i < movieResultsTitles.length; i++) {
    if (movieResultsTitles[i] === movieGuess) {
      movieIndex = i;
      console.log('Exact match found at index', movieIndex);
      break;
    }
  }

  // Try with & instead of and if no exact match
  if (movieIndex === -1 && movieGuess.indexOf('and') > -1) {
    const movieTitleAnd = movieGuess.replace('and', '&');
    for (let i = 0; i < movieResultsTitles.length; i++) {
      if (movieResultsTitles[i] === movieTitleAnd) {
        movieIndex = i;
        console.log('Exact match with ampersand found at index', movieIndex);
        break;
      }
    }
  }

  // Check for perfect score (score === 0) which indicates exact match
  if (movieIndex === -1) {
    for (var i = 0; i < sortedMovieResults.length; i++) {
      if (sortedMovieResults[i].score === 0) {
        movieIndex = i;
        console.log('Perfect score match found at index', i);
        break;
      }
    }
  }

  // If still no match, use the best score from Fuse (already sorted)
  if (movieIndex === -1) {
    movieIndex = 0;
    console.log('No exact match found, using best fuzzy match (index 0)');
  }

  // Find the full movie object for the selected movie
  let selectedMovie = null;
  if (movieTitles.length > 0) {
    const selectedMovieTitle = movieTitles[movieIndex];
    selectedMovie = filmographyResults.find(movie => movie.title === selectedMovieTitle);
  }

  return { movieIndex, movieTitles, movieResults, selectedMovie };
};
