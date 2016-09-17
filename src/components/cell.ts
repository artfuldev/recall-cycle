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
  state: Stream<CellState>;
  enabled: Stream<boolean>;
  dom: DOMSource;
}

interface CellSinks {
  dom: Stream<VNode>;
  clicks: Stream<MouseEvent>;
}

function CellComponent(sources: CellSources): CellSinks {
  const enabled$ = sources.enabled;
  const state$ = sources.state;
  const click$ =
    enabled$
      .map(enabled =>
        sources.dom
          .select('.cell')
          .events('click')
          .filter(() => enabled)
          .map(ev => {
            ev.preventDefault();
            ev.stopPropagation();
            return ev as MouseEvent;
          })
      ).flatten();
  const dom$ =
    state$
      .map(state =>
        div('.cell', [
          span('.' + CellState[state].toLowerCase())
        ]));
  return {
    dom: dom$,
    clicks: click$
  };
}

const Cell = (sources: CellSources) => isolate(CellComponent)(sources);
export default Cell;
