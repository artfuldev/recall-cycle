import main from './main';
import { run } from '@cycle/xstream-run';
import { makeDOMDriver } from '@cycle/dom';

run(main, {
  dom: makeDOMDriver('#app')
});