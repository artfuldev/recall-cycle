import intent from './intent';
import model from './model';
import view from './view';
import { ISources, ISinks } from './definitions';

function main(sources: ISources): ISinks {
  const vdom$ = view(model(intent(sources)));
  return {
    dom: vdom$
  };
}

export default main;
