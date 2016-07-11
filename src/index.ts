import xs from 'xstream';
import delay from 'xstream/extra/delay';
import { run } from '@cycle/xstream-run';
import { makeDOMDriver } from '@cycle/dom';
import intent from './intent';
import model from './model';
import view, { Sinks } from './view';
import { Sources } from './definitions';

function main(sources: Sources): Sinks {
  return view(model(intent(sources)));
}

run(main, {
  dom: makeDOMDriver('#app')
});