import React from 'react';
import styled from 'styled-components';

const ListElement = styled.li`
  font-size: 20px;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
`

const ListItem = (props) => (
  <ListElement>
    <span>{props.value}</span>
  </ListElement>
)

export default ListItem;