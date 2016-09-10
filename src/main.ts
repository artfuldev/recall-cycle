import intent from './intent';
import model from './model';
import view from './view';
import { Sources, Sinks } from './definitions';

function main(sources: Sources): Sinks {
  const vdom$ = view(model(intent(sources)));
  return {
    dom: vdom$
  };
}

export default main;
