import "babel-polyfill";
import xs from 'xstream';;
import delay from 'xstream/extra/delay';
import { run } from '@cycle/xstream-run';
import { div, h1, ul, li, a, p, span, makeDOMDriver } from '@cycle/dom';
import Immutable from 'immutable';

function intent({ dom }) {

  const newGame$ = dom
    .select('.new')
    .events('click')
    .map(ev => {
      ev.preventDefault();
      return true;
    })
    .startWith(true);

  const reset$ = dom
    .select('.reset')
    .events('click')
    .map(ev => {
      ev.preventDefault();
      return true;
    });

  const selectCell$ = dom
    .select('.cell span')
    .events('click')
    .map(ev => {
      ev.preventDefault();
      return parseInt(ev.target.parentElement.attributes['data-index'].value);
    });

  return {
    newGame$,
    reset$,
    selectCell$
  };
}

function reducers(actions) {

  const puzzleReducer$ = actions.newGame$.map(x =>
    state => {
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
    actions.newGame$.map(x => state => state.set('allowed', false)),
    actions.newGame$.compose(delay(4000)).map(x => state => state.set('allowed', true))
  );

  const selectedReducer$ = xs.merge(actions.selectCell$.map(clicked =>
    state => {
      const allowed = state.get('allowed');
      if (!allowed)
        return state;
      const selected = state.get('selected');
      state.set('selected', selected || []);
      var index = selected.indexOf(clicked);
      if (index === -1)
        return state.set('selected', selected.concat(clicked));
      else
        return state.set('selected', selected.filter(x => x != clicked));
    }),
    actions.reset$.map(x => state => state.set('selected', [])),
    actions.newGame$.map(x => state => state.set('selected', []))
  );

  const gameOverReducer$ = actions.selectCell$.map(() =>
  state => {
    const selected = state.get('selected');
    if(selected.length < 9)
      return state;
    const puzzle = state.get('puzzle');
    const won = selected.every(s => puzzle.indexOf(s) !== -1);
    var score = state.get('score');
    const result = {
      correct: selected.filter(s => puzzle.indexOf(s) !== -1),
      wrong: selected.filter(s => puzzle.indexOf(s) === -1),
      missed: puzzle.filter(p => selected.indexOf(p) === -1)
    };
    if(won)
      score += 1;
    return state
      .set('selected', [])
      .set('allowed', false)
      .set('over', won ? 'won': 'lost')
      .set('score', score)
      .set('result', result);
  });

  return xs.merge(
    puzzleReducer$,
    allowedReducer$,
    selectedReducer$,
    gameOverReducer$
  );
}

function model(actions) {
  var grid = [];
  for (var i = 0; i < 25; i++)
    grid.push(i);
  const reducer$ = reducers(actions);
  const initialState = Immutable.Map(
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
              + ((!allowed && puzzle.indexOf(x) !== -1) ? '.highlighted' : '')
              + ((allowed && selected.indexOf(x) !== -1) ? '.selected' : ''), {
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