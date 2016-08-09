import { ISources } from './definitions';
import { Stream } from 'xstream';

export interface IIntent {
  newGame$: Stream<boolean>
  reset$: Stream<boolean>
  selectCell$: Stream<number>,
  selectedCells$: Stream<number[]>
}

function disabled(event: Event) {
  return (event.target as HTMLElement).className.indexOf('disabled') !== -1;
}

function findChildIndex(element: HTMLElement): number {
  const childNodes = element.parentElement.childNodes;
  for (var i = 0; i < childNodes.length; i++)
    if (childNodes[i] === element)
      return i;
  return -1;
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

  const reset$ =
    dom
      .select('.reset')
      .events('click')
      .filter(ev => !disabled(ev))
      .map(ev => {
        ev.preventDefault();
        return true;
      });

  const selectedCells$ =
    dom
      .select('main .grid')
      .events('DOMSubtreeModified')
      .map(ev => {
        const grid = ev.target as HTMLElement;
        return [].slice.call(grid.querySelectorAll('.selected.cell')).map(el => findChildIndex(el)) as number[];
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
    reset$,
    selectCell$,
    selectedCells$
  };
}

export default intent;
