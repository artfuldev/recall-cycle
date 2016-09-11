import { Sources } from './definitions';
import { Stream } from 'xstream';

export interface Intent {
  newGame$: Stream<boolean>;
  selected$: Stream<number[]>;
}

function disabled(event: Event) {
  return (event.target as HTMLElement).className.indexOf('disabled') !== -1;
}

function intent(newGameClick$: Stream<MouseEvent>, selected$: Stream<number[]>): Intent {
  const newGame$ =
    newGameClick$
      .filter(ev => !disabled(ev))
      .map(ev => {
        ev.preventDefault();
        return true;
      })
      .startWith(true);
  return {
    newGame$,
    selected$
  };
}

export default intent;
