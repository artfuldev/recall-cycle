
import { Stream } from 'xstream';
import { div, h1, ul, li, a, p, span, VNode} from '@cycle/dom';
import { IState } from './definitions';

export interface Sinks {
  dom: Stream<VNode>
}

function view(state$: Stream<IState>): Sinks {
  const vtree$ = state$.map(state => {
    const grid = state.grid;
    const allowed = state.allowed;
    const puzzle = state.puzzle;
    const selected = state.selected;
    const score = state.score;
    const over = state.over;
    const result = state.result;
    const correct = result.correct;
    const wrong = result.wrong;
    const missed = result.missed;
    return div('#root', [
      div('.container', [
        div('.title.bar', [
          h1(['Recall']),
          ul('.actions', [
            li([a('.new', 'New')]),
            li([a('.reset', 'Reset')]),
            // li('.undo', 'Undo')
          ])
        ]),
        div('.before.grid', [
          p(['Click on the nine tiles you see to win! Score: ' + score])
        ]),
        div('.panel', [
          div('.grid', grid.map((x) =>
            div('.cell'
              + ((!allowed && !over && puzzle.indexOf(x) !== -1) ? '.highlighted' : '')
              + ((allowed && !over && selected.indexOf(x) !== -1) ? '.selected' : '')
              + ((over && correct.indexOf(x) !== -1) ? '.correct' : '')
              + ((over && wrong.indexOf(x) !== -1) ? '.wrong' : '')
              + ((over && missed.indexOf(x) !== -1) ? '.missed' : ''), {
                attrs: { 'data-index': x }
              }, [span()])
          ))
        ])
      ])
    ]);
  });
  return {
    dom: vtree$
  };
}

export default view;