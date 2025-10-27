import moment from 'moment';

// Normalize movie title by removing 'the' prefix
export const removeThePrefix = (title) => {
  if (title.indexOf('the ') === 0) {
    return title.slice(4);
  }
  return title;
};

// Find matching movie title index with fuzzy matching
export const findMatchingTitleIndex = (searchTerm, relevantTitles) => {
  let movieTitle = searchTerm.toLowerCase();
  movieTitle = removeThePrefix(movieTitle);

  let lowercaseTitles = relevantTitles.map(movie => movie.title.toLowerCase());
  lowercaseTitles = lowercaseTitles.map(title => removeThePrefix(title));

  // Try exact match
  let titleIndex = lowercaseTitles.indexOf(movieTitle);

  // Try with & instead of and
  if (titleIndex === -1) {
    let movieTitleAnd = movieTitle;
    if (movieTitle.indexOf('and') > -1) {
      movieTitleAnd = movieTitle.replace('and', '&');
    }
    titleIndex = lowercaseTitles.indexOf(movieTitleAnd);
  }

  // Try fuzzy matching - titles that start with search term
  if (titleIndex === -1) {
    titleIndex = lowercaseTitles.findIndex(title => title.startsWith(movieTitle));
  }

  // Try fuzzy matching - titles that contain search term
  if (titleIndex === -1) {
    titleIndex = lowercaseTitles.findIndex(title => title.includes(movieTitle));
  }

  return { titleIndex, lowercaseTitles };
};

// Process movie search results
export const processMovieSearchResults = (data, searchTerm) => {
  console.log(`Movie data when searching for ${searchTerm} `, data.data.results);

  let relevantTitles = data.data.results.filter(movie => movie.vote_count > 500).slice(0, 5);
  console.log('Relevant titles ', relevantTitles);

  // Sort by release date, most recent first
  const sortedMovies = relevantTitles.sort((a, b) => {
    return moment(b.release_date).diff(moment(a.release_date));
  });
  console.log('Sorted titles ', sortedMovies);

  const { titleIndex, lowercaseTitles } = findMatchingTitleIndex(searchTerm, relevantTitles);
  console.log('Title index after all matching attempts ', titleIndex);

  let movieTitle;
  if (titleIndex > -1 && titleIndex <= 4) {
    // Validate match quality - but only if both title and search term are reasonable lengths
    if (searchTerm.length > 0 && searchTerm.length / relevantTitles[titleIndex].title.length < 1/4) {
      // This check is too strict for partial matches, so we'll skip it
      // alert(`Could not find a movie named ${searchTerm}!`);
      // return null;
    }
    movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
  } else {
    // Fall back to first result
    movieTitle = `${relevantTitles[0].title} (${relevantTitles[0].release_date.slice(0, 4)})`;
  }

  return {
    movieTitle,
    posterPath: relevantTitles[Math.max(0, Math.min(titleIndex, 4))].poster_path
  };
};

// Process movie search results and return all matching movies for selection
export const processMovieSearchResultsForSelection = (data, searchTerm) => {
  console.log(`Movie data when searching for ${searchTerm} `, data.data.results);

  let relevantTitles = data.data.results.filter(movie => movie.vote_count > 500).slice(0, 10);
  console.log('Relevant titles ', relevantTitles);

  // Check if there are any results
  if (relevantTitles.length === 0) {
    return {
      hasMultipleMatches: false,
      movieTitle: null,
      posterPath: null
    };
  }

  // Check if there are multiple matches with the same title (different years)
  const searchTermLower = searchTerm.toLowerCase().replace(/^the\s+/, '');
  const matchingMovies = relevantTitles.filter(movie => {
    const titleLower = movie.title.toLowerCase().replace(/^the\s+/, '');
    return titleLower.includes(searchTermLower) || searchTermLower.includes(titleLower);
  });

  // If multiple matches, return them all for user selection
  if (matchingMovies.length > 1) {
    return {
      hasMultipleMatches: true,
      movies: matchingMovies.map(movie => ({
        title: movie.title,
        year: movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown',
        fullTitle: `${movie.title} (${movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown'})`,
        posterPath: movie.poster_path,
        id: movie.id
      }))
    };
  }

  // Single match - return as normal
  const movie = relevantTitles[0];
  return {
    hasMultipleMatches: false,
    movieTitle: `${movie.title} (${movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown'})`,
    posterPath: movie.poster_path
  };
};

// Validate if movie is unique (not already used in the round)
export const isUniqueMovie = (movieTitle, existingMovies) => {
  return !existingMovies.includes(movieTitle);
};

// Validate that the guessed movie matches the actor's filmography
export const validateMovieInFilmography = (movieSearchResult, filmographyMovie) => {
  if (!filmographyMovie || !movieSearchResult) {
    return false;
  }

  // Extract year from movie title (format: "Movie Title (Year)")
  const searchYear = movieSearchResult.movieTitle.match(/\((\d{4})\)/);
  const filmographyYear = filmographyMovie.release_date ? filmographyMovie.release_date.slice(0, 4) : null;

  // Check if titles match (case insensitive, ignoring year)
  const searchTitleWithoutYear = movieSearchResult.movieTitle.replace(/\s*\(\d{4}\)\s*$/, '').toLowerCase();
  const filmographyTitleWithoutYear = filmographyMovie.title.toLowerCase();

  const titlesMatch = searchTitleWithoutYear === filmographyTitleWithoutYear;

  // Check if years match (if both exist)
  const yearsMatch = !searchYear || !filmographyYear || searchYear[1] === filmographyYear;

  return titlesMatch && yearsMatch;
};
