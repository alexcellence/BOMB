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
  grid-template-rows: 10% 10% 60% 20%;
  width: 100%;
  height: 100%;
  justify-content: center;
`

const Title = styled.div`
  grid-column-start: 2;
  grid-column-end: 3;
  text-align: center;
  font-family: 'Luckiest Guy', cursive;
  font-size: 65px;
  vertical-align: middle;
  margin: auto;
`

const Streak = styled.div`
  text-align: center;
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 3;
  grid-column-end: 4;
  margin: auto;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
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
`

const ActorPhoto = styled.img`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 3;
  grid-row-end: 4;
  margin: auto;
`

const MoviePoster = styled.img`
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 3;
  grid-row-end: 4;
  margin: auto;
`

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      filmography: [],
      movieTurn: true,
      officialActor: '',
      searchTerm: '',
      stream: [],
      cast: [],
      officialTitle: '',
      turnsThisRound: 0,
      actorPhoto: '',
      moviePoster: '',
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
        const options = {
          includeScore: true,
          threshold: 0.3,
          includeMatches: true
        };
        const filmographyFuse = new Fuse(this.state.filmography, options);
        let movieGuess = this.state.searchTerm.toLowerCase();
        console.log('movie guess ', movieGuess);
        let theIndex = movieGuess.indexOf('the');
        console.log('the index ', movieGuess.indexOf('the'));
        if (movieGuess.indexOf('the') === 0) {
          movieGuess = movieGuess.replace('the', '');
        };
        console.log('movie guess without the ', movieGuess);

        let movieResults = filmographyFuse.search(movieGuess);
        console.log('movieFuse results ', movieResults);

        let unsortedTitles = filmographyFuse.search(movieGuess);
        console.log('movieFuse results ', movieResults);

        let movieResultsTitles = movieResults.map(movie => movie.item.toLowerCase());
        console.log('Movie results titles ', movieResultsTitles);

        let movieIndex = movieResultsTitles.indexOf(movieGuess);
        console.log('movie index', movieIndex);

        if (movieIndex === -1) {
          movieIndex = 0;
        }
        let sortedMovieResults = movieResults.sort((a, b) => {
          return a.refIndex - b.refIndex;
        });

        for (var i = 0; i < sortedMovieResults.length; i++) {
          if (sortedMovieResults[i].score === 0) {
            movieIndex = i;
          }
        }

        console.log('sorted results ', sortedMovieResults);
        // change this back to movieResults if the sorted version doesn't work out
        if (movieResults.length > 0) {
          console.log('unsorted titles ', unsortedTitles);
          console.log('movie index ', movieIndex);
          const foundMovie = sortedMovieResults[movieIndex].item;
          console.log('foundmovie ', foundMovie);
          // updatedStream.push(foundMovie);
          this.setState({
            // stream: updatedStream,
            // movieTurn: !this.state.movieTurn,
            officialTitle: foundMovie
          })
          this.getTitle(foundMovie);
          this.getCast(foundMovie);
        } else {
          alert(`${this.state.officialActor} is not in ${this.state.searchTerm}!`);
          updatedStream.push('BOMB!');
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
      const searchedActor = this.state.searchTerm;
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
        updatedStream.push(foundActor);
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
        updatedStream.push('BOMB!');
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

        console.log(`Movie data when searching for ${movieTitle} `, data.data.results);

        let relevantTitles = data.data.results.filter(movie => movie.vote_count > 500).slice(0, 5);
        console.log('Relevant titles ', relevantTitles);

        const sortedMovies = relevantTitles.sort((a, b) => {
          return moment(a.release_date).diff(b.release_date);
        });
        console.log('Sorted titles ', sortedMovies);

        const lowercaseTitles = relevantTitles.map(movie => movie.title.toLowerCase());

        console.log('Sorted lowercase titles ', lowercaseTitles);

        let titleIndex = lowercaseTitles.indexOf(movieTitle);
        console.log('Title index (is there an exact match?) ', titleIndex);

        if (titleIndex > -1 && titleIndex < 4) {
          if (movieTitle.length / relevantTitles[titleIndex].title.length < 1/4) {
            alert(`Could not find a movie named ${movieTitle}!`)
            movieTitle = undefined;
          } else {
            movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
            updatedMovies.push(movieTitle);
          }
        } else {
          titleIndex = 0;
          if (movieTitle.length / relevantTitles[titleIndex].title.length < 1/4) {
            alert(`Could not find a movie named ${movieTitle}!`)
            movieTitle = undefined;
          } else {
            movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
            updatedMovies.push(movieTitle);
          }
        }

        // if the stream does not already have the search term, update the stream to include it
        if (!this.state.movies.includes(movieTitle) && movieTitle !== undefined) {
          updatedStream.push(movieTitle);
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
        let filmography = relevantFilmography.map(movie => movie.title)
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