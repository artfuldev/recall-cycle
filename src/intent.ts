import { ISources } from './definitions';
import { Stream } from 'xstream';
import { findChildIndex } from './utils';

export interface IIntent {
  newGame$: Stream<boolean>
  selectCell$: Stream<number>
}

function disabled(event: Event) {
  return (event.target as HTMLElement).className.indexOf('disabled') !== -1;
}

function intent(sources: ISources): IIntent {

  const dom = sources.dom;

  const newGame$ =
    dom
      .select('.new')
      .events('click')
      .filter(ev => !disabled(ev))
      .map(ev => {
        ev.preventDefault();
        return true;
      });

  const selectCell$ = dom
    .select('.cell span')
    .events('click')
    .filter(ev => !disabled(ev))
    .map(ev => {
      ev.preventDefault();
      return findChildIndex((ev.target as HTMLElement).parentElement);
    });

  return {
    newGame$,
    selectCell$,
  };
}

export default intent;
