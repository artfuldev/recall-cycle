import intent from './intent';
import model from './model';
import view from './view';
import Button from './components/button';
import Grid from './components/grid';
import xs from 'xstream';
import { Sources, Sinks, Result } from './definitions';

function main(sources: Sources): Sinks {
  const dom = sources.dom;
  const newGameButton =
    Button({
      selector$: xs.of('.new'),
      content$: xs.of('New Game'),
      dom
    });
  const puzzle$ = xs.create<number[]>().debug();
  const result$ = xs.create<Result>().debug();
  const grid = Grid({
    dom,
    puzzle$,
    result$
  });
  const state = model(intent(newGameButton.click$, grid.selected$));
  puzzle$.imitate(state.puzzle$);
  result$.imitate(state.result$);
  const vdom$ = view(state, newGameButton.dom, grid.dom);
  return {
    dom: vdom$
  };
}

export default main;
