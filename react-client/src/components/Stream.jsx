import React from 'react';
import ListItem from './ListItem.jsx';

const Stream = (props) => (
    <ul>
      {props.stream.length > 0 ? props.stream.map((data, index) => <ListItem key={index} value={data}/>) : null}
    </ul>
)

export default Stream;