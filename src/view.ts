
import { Stream } from 'xstream';
import { div, h1, p, strong, a, span, VNode} from '@cycle/dom';
import { IState, ISinks } from './definitions';

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

const grid = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

function view(state$: Stream<IState>): ISinks {

  const vtree$ = state$.map(state => {
    const score = state.score.toString();
    return div('#root', [
      div('.container', [
        div('.title.bar', [
          h1(['Recall']),
          div('.scores', [
            div('.current.score', [span([score])]),
            div('.best.score', [span([score])])
          ])
        ]),
        div('.info', [
          p([
            'Click on the ',
            strong(['nine tiles you see']),
            ' to win!']),
          a('.new', 'New Game')
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