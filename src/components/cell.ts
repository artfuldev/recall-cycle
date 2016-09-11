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
    sources.enabled$.map(enabled =>
      sources.dom
        .select('.cell span')
        .events('click')
        .filter(() => enabled)
        .map(ev => ev as MouseEvent)
    ).flatten();
  const dom =
    sources.state$
      .map(state => {
        const selector = '.' + CellState[state].toLowerCase() + '.cell';
        return div(selector, [span()]);
      });
  return {
    dom,
    click$
  };
}

const Cell = (sources: CellSources) => isolate(CellComponent)(sources);
export default Cell;
