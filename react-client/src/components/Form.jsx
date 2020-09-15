import React from 'react';
import styled from 'styled-components';

const Input = styled.div`
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 2;
  grid-column-end: 3;
  text-align: center;
`

const Form = (props) => (
  <Input>
    <form onSubmit={props.handleSubmit}>
      <label>
        {props.turn ? <p>Movie</p> : <p>Actor</p>}
        <input type="text" name="currentMovie" value={props.searchTerm} onChange={props.handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  </Input>
)

export default Form;