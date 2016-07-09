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
    .select('.cell')
    .events('click')
    .map(ev => parseInt(
      (ev.target.tagName == 'SPAN'
        ? ev.target.parentElement
        : ev.target).attributes['data-index'].value));

  return {
    newGame$,
    reset$,
    selectCell$,
    any$: xs.merge(newGame$, reset$, selectCell$)
  };
}

function reducers(actions) {

  const newPuzzleReducer$ = actions.newGame$.map(state => {
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
    actions.newGame$.map(state => state.set('allowed', false)),
    actions.newGame$.compose(delay(4000)).map(state => state.set('allowed', true))
  );

  const selectedReducer$ = xs.merge(actions.selectCell$.map(state => {
    if (!state.get('allowed'))
      return state;
    state.selected.set(state.selected || Immutable.List());
    var index = state.selected.indexOf(clicked);
    if (index === -1)
      return state.set('selected', state.selected.push(clicked));
    else
      return state.set('selected', selected.filter(x => x != clicked));
  }),
    actions.reset$.map(state => state.set('selected', []))
  );

  return xs.merge(
    newPuzzleReducer$,
    allowedReducer$,
    selectedReducer$
  );
}

function model(actions) {
  var grid = Immutable.List();
  for (var i = 0; i < 25; i++)
    grid = grid.push(i);
  const reducer$ = reducers(actions);
  const state$ = actions.any$
    .mapTo(Immutable.Map(
      {
        grid,
        puzzle: Immutable.List(),
        allowed: false,
        selectedCells: Immutable.List()
      }
    ))
    .map(state => reducer$.fold((acc, reducer) => reducer(acc), state))
    .flatten();
  return state$;
}

function view(state$) {
  const vtree$ = state$.map(state =>
  {
    const grid = state.get('grid');
    const allowed = state.get('allowed');
    const puzzle = state.get('puzzle');
    const selected = state.get('selected');
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
          p(['Click on the nine tiles you see to win!'])
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