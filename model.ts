import reducers from './reducers';
import { Map } from 'immutable';

function model(actions) {
  var grid = [];
  for (var i = 0; i < 25; i++)
    grid.push(i);
  const reducer$ = reducers(actions);
  const initialState = Map(
    {
      grid,
      puzzle: [],
      allowed: false,
      selected: [],
      over: false,
      score: 0,
      result: null
    }
  );
  const state$ = reducer$.fold((next, reducer) => reducer(next), initialState);
  return state$;
}

export default model;