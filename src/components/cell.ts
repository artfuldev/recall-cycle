import xs, { Stream } from 'xstream';
import { VNode, div, span } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/xstream-typings';
import isolate from '@cycle/isolate';

export enum CellState {
  Normal,
  Highlighted,
  Selected,
  Correct,
  Wrong,
  Missed
}

interface CellSources {
  state$: Stream<CellState>;
  enabled$: Stream<boolean>;
  dom: DOMSource;
}

interface CellSinks {
  dom: Stream<VNode>;
  click$: Stream<MouseEvent>;
}

function CellComponent(sources: CellSources): CellSinks {
  const click$ =
    sources.dom
      .select('.cell span')
      .events('click')
      .map(ev => ev as MouseEvent)
      .filter(ev => (event.target as HTMLElement).className.indexOf('disabled') === -1);
  const dom =
    xs.combine(sources.state$, sources.enabled$)
    .map(([state, enabled]) => {
      const disabledClass = enabled ? '' : '.disabled'; 
      const selector =
        disabledClass
          + '.' + CellState[state].toLowerCase()
          + '.cell';
      return div(selector, [span(disabledClass)]);
    });
  return {
    dom,
    click$
  };
}

const Cell = sources => isolate(CellComponent)(sources);
export default Cell;
