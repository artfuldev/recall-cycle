import reducers from './reducers';
import { IIntent } from './intent';
import { Stream } from 'xstream';
import { IState } from './definitions';

function model(actions: IIntent): IState {
  const state = reducers(actions);
  return state;
}

export default model;
