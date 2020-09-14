import React from 'react';
import axios from 'axios';
import Form from './Form.jsx';
import Stream from './Stream.jsx';
import ListItem from './ListItem.jsx';
// import Fuse from 'fuse.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      actors: [],
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
    let updatedActors = [...this.state.actors];

    if (this.state.movieTurn) {
      // submit a get request with the movie search
      this.getTitle(this.state.searchTerm);
      this.getCast(this.state.searchTerm);
    } else {
      // time to submit an actor
      // these are the options for fuse
      const options = {
        includeScore: true,
        threshold: 0.3
      };
      const fuse = new Fuse(this.state.cast, options);
      const searchedActor = this.state.searchTerm;
      let actorResults = fuse.search(searchedActor);
      let updatedStream = [...this.state.stream];
      if (actorResults.length > 0) {
        let foundActor = fuse.search(this.state.searchTerm)[0].item;
        updatedStream.push(foundActor);
        this.setState({
          stream: updatedStream,
          officialActor: foundActor
        })
        this.getFilmography(this.state.officialActor);
      } else {
        updatedStream.push('BOMB!');
        this.setState({
          stream: updatedStream
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
        let updatedMovies = [...this.state.movies];
        let updatedStream = [...this.state.stream];
        console.log(data.data.results);
        let officialTitle = data.data.results[0].title;
        updatedMovies.push(officialTitle);

        // if the stream does not already have the search term, update the stream to include it
        if (!this.state.stream.includes(officialTitle)) {
          updatedStream.push(officialTitle);
        }

        this.setState({
          officialTitle: officialTitle,
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
      data: this.state.officialActor
    })
      .then((data) => console.log(data.data.cast))
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