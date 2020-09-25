import React from 'react';
import axios from 'axios';
import Form from './Form.jsx';
import Stream from './Stream.jsx';
import ListItem from './ListItem.jsx';
import moment from 'moment';
import styles from './app.scss';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: 25% 50% 25%;
  grid-template-rows: 10% 20% 70%;
  width: 100%;
  height: 100%;
  justify-content: center;
  z-index: 2000;
`

const Title = styled.div`
  grid-column-start: 2;
  grid-column-end: 3;
  text-align: center;
  font-family: 'Luckiest Guy', cursive;
  font-size: 65px;
  vertical-align: middle;
  margin: auto;
  -webkit-text-stroke: 2px white;
`

const Streak = styled.div`
  text-align: center;
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 3;
  grid-column-end: 4;
  margin: auto;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  font-size: 20px;
  z-index: 2000;
`

const DefuseButton = styled.button`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
  height: 30px;
  width: 90px;
  margin: auto;
  border-radius: 8px;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  border-width: 1px;
  border-style: solid;
  outline: none;
  &:hover{
    background-color: #D8D8D8;
  };
  &:active{
    transform: translateY(2px);
  };
  cursor: pointer;
  font-size: 20px;
  padding-left: 15px;
  padding-right: 16px;
`

const ActorPhoto = styled.img`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 3;
  grid-row-end: 4;
  margin: auto;
  width: 250px;
  height: auto;

  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -khtml-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
`

// border: 1px solid #021a40;

const MoviePoster = styled.img`
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 3;
  grid-row-end: 4;
  margin: auto;
  width: 250px;
  height: auto;

  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -khtml-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
