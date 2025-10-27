import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 2;
  grid-column-end: 3;
  text-align: center;
  z-index: 2000;
`;

const SelectorLabel = styled.label`
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  font-size: 20px;
  display: block;
  margin-bottom: 15px;
`;

const SelectBox = styled.select`
  width: 60%;
  height: 50px;
  padding: 0px 16px;
  border: none;
  border-radius: 4px;
  font-family: 'Gotham SSm A', 'Gotham SSm B', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #282828;
  outline: none;
  background-color: white;
  cursor: pointer;
  margin-right: 8px;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.1);
`;

const SubmitButton = styled.button`
  border-width: 1px;
  border-style: solid;
  outline: none;
  border-radius: 8px;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  background-color: white;
  &:hover{
    background-color: #D8D8D8;
  };
  &:active{
    transform: translateY(2px);
  };
  cursor: pointer;
  font-size: 20px;
  padding: 10px 15px;
`;

const MovieSelector = ({ movies, onSelect }) => {
  const handleChange = (event) => {
    const selectedIndex = event.target.value;
    if (selectedIndex !== '') {
      onSelect(movies[selectedIndex]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedIndex = document.getElementById('movieSelect').value;
    if (selectedIndex !== '') {
      onSelect(movies[selectedIndex]);
    }
  };

  return (
    <SelectorContainer>
      <form onSubmit={handleSubmit}>
        <SelectorLabel>
          Multiple movies found. Please select one:
          <SelectBox id="movieSelect" onChange={handleChange} defaultValue="">
            <option value="">-- Select a movie --</option>
            {movies.map((movie, index) => (
              <option key={movie.id} value={index}>
                {movie.fullTitle}
              </option>
            ))}
          </SelectBox>
        </SelectorLabel>
        <SubmitButton type="submit">Submit</SubmitButton>
      </form>
    </SelectorContainer>
  );
};

export default MovieSelector;
