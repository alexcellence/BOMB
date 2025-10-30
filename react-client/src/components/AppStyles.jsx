import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 25% 50% 25%;
  grid-template-rows: auto auto 1fr;
  width: 100%;
  height: 100vh;
  justify-content: center;
  z-index: 2000;
  row-gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 5% 90% 5%;
    row-gap: 12px;
  }
`;

export const Title = styled.div`
  grid-column-start: 2;
  grid-column-end: 3;
  text-align: center;
  font-family: 'Luckiest Guy', cursive;
  font-size: 65px;
  vertical-align: middle;
  margin: auto;
  -webkit-text-stroke: 2px white;

  @media (max-width: 768px) {
    font-size: 42px;
  }
`;

export const Streak = styled.div`
  text-align: center;
  grid-row-start: 2;
  grid-row-end: 3;
  grid-column-start: 3;
  grid-column-end: 4;
  margin: auto;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  font-size: 20px;
  z-index: 2000;
`;

export const DefuseButton = styled.button`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
  height: 30px;
  width: 90px;
  margin: auto;
  border-radius: 8px;
  font-family: Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
  border-width: 1px;
  border-style: solid;
  outline: none;
  &:hover{
    background-color: #D8D8D8;
  };
  &:active{
    transform: translateY(2px);
  };
  cursor: pointer;
  font-size: 20px;
  padding-left: 15px;
  padding-right: 16px;
`;

export const ActorPhoto = styled.img`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 3;
  grid-row-end: 4;
  margin: auto;
  width: 250px;
  height: auto;

  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -khtml-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
`;

export const MoviePoster = styled.img`
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 3;
  grid-row-end: 4;
  margin: auto;
  width: 250px;
  height: auto;

  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
  -khtml-box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.4);
`;
