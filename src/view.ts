import xs, { Stream } from 'xstream';
import { div, header, h1, p, strong, a, main, span, footer, VNode} from '@cycle/dom';
import { State, Result } from './definitions';
import Scoreboard from './components/scoreboard';

interface IViewState {
  puzzle: number[];
  allowed: boolean;
  selected: number[];
  over: boolean;
  score: number;
  result: Result;
}

function renderCell(index: number, state: IViewState): VNode {
  const disabled = (!state.allowed || state.over) ? '.disabled' : '';
  var classes = disabled;
  if (state.over && state.result) {
    if (state.result.correct.indexOf(index) > -1)
      classes += '.correct';
    else if (state.result.wrong.indexOf(index) > -1)
      classes += '.wrong';
    else if (state.result.missed.indexOf(index) > -1)
      classes += '.missed';
  }
  else {
    if (!state.allowed && state.puzzle.indexOf(index) > -1)
      classes += '.highlighted';
    else if (state.allowed && state.selected.indexOf(index) > -1)
      classes += '.selected';
  }
  return div(classes + '.cell', { attrs: { 'data-index': index } }, [span(disabled)]);
}

const grid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

function states(state: State): Stream<IViewState> {
  const xs = Stream;
  const state$ =
    xs.combine(
      state.puzzle$,
      state.allowed$,
      state.selectedCells$,
      state.over$,
      state.score$,
      state.result$
    ).map(([puzzle, allowed, selected, over, score, result]) => {
      const viewState: IViewState = {
        puzzle,
        allowed,
        selected,
        over,
        score,
        result
      };
      return viewState;
    });
  return state$;
}

function view(state: State, newGameDom$: Stream<VNode>): Stream<VNode> {
  const state$ = states(state);
  const scoreBoard = Scoreboard({ score$: state.score$ });
  const scoreDom$ = scoreBoard.dom;
  const vdom$ = xs.combine(state$, scoreDom$, newGameDom$).map(([state, scoreDom, newGameDom]) => {
    const score = state.score.toString();
    return div('#root', [
      div('.container', [
        header([
          div('.title.bar', [
            h1(['Recall']),
            scoreDom
          ]),
          div('.info', [
            p([
              'Click on the ',
              strong(['nine tiles you see']),
              ' to win!']),
            newGameDom
          ])
        ]),
        main([
          div('.panel', [
            div('.grid', grid.map((x) => renderCell(x, state)))
          ])
        ]),
        footer([
          'Made with ',
          span('.heart', '❤'),
          ' using ',
          span('.cycle', 'Cycle.js'),
          ' by ',
          a('.author', { props: { href: 'https://github.com/artfuldev' } }, '@artfuldev'),
          div([
            a('.source', { props: { href: 'https://github.com/artfuldev/recall-cycle/tree/gh-pages/' } }, 'View Source')
          ])
        ])
      ])
    ]);
  });
  return vdom$;
}

export default view;
