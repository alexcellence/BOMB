const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const API = require('../config.js');
const axios = require('axios');
// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
// var items = require('../database-mysql');
// var items = require('../database-mongo');

const app = express();

app.use(express.static(__dirname + '/../react-client/dist'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use((req, res, next) => {
  console.log(`Received a ${req.method} request to ${req.path}`);
  next();
})

app.post('/movies', function (req, res) {
  // this is the contents of the React form when submit is clicked
  const searchTerm = req.body.data;
  axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API.tmdbAPI}&query=${searchTerm}`)
    .then((data) => {
      // the first result is normally spot on, so we will rely on that result for our connected data
      const bestMatch = data.data.results[0].id;
      res.status(200).send(data.data);
      axios.get(`https://api.themoviedb.org/3/movie/${bestMatch}/credits?api_key=${API.tmdbAPI}`)
        .then((data) => {
          console.log('credits data ', data.data);
          // we will return the cast data for that first result to client
          res.status(200).send(data.data);
        })
    })
    .catch(() => console.log('There was an error geting data from tmdb'));
});

app.listen(4000, function() {
  console.log('listening on port 4000!');
});

