import React from 'react';
import styled from 'styled-components';

const Input = styled.div`
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 2;
  grid-column-end: 3;
  text-align: center;
`

const Submit = styled.input`
  border-width: 1px;
  border-style: solid;
  outline: none;
  border-radius: 8px;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  &:hover{
    background-color: #D8D8D8;
  };
  &:active{
    transform: translateY(2px);
  };
  cursor: pointer;
`

const Label = styled.label`
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
`

const Form = (props) => (
  <Input>
    {/* <form onSubmit={props.handleSubmit}> */}
    <form onSubmit={props.searchTerm === '' ? props.handleEmptySubmit : props.handleSubmit}>
      <Label>
        {props.turn ? <p>Movie</p> : <p>Actor</p>}
        <input type="text" name="currentMovie" value={props.searchTerm} onChange={props.handleChange} />
      </Label>
      <Submit type="submit" value="Submit" />
    </form>
  </Input>
)

export default Form;