import React from 'react';
import styled from 'styled-components';

const ListElement = styled.li`
  font-size: 20px;
`

const ListItem = (props) => (
  <ListElement>
    <span>{props.value}</span>
  </ListElement>
)

export default ListItem;