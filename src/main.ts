import intent from './intent';
import model from './model';
import view from './view';
import Button from './components/button';
import Grid from './components/grid';
import xs from 'xstream';
import { Sources, Sinks, State, Result } from './definitions';
import delay from 'xstream/extra/delay';

function main(sources: Sources): Sinks {
  const dom = sources.dom;
  const newGameButton =
    Button({
      selector: xs.of('.new'),
      content: xs.of('New Game'),
      dom
    });
  const proxySelect$ = xs.create<number[]>();
  const state = model(intent(newGameButton.click$, proxySelect$));
  const puzzle = state.puzzle$;
  const result = state.result$;
  const grid = Grid({
    dom,
    puzzle,
    result
  });
  proxySelect$.imitate(grid.selection);
  const dom$ = view(state, newGameButton.dom, grid.dom);
  return {
    dom: dom$
  };
}

export default main;
