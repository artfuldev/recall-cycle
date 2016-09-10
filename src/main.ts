import intent from './intent';
import model from './model';
import view from './view';
import Button from './components/button';
import xs from 'xstream';
import { Sources, Sinks } from './definitions';

function main(sources: Sources): Sinks {
  const newGameButton = Button({ classes$: xs.of('.new'), content$: xs.of('New Game'), dom: sources.dom });
  const vdom$ = view(model(intent(sources, newGameButton.click$)), newGameButton.dom);
  return {
    dom: vdom$
  };
}

export default main;