`

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
      highScore: 0
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getFilmography = this.getFilmography.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.clearStream = this.clearStream.bind(this);
    this.getActorImage = this.getActorImage.bind(this);
    this.handleEmptySubmit = this.handleEmptySubmit.bind(this);
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
        const MovieOptions = {
          includeScore: true,
          threshold: 0.3,
          includeMatches: true
        };
        const filmographyFuse = new Fuse(this.state.filmography, MovieOptions);
        let movieGuess = this.state.searchTerm.toLowerCase();
        console.log('Original movie search term ', movieGuess);

        if (movieGuess.indexOf('the ') === 0) {
          movieGuess = movieGuess.replace('the ', '');
        };

        let movieResults = filmographyFuse.search(movieGuess);
        console.log('movieFuse results ', movieResults);

        // movie results sorted by refIndex
        let sortedMovieResults = movieResults.sort((a, b) => {
          return b.refIndex - a.refIndex;
        });

        // movie results sorted by score
        // let sortedMovieResults = movieResults.sort((a, b) => {
        //   return a.score - b.score;
        // });
        console.log('Movies sorted by Fuse score ', sortedMovieResults);

        // sortedMovieResults = sortedMovieResults.sort((a, b) => {
        //   if (a.score === b.score) {
        //     return b.refIndex - a.refIndex;
        //   };
        // });

        let movieTitles = sortedMovieResults.map(movie => movie.item);
        console.log('movieFuse results with only titles ', movieTitles);

        // let movieTitles = movieResults.map(movie => movie.item);
        // console.log('movieFuse results with only titles ', movieTitles);

        // iterate through this.state.movies and check whether any of the movies there are in movieResults
        for (var i = 0; i < this.state.movies.length; i++) {
          for (var j = 0; j < movieTitles.length; j++) {
            var currentMovie = this.state.movies[i];
            console.log('currentMovie without year ', currentMovie.slice(0, currentMovie.length - 7));
            if (currentMovie.slice(0, currentMovie.length - 7) === movieTitles[j]) {
              movieTitles.splice(j, 1);
            }
          }
        }
        console.log('movieTitles without previous results ', movieTitles);

        // let movieResultsTitles = movieResults.map(movie => movie.item.toLowerCase());
        let movieResultsTitles = movieTitles.map(movie => movie.toLowerCase());
        console.log('Lowercase movie titles ', movieResultsTitles);

        movieResultsTitles = movieResultsTitles.map(function (movie) {
          if (movie.indexOf('the ') === 0) {
            movie = movie.slice(4);
          };
          return movie;
        })

        console.log('movieGuess ', movieGuess);
        let movieIndex = movieResultsTitles.indexOf(movieGuess);

        let movieTitleAnd;

        if (movieGuess.indexOf('and') > -1) {
          movieTitleAnd = movieGuess.replace('and', '&');
        };
        console.log('Movie title with ampersand ', movieTitleAnd);
        if (movieIndex === -1) {
          movieIndex = movieResultsTitles.indexOf(movieTitleAnd);
        }

        if (movieIndex === -1) {
          movieIndex = 0;
        }
        console.log('movie index', movieIndex);

        for (var i = 0; i < sortedMovieResults.length; i++) {
          if (sortedMovieResults[i].score === 0) {
            movieIndex = i;
          }
        }

        // change this back to movieResults if the sorted version doesn't work out
        if (movieResults.length > 0) {
          const foundMovie = movieTitles[movieIndex];
          // const foundMovie = movieResults[movieIndex].item;
          console.log('foundmovie ', foundMovie);
          this.setState({
            officialTitle: foundMovie
          })
          this.getTitle(foundMovie);
          this.getCast(foundMovie);
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
        // submit a get request with the movie search
        this.getTitle(this.state.searchTerm);
        this.getCast(this.state.searchTerm);
      }
    } else {
      let scores = [...this.state.totalScores];
      // time to submit an actor
      const options = {
        includeScore: true,
        threshold: 0.43
      };
      let fuse = new Fuse(this.state.cast, options);
      let searchedActor = this.state.searchTerm;
      if (searchedActor === 'the rock' || searchedActor === 'rock') {
        searchedActor = 'Dwayne Johnson'
      }
      console.log('This is the actor that was searched for ', searchedActor);
      let actorResults = fuse.search(searchedActor);
      console.log('actor results ', actorResults);
      let sortedActorResults = fuse.search(searchedActor).sort((a, b) => {
        return a.refIndex - b.refIndex;
      });
      console.log('sortedActorResults ', sortedActorResults)
      let actorIndex = 0;
      for (let i = 0; i < sortedActorResults.length; i++) {
        if (sortedActorResults[i].score === 0) {
          actorIndex = i;
        }
      }
      if (actorResults.length > 0) {
        // let foundActor = fuse.search(this.state.searchTerm)[0].item;
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
      // search term is tied to the input box, so clear it
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
      officialTitle: '',
      moviePoster: '',
      actorPhoto: ''
    })
  }

  getTitle(searchTerm) {
    if (searchTerm === undefined) {
      alert('Please provide a valid movie title!');
    }
    axios.post('/getTitle', {
      data: searchTerm
    })
      .then((data) => {
        const options = {
          includeScore: true,
          threshold: 0.2
        };

        let updatedMovies = [...this.state.movies];
        let updatedStream = [...this.state.stream];

        let movieTitle = searchTerm.toLowerCase();
        // let movieTitle = searchTerm;

        console.log(`Movie data when searching for ${movieTitle} `, data.data.results);
        console.log(`Movie titles when searching for ${movieTitle} `, data.data.results.map(movie => movie.title));

        let relevantTitles = data.data.results.filter(movie => movie.vote_count > 500).slice(0, 5);
        console.log('Relevant titles ', relevantTitles);

        const sortedMovies = relevantTitles.sort((a, b) => {
          return moment(a.release_date).diff(b.release_date);
        });
        console.log('Sorted titles ', sortedMovies);

        let lowercaseTitles = relevantTitles.map(movie => movie.title.toLowerCase());
        console.log('Sorted lowercase titles ', lowercaseTitles);

        lowercaseTitles = lowercaseTitles.map(function removeThe(movie) {
          if (movie.indexOf('the ') === 0) {
            movie = movie.slice(4);
          };
          return movie;
        })
        console.log('Lowercase titles without the ', lowercaseTitles);

        if (movieTitle.indexOf('the ') === 0) {
          movieTitle = movieTitle.slice(4);
        };
        console.log('Movie title without the ', movieTitle);

        let movieTitleAnd;

        if (movieTitle.indexOf('and') > -1) {
          movieTitleAnd = movieTitle.replace('and', '&');
        };
        console.log('Movie title with ampersand ', movieTitleAnd);

        let titleIndex = lowercaseTitles.indexOf(movieTitle);
        console.log('This is the title index after trying original title ', titleIndex);

        if (titleIndex === -1) {
          titleIndex = lowercaseTitles.indexOf(movieTitleAnd);
        }
        console.log('Title index after inserting ampersand ', titleIndex);

        if (titleIndex > -1 && titleIndex <= 4) {
          if (movieTitle.length / relevantTitles[titleIndex].title.length < 1/4) {
            alert(`Could not find a movie named ${movieTitle}!`)
            movieTitle = undefined;
          } else {
            movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
            updatedMovies.push(movieTitle);
          }
        } else {
          titleIndex = 0;
          movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
          updatedMovies.push(movieTitle);
          // if (movieTitle.length / relevantTitles[titleIndex].title.length < 1/4) {
          //   alert(`Could not find a movie named ${movieTitle}!`)
          //   movieTitle = undefined;
          // } else {
          //   movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
          //   updatedMovies.push(movieTitle);
          // }
        }

        // if the stream does not already have the search term, update the stream to include it
        if (!this.state.movies.includes(movieTitle) && movieTitle !== undefined) {
          updatedStream.unshift(movieTitle);
          this.setState({
            turnsThisRound: this.state.turnsThisRound + 1,
            highScore: Math.max(this.state.turnsThisRound + 1, ...this.state.totalScores),
            officialTitle: movieTitle,
            movies: updatedMovies,
            stream: updatedStream,
            // we only switch the turns if a valid movie title was returned
            movieTurn: !this.state.movieTurn,
            moviePoster: relevantTitles[titleIndex].poster_path,
            actorPhoto: ''
          })
        } else {
          alert('Cannot use the same movie twice in one round!');
        }
      })
      .catch(() => {
        console.log('There was an error getting a movie title');
        alert('Could not find a movie with that title!');
        this.setState({
          moviePoster: ''
        })
      })
  }

  getCast(searchTerm) {
    if (searchTerm === undefined) {
      return;
    }
    axios.post('/getCast', {
      data: searchTerm
    })
      .then((data) => {
        const cast = data.data.map(person => person.name);
        console.log(`${this.state.officialTitle}'s cast `, cast)
        this.setState({
          cast: cast
        })
      })
      .catch(() => console.log('There was an error getting the cast data'))
  }

  getFilmography(actor) {
    axios.post('/filmography', {
      data: actor
    })
      .then((data) => {
        let relevantFilmography = data.data.filter(movie => movie.vote_count > 500);
        console.log('Relevant filmography ', relevantFilmography);
        let filmographyByDate = relevantFilmography.sort((a, b) => {
          return new Date(b.release_date) - new Date(a.release_date);
        })
        console.log('filmographyByDate ', filmographyByDate);
        let filmography = filmographyByDate.map(movie => movie.title)
        console.log(`${this.state.officialActor}'s filmography `, filmography)
        this.setState({
          filmography: filmography
        })
      })
      .catch(() => console.log('The GET request failed'))
  }

  getActorImage(actor) {
    axios.post('/images', {
      data: actor
    })
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
        <Form turn={this.state.movieTurn} searchTerm={this.state.searchTerm} handleChange={this.handleChange} handleSubmit={this.handleSubmit} handleEmptySubmit={this.handleEmptySubmit}/>
        <Stream stream={this.state.stream} className={styles.stream}/>
        {this.state.moviePoster ? <MoviePoster src={`https://image.tmdb.org/t/p/w185${this.state.moviePoster}`}></MoviePoster> : null}
      </Container>
    )
  }
}

export default App;