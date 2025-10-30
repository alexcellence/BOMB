import aliases from './actorAliases.json';

// Local normalizer for alias keys (diacritics, punctuation, case)
const normalizeAliasKey = (str) => {
  return (str || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};
// Normalize actor name (e.g., handle 'the rock' special case)
export const normalizeActorName = (actorName) => {
  // JSON alias lookup first (data-driven)
  const key = normalizeAliasKey(actorName);
  if (aliases[key]) {
    return aliases[key];
  }
  if (actorName === 'the rock' || actorName === 'rock') {
    return 'Dwayne Johnson';
  }
  // Normalize common abbreviations
  const lowerName = actorName.toLowerCase();
  if (lowerName === 'rdj' || lowerName === 'robert downey') {
    return 'Robert Downey Jr.';
  }
  if (lowerName === 'scarjo' || lowerName === 'scar jo') {
    return 'Scarlett Johansson';
  }
  if (lowerName === 'arnie') {
    return 'Arnold Schwarzenegger';
  }
  if (lowerName === 'jtt' || lowerName === 'jon taylor thomas' || lowerName === 'jon t. thomas') {
    return 'Jonathan Taylor Thomas';
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
  // IMPORTANT: Track which indices we're removing so we don't mess up the matching
  const filteredIndices = [];
  for (var i = 0; i < existingMovies.length; i++) {
    for (var j = 0; j < movieTitles.length; j++) {
      var currentMovie = existingMovies[i];
      console.log('currentMovie without year ', currentMovie.slice(0, currentMovie.length - 7));
      if (currentMovie.slice(0, currentMovie.length - 7) === movieTitles[j]) {
        // Mark this index for filtering
        filteredIndices.push(j);
      }
    }
  }
  console.log('movieTitles without previous results ', movieTitles);

  // Create processed titles for matching
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
  // Map movieIndex back to the original sortedMovieResults index
  let selectedMovie = null;
  if (movieTitles.length > 0 && movieIndex >= 0) {
    const selectedMovieTitle = movieTitles[movieIndex];
    selectedMovie = filmographyResults.find(movie => movie.title === selectedMovieTitle);
  }

  return { movieIndex, movieTitles, movieResults, selectedMovie };
};

// --- Robust actor matching helpers ---

// Remove diacritics and normalize whitespace/punctuation
export const normalizeForMatch = (str) => {
  return (str || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-zA-Z\s\-']/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

export const tokenizeName = (name) => {
  return normalizeForMatch(name)
    .split(' ')
    .filter(Boolean);
};

// Simple Soundex implementation suitable for last-name phonetic comparison
export const soundex = (value) => {
  const s = normalizeForMatch(value).replace(/[^a-z]/g, '');
  if (!s) return '';
  const map = {b:1,f:1,p:1,v:1,c:2,g:2,j:2,k:2,q:2,s:2,x:2,z:2,d:3,t:3,l:4,m:5,n:5,r:6};
  let out = s[0];
  let prev = map[s[0]] || 0;
  for (let i = 1; i < s.length && out.length < 4; i++) {
    const code = map[s[i]] || 0;
    if (code !== 0 && code !== prev) out += code;
    prev = code;
  }
  return (out + '000').slice(0, 4);
};

// Levenshtein distance
export const levenshtein = (a, b) => {
  a = normalizeForMatch(a);
  b = normalizeForMatch(b);
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + cost
      );
      prev = temp;
    }
  }
  return dp[n];
};

// Decide if guessed name reasonably matches a candidate from cast
export const isAcceptableActorMatch = (guess, candidate) => {
  const guessTokens = tokenizeName(guess);
  const candTokens = tokenizeName(candidate);
  if (candTokens.length === 0 || guessTokens.length === 0) return false;

  // Prefer exact full-name match
  if (guessTokens.join(' ') === candTokens.join(' ')) return true;

  // Single-token guesses must match exactly a token in candidate
  if (guessTokens.length === 1) {
    const g = guessTokens[0];
    if (g.length <= 2) return false; // too short
    if (candTokens.includes(g)) return true;
    // allow small edit distance or phonetic match on any token
    return candTokens.some(t => {
      const len = Math.max(t.length, g.length);
      const maxDist = len <= 6 ? 1 : 2;
      return levenshtein(g, t) <= maxDist || soundex(g) === soundex(t);
    });
  }

  // Multi-token: require first token prefix AND last token fuzzy/phonetic
  const gFirst = guessTokens[0];
  const gLast = guessTokens[guessTokens.length - 1];
  const cFirst = candTokens[0];
  const cLast = candTokens[candTokens.length - 1];

  // First name must start-with for at least 3 chars or be exact
  const firstOk = gFirst === cFirst || (gFirst.length >= 3 && cFirst.startsWith(gFirst));

  // Last name: edit distance bounded by length, or soundex equal
  const len = Math.max(gLast.length, cLast.length);
  const maxDist = len <= 8 ? 2 : 3;
  const lastOk = gLast === cLast || levenshtein(gLast, cLast) <= maxDist || soundex(gLast) === soundex(cLast);

  return firstOk && lastOk;
};
