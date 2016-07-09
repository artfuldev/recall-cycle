import "babel-polyfill";
import xs from 'xstream';;
import delay from 'xstream/extra/delay';
import { run } from '@cycle/xstream-run';
import { div, h1, ul, li, a, p, span, makeDOMDriver } from '@cycle/dom';

function main({ dom }) {
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
  const cellClicks$ = dom
    .select('.cell')
    .events('click')
    .map(ev => parseInt(
      (ev.target.tagName == 'SPAN'
        ? ev.target.parentElement
        : ev.target).attributes['data-index'].value));
  const grid = [];
  for (var i = 0; i < 25; i++)
    grid.push(i);
  const puzzle$ = newGame$.map(() => {
    const puzzle = [];
    const maxSize = 9;
    for (var i = 0; i < maxSize; i++) {
      var nextNumber = Math.floor(Math.random() * 25);
      while (puzzle.indexOf(nextNumber) !== -1)
        nextNumber = Math.floor(Math.random() * 25);
      puzzle.push(nextNumber);
    }
    return puzzle;
  }).startWith([]);
  const userInputAllowed$ = xs.merge(newGame$.mapTo(false), newGame$.compose(delay(4000)).mapTo(true)).startWith(false);
  const userSelectedCells$ = xs.merge(userInputAllowed$.map(allowed => cellClicks$.filter(() => allowed)).flatten()
    .fold((selectedCells, clicked) => {
      selectedCells = selectedCells || [];
      var index = selectedCells.indexOf(clicked);
      if (index === -1)
        selectedCells.push(clicked);
      else
        selectedCells.splice(index, 1);
      return selectedCells;
    }, []), reset$.mapTo([]));
  const state$ = xs.combine(puzzle$, userInputAllowed$, userSelectedCells$).map(a => {
    return {
      puzzle: a[0],
      userInputAllowed: a[1],
      userSelectedCells: a[2]
    };
  });
  const vtree$ = state$.map(state =>
    div('#root', [
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
              + ((!state.userInputAllowed && state.puzzle.indexOf(x) !== -1) ? '.highlighted' : '')
              + ((state.userInputAllowed && state.userSelectedCells.indexOf(x) !== -1) ? '.selected' : ''), {
                attrs: { 'data-index': x }
              }, [span()])
          ))
        ])
      ])
    ]));
  const sinks = {
    dom: vtree$
  };
  return sinks;
}

const drivers = {
  dom: makeDOMDriver('#app')
};

run(main, drivers);