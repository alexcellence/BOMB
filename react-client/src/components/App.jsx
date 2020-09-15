import React from 'react';
import axios from 'axios';
import Form from './Form.jsx';
import Stream from './Stream.jsx';
import ListItem from './ListItem.jsx';
import moment from 'moment';
// import Fuse from 'fuse.js';

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
      officialTitle: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getFilmography = this.getFilmography.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.clearStream = this.clearStream.bind(this);
  }

  handleChange(event) {
    this.setState({
      searchTerm: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();

    let updatedMovies = [...this.state.movies];
    let updatedStream = [...this.state.stream];

    if (this.state.movieTurn) {
      if (this.state.movies.length > 0) {
        const options = {
          includeScore: true,
          threshold: 0.3
        };
        const filmographyFuse = new Fuse(this.state.filmography, options);
        let movieGuess = this.state.searchTerm.toLowerCase();
        console.log('movie guess ', movieGuess);
        console.log('type of movie guess ', typeof movieGuess)
        let theIndex = movieGuess.indexOf('the');
        console.log('the index ', movieGuess.indexOf('the'));
        if (movieGuess.indexOf('the') > -1) {
          movieGuess = movieGuess.replace('the', '');
        }

        console.log('movie guess without the ', movieGuess);
        let movieResults = filmographyFuse.search(movieGuess);
        console.log('movieFuse results ', movieResults);
        if (movieResults.length > 0) {
          const foundMovie = movieResults[0].item;
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
          this.setState({
            stream: updatedStream,
            movies: []
          })
        }
      } else {
        // submit a get request with the movie search
        this.getTitle(this.state.searchTerm);
        this.getCast(this.state.searchTerm);
      }
    } else {
      // time to submit an actor
      const options = {
        includeScore: true,
        threshold: 0.5
      };
      let fuse = new Fuse(this.state.cast, options);
      const searchedActor = this.state.searchTerm;
      let actorResults = fuse.search(searchedActor);
      console.log('actor results ', actorResults);
      if (actorResults.length > 0) {
        let foundActor = fuse.search(this.state.searchTerm)[0].item;
        updatedStream.push(foundActor);
        this.setState({
          stream: updatedStream,
          officialActor: foundActor,
          movieTurn: !this.state.movieTurn
        })
        this.getFilmography(foundActor);
      } else {
        alert(`${this.state.searchTerm} is not in ${this.state.officialTitle}!`)
        updatedStream.push('BOMB!');
        this.setState({
          stream: updatedStream,
          movies: [],
          movieTurn: !this.state.movieTurn
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
      stream: [],
      movies: [],
      movieTurn: true,
      cast: [],
      officialTitle: ''
    })
  }

  getTitle(searchTerm) {
    axios.post('/getTitle', {
      data: this.state.searchTerm
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

        let relevantTitles = data.data.results.filter(movie => movie.vote_count > 500).slice(0, 4);
        console.log('Relevant titles ', relevantTitles);

        const sortedMovies = relevantTitles.sort((a, b) => {
          return moment(a.release_date).diff(b.release_date);
        });
        console.log('Sorted titles ', sortedMovies);

        const lowercaseTitles = relevantTitles.map(movie => movie.title.toLowerCase());

        console.log('lowercaseTitles ', lowercaseTitles);

        let titleIndex = lowercaseTitles.indexOf(movieTitle);
        console.log('titleIndex ', titleIndex);

        if (titleIndex > -1 && titleIndex < 4) {
          if (movieTitle.length / relevantTitles[titleIndex].title.length < 1/4) {
            alert(`Could not find a movie named ${movieTitle}!`)
            movieTitle = undefined;
          } else {
            movieTitle = `${relevantTitles[titleIndex].title} (${relevantTitles[titleIndex].release_date.slice(0, 4)})`;
            updatedMovies.push(movieTitle);
          }
        } else {
          if (movieTitle.length / relevantTitles[0].title.length < 1/4) {
            alert(`Could not find a movie named ${movieTitle}!`)
            movieTitle = undefined;
          } else {
            movieTitle = `${relevantTitles[0].title} (${relevantTitles[0].release_date.slice(0, 4)})`;
            updatedMovies.push(movieTitle);
          }
        }

        // if the stream does not already have the search term, update the stream to include it
        if (!this.state.stream.includes(movieTitle) && movieTitle !== undefined) {
          updatedStream.push(movieTitle);
          this.setState({
            officialTitle: movieTitle,
            movies: updatedMovies,
            stream: updatedStream,
            // we only switch the turns if a valid movie title was returned
            movieTurn: !this.state.movieTurn
          })
        } else {
          alert('Cannot use the same movie twice in one round!')
        }
      })
      .catch(() => {
        console.log('There was an error getting a movie title');
        alert('Could not find a movie with that title!');
      })
  }

  getCast(searchTerm) {
    axios.post('/getCast', {
      data: this.state.searchTerm
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
        let filmography = data.data.map(movie => movie.title)
        console.log(`${this.state.officialActor}'s filmography `, filmography)
        this.setState({
          filmography: filmography
        })
      })
      .catch(() => console.log('The GET request failed'))
  }

  componentDidMount() {
  }

  render () {
    return (
      <div>
        <h1>BOMB</h1>
        <button onClick={this.clearStream}>Defuse</button>
        <Form turn={this.state.movieTurn} searchTerm={this.state.searchTerm} handleChange={this.handleChange} handleSubmit={this.handleSubmit}/>
        <Stream stream={this.state.stream}/>
      </div>
    )
  }
}

export default App;