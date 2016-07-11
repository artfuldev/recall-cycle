import reducers, { InitialState } from './reducers';
import { Map } from 'immutable';
import { IIntent } from './intent';
import { Stream } from 'xstream';
import { IState } from './definitions';

function model(actions: IIntent): Stream<IState> {
  const reducer$ = reducers(actions);
  const state$ = reducer$.fold((next, reducer) => reducer(next), InitialState);
  return state$;
}

export default model;