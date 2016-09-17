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
  selection: Stream<number[]>;
}

function GridComponent(sources: GridSources): GridSinks {
  const puzzle$ = sources.puzzle$;
  const result$ = sources.result$.filter(Boolean);
  const grid: number[] = Array.apply(null, { length: 25 }).map(Number.call, Number);
  const nothing: number[] = [];
  const cellClickProxy$ = xs.create<number>();
  const selectedReducer$ =
    xs.merge(
      puzzle$.mapTo(() => nothing),
      result$.mapTo(() => nothing),
      cellClickProxy$.map(i =>
        (selected: number[]) =>
          has(selected, i)
            ? remove(selected, i)
            : add(selected, i))
    );
  const selected$ = reduce(selectedReducer$, nothing).filter(() => true);
  const enabled$ =
    xs.merge(
      puzzle$.mapTo(false),
      puzzle$.compose(delay<number[]>(3000)).mapTo(true),
      result$.mapTo(false)
    );
  const cells =
    grid.map((element, index) => {
      const dom = sources.dom;
      const state$ =
        xs.merge(
          puzzle$
            .map(puzzle =>
              xs.merge(
                xs.of(CellState.Normal)
                  .compose(delay<CellState>(3000)),
                xs.of(has(puzzle, index) ? CellState.Highlighted : CellState.Normal)
              )).flatten(),
          result$
            .map(result => {
              if (has(result.correct, index))
                return CellState.Correct;
              if (has(result.wrong, index))
                return CellState.Wrong;
              if (has(result.missed, index))
                return CellState.Missed;
              return CellState.Normal;
            }),
          selected$
            .map(selected =>
              has(selected, index)
                ? CellState.Selected
                : CellState.Normal)
        );
      const cell = Cell({
        dom,
        enabled: enabled$,
        state: state$
      });
      return cell;
    });
  const cellClick$ =
    xs.merge(
      ...cells.map((cell, i) =>
        cell.clicks.map(ev => i))
    );
  cellClickProxy$.imitate(cellClick$);
  const cellDoms$: Stream<VNode[]> = xs.combine(...cells.map(cell => cell.dom));
  const dom$ =
    cellDoms$
      .map(doms => div('.grid', doms));
  return {
    dom: dom$,
    selection: selected$
  };
}

const Grid = (sources: GridSources) => isolate(GridComponent)(sources);

export default Grid;
