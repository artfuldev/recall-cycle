import intent from './intent';
import model from './model';
import view from './view';
import Button from './components/button';
import Grid from './components/grid';
import xs from 'xstream';
import { Sources, Sinks } from './definitions';

function main(sources: Sources): Sinks {
  const newGameButton =
    Button({
      selector$: xs.of('.new'),
      content$: xs.of('New Game'),
      dom: sources.dom
    });
  const grid = Grid({
    dom: sources.dom,
    puzzle$: xs.never(),
    result$: xs.never()
  });
  const vdom$ =
    view(
      model(intent(newGameButton.click$, grid.selected$)),
      newGameButton.dom,
      grid.dom);
  return {
    dom: vdom$
  };
}

export default main;
