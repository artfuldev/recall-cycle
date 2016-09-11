import { DOMSource } from '@cycle/dom/xstream-typings';
import xs, { Stream } from 'xstream';
import { VNode } from '@cycle/dom';
import { Result } from './../definitions';

interface GridSources {
  dom: DOMSource;
  puzzle$: Stream<number[]>;
  result$: Stream<Result>;
}

interface GridSinks {
  dom: Stream<VNode>;
  selected$: Stream<number[]>;
}

function GridComponent(sources: GridSources): GridSinks {
  const dom = xs.of(null);
  const selected$ = xs.of([]);
  return {
    dom,
    selected$
  };
}
