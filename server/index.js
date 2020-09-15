const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const API = require('../config.js');
const axios = require('axios');
const moment = require('moment');

// var items = require('../database-mysql');
// var items = require('../database-mongo');

const app = express();

app.use(express.static(__dirname + '/../react-client/dist'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  console.log(`Received a ${req.method} request to ${req.path}`);
  next();
})

// this will get movie results for searched title
app.post('/getTitle', function (req, res) {
  // this is the contents of the React form when submit is clicked
  const searchTerm = req.body.data;
  // this searches the movie db using my private API key and the search term that was entered into the form
  axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API.tmdbAPI}&query=${searchTerm}`)
    .then((data) => {
      // send back all the search results for that movie title
      res.status(200).send(data.data);
    })
    .catch(() => {
      console.log('There was an error geting a movie title from tmdb');
      res.status(400)
    })
});

// this will get the cast of the searched movie
app.post('/getCast', function (req, res) {
  const searchTerm = req.body.data.toLowerCase();
  axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API.tmdbAPI}&query=${searchTerm}`)
    .then((data) => {
      // filter list to only include movies with a vote count over 350 to weed out unpopular titles that share the same name then take only the first four on the list
      const filteredMovies = data.data.results.filter(movie => movie.vote_count > 350).slice(0, 4);
      console.log(filteredMovies);
      const sortedMovies = filteredMovies.sort((a, b) => {
        return moment(a.release_date).diff(b.release_date);
      });
      console.log('sorted movies ', sortedMovies);
      // only take the first four movies on the list because they will be the most relevant
      const relevantTitles = filteredMovies.slice(0, 4).map(movie => movie.title.toLowerCase());
      console.log('relevant titles ', relevantTitles);
      // search for an exact match with the search term first
      let titleIndex = relevantTitles.indexOf(searchTerm);
      // if there is no exact match, go with the first movie that tmdb suggests
      if (titleIndex === -1) {
        titleIndex = 0;
      }
      const bestMatch = filteredMovies[titleIndex].id;
      // this searches for the cast of the best match
      axios.get(`https://api.themoviedb.org/3/movie/${bestMatch}/credits?api_key=${API.tmdbAPI}`)
        .then((data) => {
          // we will return the cast data for that first result to client
          res.status(200).send(data.data.cast);
        })
        .catch(() => console.log('There was an error getting cast data from tmdb'))
    })
    .catch(() => console.log('There was an error geting cast data from tmdb'));
});

// this will get the filmography of the searched actor
app.post('/filmography', function (req, res) {
  const searchedActor = req.body.data;
  console.log('searchedActor ', searchedActor);
  axios.get(`https://api.themoviedb.org/3/search/person?api_key=${API.tmdbAPI}&language=en-US&query=${searchedActor}`)
    .then((data) => {
      // console.log('data ', data.data.results);
      const actorID = data.data.results[0].id;
      console.log(actorID);
      axios.get(`https://api.themoviedb.org/3/person/${actorID}/movie_credits?api_key=${API.tmdbAPI}&language=en-US`)
        .then((data) => {
          console.log('data ', data.data.cast);
          res.status(200).send(data.data.cast)
        })
        .catch(() => console.log(`There was an error getting ${searchedActor}'s movie credits`))
    })
    .catch(() => console.log(`There was an error getting ${searchedActor}'s filmography`))
})

app.listen(4000, function() {
  console.log('listening on port 4000!');
});

