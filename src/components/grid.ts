import { DOMSource } from '@cycle/dom/xstream-typings';
import xs, { Stream } from 'xstream';
import { VNode, div } from '@cycle/dom';
import { Result } from './../definitions';
import Cell, { CellState } from './cell';
import { add, remove, has, reduce } from './../utils';
import delay from 'xstream/extra/delay';
import isolate from '@cycle/isolate';
import dropRepeats from 'xstream/extra/dropRepeats';

const distinctBooleans = dropRepeats<boolean>((prev, next) => prev === next);

interface GridSources {
  dom: DOMSource;
  puzzle: Stream<number[]>;
  result: Stream<Result>;
}

interface GridSinks {
  dom: Stream<VNode>;
  selection: Stream<number[]>;
}

function GridComponent(sources: GridSources): GridSinks {
  const puzzle$ = sources.puzzle;
  const result$ = sources.result.remember();
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
      puzzle$.map(() =>
        xs.of(true)
          .compose(delay<boolean>(3000))
          .startWith(false)
      ).flatten(),
      result$.mapTo(false)
    ).compose(distinctBooleans);
  const cells =
    grid.map((element, index) => {
      const dom = sources.dom;
      const state$ =
        puzzle$.map(puzzle =>
          enabled$
            .map(enabled =>
              xs.merge(
                selected$
                  .filter(() => enabled)
                  .map(selected =>
                    has(selected, index)
                      ? xs.of(CellState.Selected)
                      : xs.of(CellState.Normal)
                  ).flatten(),
                result$
                  .filter(Boolean)
                  .filter(() => !enabled)
                  .map(result => {
                    if (has(result.correct, index))
                      return CellState.Correct;
                    if (has(result.wrong, index))
                      return CellState.Wrong;
                    if (has(result.missed, index))
                      return CellState.Missed;
                    return CellState.Normal;
                  })
              )).flatten()
            .startWith(has(puzzle, index) ? CellState.Highlighted : CellState.Normal)
        ).flatten();
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
