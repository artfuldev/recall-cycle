import reducers from './reducers';
import { Intent } from './intent';
import { Stream } from 'xstream';
import { State } from './definitions';

function model(actions: Intent): State {
  const state = reducers(actions);
  return state;
}

export default model;
