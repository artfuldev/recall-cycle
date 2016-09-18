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

function view(state: State, newGameDom$: Stream<VNode>, gridDom$: Stream<VNode>): Stream<VNode> {
  const scoreBoard = Scoreboard({ score$: state.score$ });
  const scoreDom$ = scoreBoard.dom;
  const vdom$ =
    xs.combine(
      scoreDom$,
      newGameDom$,
      gridDom$
    ).map(([
      scoreDom,
      newGameDom,
      gridDom
    ]) => {
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
                ' to win!'
              ]),
              newGameDom
            ])
          ]),
          main([
            div('.panel', [gridDom])
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
