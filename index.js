import "babel-polyfill";
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, h1, ul, li, span, makeDOMDriver } from '@cycle/dom';

function main({ dom }) {
  const grid = [];
  for(var i=0; i<25; i++)
    grid.push(i);
  const vtree$ = xs.of(
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
        div('.grid', [
          div('.panel', grid.map(x =>
            div('.cell', [
              span()
            ])
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