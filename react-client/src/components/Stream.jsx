import React from 'react';
import ListItem from './ListItem.jsx';
import styled from 'styled-components';

const MovieStream = styled.ul`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
  margin-left: auto;
  margin-right: auto;
  padding-top: 30px;
`

const Stream = (props) => (
  <MovieStream>
    {props.stream.length > 0 ? props.stream.map((data, index) => <ListItem key={index} value={data}/>) : null}
  </MovieStream>
)

export default Stream;