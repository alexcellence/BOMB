import React from 'react';
import Form from './Form.jsx';
import Stream from './Stream.jsx';
import ListItem from './ListItem.jsx';
import MovieSelector from './MovieSelector.jsx';
import styles from './app.scss';

// Imports from new modular files
import { Container, Title, Streak, DefuseButton, ActorPhoto, MoviePoster } from './AppStyles.jsx';
import { searchTitle, getCast, getFilmography, getActorImage, getCastById } from '../services/apiService.js';
import { processMovieSearchResults, processMovieSearchResultsForSelection, isUniqueMovie, validateMovieInFilmography } from '../utils/movieUtils.js';
import { normalizeActorName, processFilmographyResults, findMatchingMovieInFilmography } from '../utils/actorUtils.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movieTurn: true,
      searchTerm: '',
      movies: [],
      cast: [],
      officialTitle: '',
      officialActor: '',
      filmography: [],
      stream: [],
      actorPhoto: '',
      moviePoster: '',
      turnsThisRound: 0,
      totalScores: [],
      highScore: 0,
      showMovieSelector: false,
      movieOptions: []
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getFilmography = this.getFilmography.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.clearStream = this.clearStream.bind(this);
    this.getActorImage = this.getActorImage.bind(this);
    this.handleEmptySubmit = this.handleEmptySubmit.bind(this);
    this.getCast = this.getCast.bind(this);
    this.handleMovieSelection = this.handleMovieSelection.bind(this);
  }

  handleChange(event) {
    this.setState({
      searchTerm: event.target.value
    })
  }

  handleEmptySubmit(event) {
    event.preventDefault();
    if (this.state.searchTerm === '') {
      alert(`What we've got here is failure to communicate.`);
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    let updatedMovies = [...this.state.movies];
    let updatedStream = [...this.state.stream];

    if (this.state.movieTurn) {
      let scores = [...this.state.totalScores];
      if (this.state.movies.length > 0) {
        // Game is in progress - checking if movie is in actor's filmography
        const { movieIndex, movieTitles, movieResults, selectedMovie } = findMatchingMovieInFilmography(
          this.state.searchTerm,
          this.state.filmography,
          this.state.movies
        );

        if (movieResults.length > 0) {
          // First search for the movie title to get full movie details
          searchTitle(this.state.searchTerm)
            .then((data) => {
              const result = processMovieSearchResults(data, this.state.searchTerm);

              if (!result) {
                alert(`Could not find a movie named ${this.state.searchTerm}!`);
                return;
              }

              // Use the movie from filmography, not the search result
              // This ensures we get the correct version (e.g., "Grown Ups" vs "Grown Ups 2")
              const foundMovie = movieTitles[movieIndex];
              console.log('foundmovie from filmography ', foundMovie);

              this.setState({
                officialTitle: foundMovie
              })
              this.getTitle(foundMovie);
              this.getCast(foundMovie);
            })
            .catch(() => {
              alert(`Could not find a movie named ${this.state.searchTerm}!`);
            });
        } else {
          alert(`${this.state.officialActor} is not credited in ${this.state.searchTerm}!`);
          updatedStream.unshift('BOMB!');
          scores.push(this.state.turnsThisRound);
          this.setState({
            turnsThisRound: 0,
            stream: updatedStream,
            movies: [],
            actorPhoto: '',
            moviePoster: '',
            totalScores: scores
          })
        }
      } else {
        // First movie search - submit a get request with the movie search
        this.getTitle(this.state.searchTerm);
        // Don't get cast yet - wait for movie selection from dropdown
      }
    } else {
      // Actor turn
      let scores = [...this.state.totalScores];
      const options = {
        includeScore: true,
        threshold: 0.6,  // Increased threshold to allow partial matches (was 0.43)
        findAllMatches: true  // Find all matches, not just the best
      };
      let fuse = new Fuse(this.state.cast, options);
      let searchedActor = normalizeActorName(this.state.searchTerm);

      console.log('This is the actor that was searched for ', searchedActor);
      let actorResults = fuse.search(searchedActor);
      console.log('actor results ', actorResults);

      // Sort by score (lower is better) and also check for first/last name matches
      let sortedActorResults = actorResults.sort((a, b) => {
        // Perfect match (score 0) comes first
        if (a.score === 0 && b.score !== 0) return -1;
        if (b.score === 0 && a.score !== 0) return 1;
        // Otherwise sort by score
        return a.score - b.score;
      });
      console.log('sortedActorResults ', sortedActorResults);

      // Check if search term matches a first or last name in the cast
      let actorIndex = -1;
      const searchLower = searchedActor.toLowerCase();

      // First check for exact matches (score = 0)
      for (let i = 0; i < sortedActorResults.length; i++) {
        if (sortedActorResults[i].score === 0) {
          actorIndex = i;
          console.log('Found exact match at index', i);
          break;
        }
      }

      // If no exact match, check if search term matches any last name
      if (actorIndex === -1) {
        for (let i = 0; i < sortedActorResults.length; i++) {
          const actorName = sortedActorResults[i].item.toLowerCase();
          const nameParts = actorName.split(' ');
          // Check if search term exactly matches any name part (first or last name)
          if (nameParts.some(part => part === searchLower)) {
            actorIndex = i;
            console.log('Found exact name match at index', i, 'for actor', sortedActorResults[i].item);
            break;
          }
        }
      }

      // If still no match, fall back to best fuzzy match (index 0)
      if (actorIndex === -1) {
        actorIndex = 0;
        console.log('Using best fuzzy match (index 0)');
      }

      if (actorResults.length > 0) {
        let foundActor = sortedActorResults[actorIndex].item;
        updatedStream.unshift(foundActor);
        this.setState({
          turnsThisRound: this.state.turnsThisRound + 1,
          highScore: Math.max(this.state.turnsThisRound + 1, ...this.state.totalScores),
          stream: updatedStream,
          officialActor: foundActor,
          movieTurn: !this.state.movieTurn,
          moviePoster: ''
        })
        this.getFilmography(foundActor);
        this.getActorImage(foundActor);
      } else {
        alert(`${this.state.searchTerm} is not in ${this.state.officialTitle}!`)
        updatedStream.unshift('BOMB!');
        scores.push(this.state.turnsThisRound);
        this.setState({
          turnsThisRound: 0,
          stream: updatedStream,
          movies: [],
          movieTurn: !this.state.movieTurn,
          actorPhoto: '',
          moviePoster: '',
          totalScores: scores
        })
      }
    }
    this.setState({
      searchTerm: ''
    })
  }

  clearStream() {
    this.setState({
      turnsThisRound: 0,
      stream: [],
      movies: [],
      movieTurn: true,
      cast: [],
      officialActor: '',
      officialTitle: '',
      moviePoster: '',
      actorPhoto: '',
      showMovieSelector: false,
      movieOptions: []
    })
  }

  handleMovieSelection(selectedMovie) {
    let updatedMovies = [...this.state.movies];
    let updatedStream = [...this.state.stream];

    const movieTitle = selectedMovie.fullTitle;

    // Validate movie is unique
    if (!isUniqueMovie(movieTitle, this.state.movies)) {
      alert('Cannot use the same movie twice in one round!');
      this.setState({
        showMovieSelector: false,
        movieOptions: []
      });
      return;
    }

    updatedStream.unshift(movieTitle);
    updatedMovies.push(movieTitle);

    this.setState({
      turnsThisRound: this.state.turnsThisRound + 1,
      highScore: Math.max(this.state.turnsThisRound + 1, ...this.state.totalScores),
      officialTitle: movieTitle,
      movies: updatedMovies,
      stream: updatedStream,
      movieTurn: !this.state.movieTurn,
      moviePoster: selectedMovie.posterPath,
      actorPhoto: '',
      showMovieSelector: false,
      movieOptions: []
    });

    // Get cast for the selected movie using the movie ID for accuracy
    this.getCastById(selectedMovie.id);
  }

  getTitle(searchTerm) {
    if (searchTerm === undefined) {
      alert('Please provide a valid movie title!');
      return;
    }

    searchTitle(searchTerm)
      .then((data) => {
        // Check for multiple matches (only on first movie search)
        if (this.state.movies.length === 0) {
          const selectionResult = processMovieSearchResultsForSelection(data, searchTerm);

          if (selectionResult.hasMultipleMatches) {
            this.setState({
              showMovieSelector: true,
              movieOptions: selectionResult.movies
            });
            return;
          } else {
            // Check if no movie was found
            if (!selectionResult.movieTitle) {
              alert(`Could not find a movie named ${searchTerm}!`);
              return;
            }

            // Single match - process normally
            const result = {
              movieTitle: selectionResult.movieTitle,
              posterPath: selectionResult.posterPath
            };
            this.processMovieResult(result);
            return;
          }
        }

        // For subsequent movies in a round, use normal processing
        const result = processMovieSearchResults(data, searchTerm);

        if (!result) {
          return; // Process failed
        }

        this.processMovieResult(result);
      })
      .catch(() => {
        console.log('There was an error getting a movie title');
        alert('Could not find a movie with that title!');
        this.setState({
          moviePoster: ''
        })
      })
  }

  processMovieResult(result) {
    let updatedMovies = [...this.state.movies];
    let updatedStream = [...this.state.stream];

    const { movieTitle, posterPath } = result;

    // Validate movie is unique
    if (!isUniqueMovie(movieTitle, this.state.movies)) {
      alert('Cannot use the same movie twice in one round!');
      return;
    }

    updatedStream.unshift(movieTitle);
    updatedMovies.push(movieTitle);

    this.setState({
      turnsThisRound: this.state.turnsThisRound + 1,
      highScore: Math.max(this.state.turnsThisRound + 1, ...this.state.totalScores),
      officialTitle: movieTitle,
      movies: updatedMovies,
      stream: updatedStream,
      movieTurn: !this.state.movieTurn,
      moviePoster: posterPath,
      actorPhoto: ''
    });
  }

  getCast(searchTerm) {
    if (searchTerm === undefined) {
      return;
    }

    // Remove year suffix for better matching (e.g., "Movie Title (2023)" -> "Movie Title")
    const titleWithoutYear = searchTerm.replace(/\s*\(\d{4}\)\s*$/, '');

    getCast(titleWithoutYear)
      .then((data) => {
        const cast = data.data.map(person => person.name);
        console.log(`${this.state.officialTitle}'s cast `, cast)
        this.setState({
          cast: cast
        })
      })
      .catch(() => console.log('There was an error getting the cast data'))
  }

  getCastById(movieId) {
    if (movieId === undefined) {
      return;
    }

    // Call the API with movie ID directly for accurate cast retrieval
    getCastById(movieId)
      .then((data) => {
        const cast = data.data.cast.map(person => person.name);
        console.log(`${this.state.officialTitle}'s cast (by ID) `, cast)
        this.setState({
          cast: cast
        })
      })
      .catch(() => console.log('There was an error getting the cast data by ID'))
  }

  getFilmography(actor) {
    getFilmography(actor)
      .then((data) => {
        const filmography = processFilmographyResults(data);
        console.log(`${actor}'s filmography `, filmography)
        this.setState({
          filmography: filmography
        })
      })
      .catch(() => console.log('The GET request failed'))
  }

  getActorImage(actor) {
    getActorImage(actor)
      .then((data) => {
        console.log(`This is the image data for ${actor} `, data.data);
        this.setState({
          actorPhoto: data.data[0].file_path
        })
      })
      .catch(() => console.log(`There was an error getting an image for ${actor}`))
  }

  componentDidMount() {
  }

  render () {
    return (
      <Container>
        <Title>BOMB!</Title>
        <Streak>Current streak: {this.state.turnsThisRound}<br></br>High score: {this.state.highScore}</Streak>
        <DefuseButton onClick={this.clearStream}>Defuse</DefuseButton>
        {this.state.actorPhoto ? <ActorPhoto src={`https://image.tmdb.org/t/p/w185${this.state.actorPhoto}`}></ActorPhoto> : null}
        {this.state.showMovieSelector ? (
          <MovieSelector movies={this.state.movieOptions} onSelect={this.handleMovieSelection} />
        ) : (
          <Form turn={this.state.movieTurn} searchTerm={this.state.searchTerm} handleChange={this.handleChange} handleSubmit={this.handleSubmit} handleEmptySubmit={this.handleEmptySubmit} officialActor={this.state.officialActor}/>
        )}
        <Stream stream={this.state.stream} className={styles.stream}/>
        {this.state.moviePoster ? <MoviePoster src={`https://image.tmdb.org/t/p/w185${this.state.moviePoster}`}></MoviePoster> : null}
      </Container>
    )
  }
}

export default App;