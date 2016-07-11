
import { Stream } from 'xstream';
import { div, h1, ul, li, a, p, span, VNode} from '@cycle/dom';
import { IState } from './definitions';

export interface ISinks {
  dom: Stream<VNode>
}

function renderCell(index: number, state: IState): VNode {
  var classes = '';
  if(state.over && state.result) {
    if(state.result.correct.indexOf(index) > -1)
      classes += '.correct';
    else if(state.result.wrong.indexOf(index) > -1)
      classes += '.wrong';
    else if(state.result.missed.indexOf(index) > -1)
      classes += '.missed';
  }
  else {
    if(!state.allowed && state.puzzle.indexOf(index) > -1)
      classes += '.highlighted';
    else if(state.allowed && state.selected.indexOf(index) > -1)
      classes += '.selected';
  }
  return div(classes + '.cell', { attrs: { 'data-index': index } }, [span()]);
}

function view(state$: Stream<IState>): ISinks {
  const vtree$ = state$.map(state => {
    const grid = state.grid;
    const score = state.score;
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
          div('.grid', grid.map((x) => renderCell(x, state)))
        ])
      ])
    ]);
  });
  return {
    dom: vtree$
  };
}

export default view;