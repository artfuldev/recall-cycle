import { DOMSource } from '@cycle/dom/xstream-typings';
import xs, { Stream } from 'xstream';
import { VNode } from '@cycle/dom';
import { Result } from './../definitions';
import Cell from './cell';
import { add, remove, has, reduce } from './../utils';

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
  const puzzle$ = sources.puzzle$;
  const result$ = sources.result$.filter(Boolean);
  const grid = Array.apply(null, { length: 25 }).map(Number.call, Number) as number[];
  const nothing: number[] = [];
  const selectedProxy$ = xs.create<number[]>();
  const cells = grid.map(i => {
    const dom = sources.dom;
    const enabled$ = xs.never();
    const state$ = xs.never();
    const cell = Cell({
      dom,
      enabled$,
      state$
    });
    return cell;
  });
  const cellClick$ =
    xs.merge(
      ...cells.map((cell, i) =>
        cell.click$.map(ev => i))
    );
  const dom = xs.of(null);
  const selectedReducer$ =
    xs.merge(
      puzzle$.mapTo(() => nothing),
      result$.mapTo(() => nothing),
      cellClick$.map(i =>
        (selected: number[]) =>
          has(selected, i)
            ? remove(selected, i)
            : add(selected, i))
    );
  const selected$ = reduce(selectedReducer$, nothing);
  selectedProxy$.imitate(selected$);
  return {
    dom,
    selected$
  };
}
