
import { div, h1, ul, li, a, p, span} from '@cycle/dom';

function view(state$) {
  const vtree$ = state$.map(state => {
    const grid = state.get('grid');
    const allowed = state.get('allowed');
    const puzzle = state.get('puzzle');
    const selected = state.get('selected');
    const score = state.get('score');
    const over = state.get('over');
    const result = state.get('result') || {};
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