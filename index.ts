import xs from 'xstream';
import delay from 'xstream/extra/delay';
import { run } from '@cycle/xstream-run';
import { div, h1, ul, li, a, p, span, makeDOMDriver } from '@cycle/dom';
import { Map } from 'immutable';
import intent from './intent';

function reducers(actions) {

  const puzzleReducer$ =
    actions.newGame$
      .mapTo(state => {
        const puzzle = [];
        const maxSize = 9;
        for (var i = 0; i < maxSize; i++) {
          var nextNumber = Math.floor(Math.random() * 25);
          while (puzzle.indexOf(nextNumber) !== -1)
            nextNumber = Math.floor(Math.random() * 25);
          puzzle.push(nextNumber);
        }
        return state.set('puzzle', puzzle);
      });

  const allowedReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('allowed', false)),
    actions.newGame$
      .compose(delay(4000))
      .mapTo(state => state.set('allowed', true)),
    actions.selectCell$
      .mapTo(state => {
        const selected = state.get('selected') || [];
        return selected.length === 9
          ? state.set('allowed', false)
          : state;
      })
  );

  const selectedReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('selected', [])),
    actions.reset$
      .mapTo(state => {
        const allowed = state.get('allowed');
        return allowed
          ? state.set('selected', [])
          : state;
      }),
    actions.selectCell$
      .map(clicked =>
        state => {
          const allowed = state.get('allowed');
          if (!allowed)
            return state;
          var selected = state.get('selected') || [];
          var index = selected.indexOf(clicked);
          if (index === -1)
            return state.set('selected', selected.concat(clicked));
          else
            return state.set('selected', selected.filter(x => x != clicked));
        })
  );

  const scoreReducer$ =
    actions.selectCell$
      .mapTo(state => {
        const over = state.get('over');
        if (over)
          return state;
        const selected = state.get('selected') || [];
        if (selected.length !== 9)
          return state;
        const puzzle = state.get('puzzle') || [];
        const won = selected.every(s => puzzle.indexOf(s) !== -1);
        const score = state.get('score') || 0;
        return won
          ? state.set('score', score + 1)
          : state;
      });

  const overReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('over', false)),
    actions.selectCell$
      .mapTo(state => {
        const selected = state.get('selected') || [];
        return selected.length === 9
          ? state.set('over', true)
          : state;
      })
  );

  const resultReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('result', null)),
    actions.selectCell$
      .mapTo(state => {
        const selected = state.get('selected') || [];
        const puzzle = state.get('puzzle') || [];
        const result = {
          correct: selected.filter(s => puzzle.indexOf(s) !== -1),
          wrong: selected.filter(s => puzzle.indexOf(s) === -1),
          missed: puzzle.filter(p => selected.indexOf(p) === -1)
        };
        return state.set('result', result);
      })
  );

  return xs.merge(
    puzzleReducer$,
    allowedReducer$,
    selectedReducer$,
    scoreReducer$,
    overReducer$,
    resultReducer$
  );
}

function model(actions) {
  var grid = [];
  for (var i = 0; i < 25; i++)
    grid.push(i);
  const reducer$ = reducers(actions);
  const initialState = Map(
    {
      grid,
      puzzle: [],
      allowed: false,
      selected: [],
      over: false,
      score: 0,
      result: null
    }
  );
  const state$ = reducer$.fold((next, reducer) => reducer(next), initialState);
  return state$;
}

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

function main(sources) {
  return view(model(intent(sources)));
}

const drivers = {
  dom: makeDOMDriver('#app')
};

run(main, drivers);