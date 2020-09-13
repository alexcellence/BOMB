import React from 'react';
import axios from 'axios';
import Form from './Form.jsx';
import Stream from './Stream.jsx';
import ListItem from './ListItem.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      actors: [],
      movieTurn: true,
      currentMovie: '',
      searchTerm: '',
      stream: [],
      cast: []
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkActor = this.checkActor.bind(this);
    this.checkMovie = this.checkMovie.bind(this);
  }

  handleChange(event) {
    this.setState({
      searchTerm: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();

    let updatedStream = [...this.state.stream];
    let updatedMovies = [...this.state.movies];
    let updatedActors = [...this.state.actors];

    // if the stream does not already have the search term, update the stream to include it
    if (!this.state.stream.includes(this.state.searchTerm)) {
      updatedStream.push(this.state.searchTerm);
    }

    // if it's the movie turn, add the most recent search term to the movies array
    if (this.state.movieTurn) {
      updatedMovies.push(this.state.searchTerm);
      // submit a get request with the movie search
      this.checkMovie(this.state.searchTerm);
    } else {
      // if it's not the movies turn it must be the actor's turn so add the most recent search term to the actors array
      updatedActors.push(this.state.searchTerm);
    }

    this.setState({
      // after clicking submit, change the turn to be opposite of what it was before
      movieTurn: !this.state.movieTurn,
      // search term is tied to the input box, so clear it
      searchTerm: '',
      stream: updatedStream,
      movies: updatedMovies,
      actors: updatedActors
    })
  }

  checkMovie(searchTerm) {
    axios.post('/movies', {
      data: this.state.searchTerm
    })
      .then((data) => {
        console.log('data ', data.data.results)
        let officialTitle = data.data.results;
        let cast = data.data.cast.map(cast => cast.name);
        this.setState({
          cast: cast
        })
      })
      .catch(() => console.log('The GET request failed'))
  }

  checkActor(text) {
    axios.post('/actors', {
      data: this.state.searchTerm
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