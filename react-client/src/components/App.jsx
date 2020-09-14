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
      cast: [],
      officialTitle: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkActor = this.checkActor.bind(this);
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

    }

    this.setState({
      // after clicking submit, change the turn to be opposite of what it was before
      movieTurn: !this.state.movieTurn,
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

        let officialTitle = data.data.results[0].title;
        updatedMovies.push(officialTitle);

        // if the stream does not already have the search term, update the stream to include it
        if (!this.state.stream.includes(officialTitle)) {
          updatedStream.push(officialTitle);
        }

        this.setState({
          officialTitle: officialTitle,
          movies: updatedMovies,
          stream: updatedStream
        })

      })
      .catch(() => console.log('The GET request failed'))
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