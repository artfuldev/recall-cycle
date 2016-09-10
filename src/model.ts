import reducers from './reducers';
import { IIntent } from './intent';
import { Stream } from 'xstream';
import { State } from './definitions';

function model(actions: IIntent): State {
  const state = reducers(actions);
  return state;
}

export default model;
