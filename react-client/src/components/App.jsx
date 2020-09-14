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
    // these are the options for fuse
    const options = {
      includeScore: true,
      threshold: 0.3
    };

    if (this.state.movieTurn) {
      if (this.state.movies.length > 0) {
        const filmographyFuse = new Fuse(this.state.filmography, options);
        const movieGuess = this.state.searchTerm;
        let movieResults = filmographyFuse.search(movieGuess);
        if (movieResults.length > 0) {
          const foundMovie = movieResults[0].item;
          updatedStream.push(foundMovie);
          this.setState({
            stream: updatedStream
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
      let fuse = new Fuse(this.state.cast, options);
      const searchedActor = this.state.searchTerm;
      let actorResults = fuse.search(searchedActor);
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
          movies: []
        })
      }
    }
    this.setState({
      // search term is tied to the input box, so clear it
      searchTerm: ''
    })
  }

  getTitle(searchTerm) {
    axios.post('/getTitle', {
      data: this.state.searchTerm
    })
      .then((data) => {
        const options = {
          includeScore: true,
          threshold: 0.3
        };
        let updatedMovies = [...this.state.movies];
        let updatedStream = [...this.state.stream];

        let movieTitle = searchTerm.toLowerCase();

        const possibleTitles = data.data.results.map(movie => movie.title.toLowerCase());
        console.log(data.data.results);
        console.log('possibleTitles ', possibleTitles);
        console.log('movieTitle ', movieTitle)

        let titleIndex = possibleTitles.indexOf(movieTitle);
        console.log('titleIndex ', titleIndex);
        let today = new Date();
        console.log('today ', today);
        console.log('moment ', moment().format('YYYY-MM-DD'));

        if (titleIndex > -1 && titleIndex < 5) {
          movieTitle = data.data.results[titleIndex].title;
        } else {
          movieTitle = data.data.results[0].title;
        }
        console.log('updated movie title ', movieTitle);
        updatedMovies.push(movieTitle);

        // if the stream does not already have the search term, update the stream to include it
        if (!this.state.stream.includes(movieTitle)) {
          updatedStream.push(movieTitle);
        }

        this.setState({
          // officialTitle: officialTitle,
          movies: updatedMovies,
          stream: updatedStream,
          // we only switch the turns if a valid movie title was returned
          movieTurn: !this.state.movieTurn
        })

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
        console.log('castData ', data.data)
        const cast = data.data.map(person => person.name);
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
        <Form turn={this.state.movieTurn} searchTerm={this.state.searchTerm} handleChange={this.handleChange} handleSubmit={this.handleSubmit}/>
        <Stream stream={this.state.stream}/>
      </div>
    )
  }
}

export default App;