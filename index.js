import "babel-polyfill";
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, h1, ul, li, span, makeDOMDriver } from '@cycle/dom';

function main({ dom }) {
  const grid = [];
  const puzzle$ = xs.periodic(200)
    .map(x => {
      const puzzle = [];
      const maxSize = 9;
      for (var i = 0; i < maxSize; i++) {
        var nextNumber = Math.floor(Math.random() * 25);
        while (puzzle.indexOf(nextNumber) !== -1)
          nextNumber = Math.floor(Math.random() * 25);
        puzzle.push(nextNumber);
      }
      return puzzle;
    });
  for (var i = 0; i < 25; i++)
    grid.push(i);
  const vtree$ = puzzle$.map(puzzle =>
    div('#root', [
      div('.container', [
        div('.title.bar', [
          h1(['Recall']),
          ul('.actions', [
            li('.new', 'New'),
            li('.reset', 'Reset'),
            // li('.undo', 'Undo')
          ])
        ]),
        div('.grid', grid.map((x) =>
          div('.cell' + (puzzle.indexOf(x) !== -1 ? '.highlighted' : ''), [
            span()
          ])
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