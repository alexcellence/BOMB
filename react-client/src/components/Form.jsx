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
  font-size: 20px;
`

const Label = styled.label`
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
`

// width: 100%;
// height: 56px;
// border-radius: 4px;
// position: relative;
// background-color: rgba(255,255,255,0.3);
// transition: 0.3s all;

const SubmissionBox = styled.input`


  width: 60%;
  height: 50px;
  position: relative;
  padding: 0px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  font-family: 'Gotham SSm A', 'Gotham SSm B', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: normal;
  color: #282828;
  outline: none;
  box-shadow: 0px 4px 20px 0px transparent;
  transition: 0.3s background-color ease-in-out, 0.3s box-shadow ease-in-out, 0.1s padding ease-in-out;
  -webkit-appearance: none;
`

const Instructions = styled.p`
  font-size: 20px;
`

const Form = (props) => (
  <Input>
    {/* <form onSubmit={props.handleSubmit}> */}
    <form onSubmit={props.searchTerm === '' ? props.handleEmptySubmit : props.handleSubmit}>
      <Label>
        {props.turn ? <Instructions>Please pick a movie!</Instructions> : <Instructions>Name an actor in that movie!</Instructions>}
        <SubmissionBox type="text" name="currentMovie" value={props.searchTerm} onChange={props.handleChange} />
      </Label>
      <Submit type="submit" value="Submit" />
    </form>
  </Input>
)

export default Form;