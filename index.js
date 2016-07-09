import "babel-polyfill";
import xs from 'xstream';;
import delay from 'xstream/extra/delay';
import { run } from '@cycle/xstream-run';
import { div, h1, ul, li, a, p, span, makeDOMDriver } from '@cycle/dom';

function main({ dom }) {
  const newGame$ = dom.select('.new').events('click')
    .map(x => true).startWith(true);
  const cellClicks$ = dom.select('.cell').events('click')
    .map(ev => parseInt(
      (ev.target.tagName == 'SPAN'
        ? ev.target.parentElement
        : ev.target).attributes['data-index'].value));
  const grid = [];
  for (var i = 0; i < 25; i++)
    grid.push(i);
  const puzzle$ = newGame$.map(x => {
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
  const userInputAllowed$ = newGame$.compose(delay(4000)).map(x => true).startWith(false);
  const userSelectedCells$ = xs.combine(userInputAllowed$, cellClicks$).map(a => {
    return {
      userInputAllowed: a[0],
      clicked: a[1]
    };
  }).filter(x => x.userInputAllowed)
    .map(x => x.clicked)
    .fold((selectedCells, clicked) => {
      selectedCells = selectedCells || [];
      var index = selectedCells.indexOf(clicked);
      if (index === -1)
        selectedCells.push(clicked);
      else
        selectedCells.splice(index, 1);
      return selectedCells;
    }, []);
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
        div('.grid', grid.map((x) =>
          div('.cell'
            + ((!state.userInputAllowed && state.puzzle.indexOf(x) !== -1) ? '.highlighted' : '')
            + ((state.userInputAllowed && state.userSelectedCells.indexOf(x) !== -1) ? '.selected' : ''), {
              attrs: { 'data-index': x }
            }, [span()])
        ))
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