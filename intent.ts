import { DOMSource } from '@cycle/dom/xstream-typings';

interface Sources {
    dom: DOMSource
}

function intent(sources: Sources) {

  const dom = sources.dom;

  const newGame$ = dom
    .select('.new')
    .events('click')
    .map(ev => {
      ev.preventDefault();
      return true;
    })
    .startWith(true);

  const reset$ = dom
    .select('.reset')
    .events('click')
    .map(ev => {
      ev.preventDefault();
      return true;
    });

  const selectCell$ = dom
    .select('.cell span')
    .events('click')
    .map(ev => {
      ev.preventDefault();
      return parseInt((ev.target as HTMLElement).parentElement.attributes['data-index'].value);
    });

  return {
    newGame$,
    reset$,
    selectCell$
  };
}

export default intent;