import React from 'react';

const Form = (props) => (
  <div>
    <form onSubmit={props.handleSubmit}>
      <label>
        {props.turn ? <p>Movie</p> : <p>Actor</p>}
        <input type="text" name="currentMovie" value={props.searchTerm} onChange={props.handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  </div>
)

export default Form;