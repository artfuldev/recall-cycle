import { DOMSource } from '@cycle/dom/xstream-typings';
import xs, { Stream } from 'xstream';
import { VNode, div } from '@cycle/dom';
import { Result } from './../definitions';
import Cell, { CellState } from './cell';
import { add, remove, has, reduce } from './../utils';
import delay from 'xstream/extra/delay';
import isolate from '@cycle/isolate';

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
  const grid: number[] = Array.apply(null, { length: 25 }).map(Number.call, Number);
  const nothing: number[] = [];
  const selectedProxy$ = xs.create<number[]>();
  const cells = grid.map(i => {
    const dom = sources.dom;
    const enabled$ =
      xs.merge(
        puzzle$
          .map(() =>
            xs.of(true)
              .compose(delay<boolean>(3000))
              .startWith(false)
          ).flatten(),
        result$
          .map(() => false)
      );
    const state$ =
      xs.merge(
        puzzle$
          .map(puzzle =>
            xs.of(CellState.Normal)
              .compose(delay<CellState>(3000))
              .startWith(has(puzzle, i) ? CellState.Highlighted : CellState.Normal)
          ).flatten(),
        result$
          .map(result => {
            if (has(result.correct, i))
              return CellState.Correct;
            if (has(result.wrong, i))
              return CellState.Wrong;
            if (has(result.missed, i))
              return CellState.Missed;
            return CellState.Normal;
          }),
        selectedProxy$
          .map(selected =>
            has(selected, i)
              ? CellState.Selected
              : CellState.Normal)
      );
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
  const cellDoms$: Stream<VNode[]> = xs.combine(...cells.map(cell => cell.dom));
  const dom =
    cellDoms$
      .map(doms => div('.grid', doms));
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

const Grid = (sources: GridSources) => isolate(GridComponent)(sources);

export default Grid;
