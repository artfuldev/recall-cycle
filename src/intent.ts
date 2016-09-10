import { Sources } from './definitions';
import { Stream } from 'xstream';

export interface Intent {
  newGame$: Stream<boolean>;
  selectCell$: Stream<number>;
}

function disabled(event: Event) {
  return (event.target as HTMLElement).className.indexOf('disabled') !== -1;
}

function intent(sources: Sources, newGameClick$: Stream<MouseEvent>): Intent {

  const dom = sources.dom;

  const newGame$ =
    newGameClick$
      .filter(ev => !disabled(ev))
      .map(ev => {
        ev.preventDefault();
        return true;
      })
      .startWith(true);

  const selectCell$ = dom
    .select('.cell span')
    .events('click')
    .filter(ev => !disabled(ev))
    .map(ev => {
      ev.preventDefault();
      return parseInt(
        (ev.target as HTMLElement)
          .parentElement
          .attributes['data-index']
          .value);
    });

  return {
    newGame$,
    selectCell$
  };
}

export default intent;
