import xs from 'xstream';
import delay from 'xstream/extra/delay';
import { run } from '@cycle/xstream-run';
import { makeDOMDriver } from '@cycle/dom';
import intent from './intent';
import model from './model';
import view from './view';
import { Sources } from './definitions';

function main(sources: Sources) {
  return view(model(intent(sources)));
}

const drivers = {
  dom: makeDOMDriver('#app')
};

run(main, drivers);