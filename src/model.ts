import reducers, { InitialState } from './reducers';
import { Map } from 'immutable';
import { Intent } from './intent';
import { Stream } from 'xstream';
import { IState } from './definitions';

function model(actions: Intent): Stream<IState> {
  const reducer$ = reducers(actions);
  const state$ = reducer$.fold((next, reducer) => reducer(next), InitialState);
  return state$;
}

export default model;