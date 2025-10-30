import axios from 'axios';

export const searchTitle = (searchTerm) => {
  return axios.post('/getTitle', { data: searchTerm });
};

export const getCast = (searchTerm) => {
  return axios.post('/getCast', { data: searchTerm });
};

export const getFilmography = (actor) => {
  return axios.post('/filmography', { data: actor });
};

export const getActorImage = (actor) => {
  return axios.post('/images', { data: actor });
};

export const getCastById = (movieId) => {
  return axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${require('../../../config.js').tmdbAPI}`);
};
