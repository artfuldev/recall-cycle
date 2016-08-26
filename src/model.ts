import { IIntent } from './intent';
import { Stream } from 'xstream';
import { IState, IResult, ISources } from './definitions';
import delay from 'xstream/extra/delay';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import dropRepeats from 'xstream/extra/dropRepeats';
import { add, remove, has, findChildIndex } from './utils';

function reduce<T>(reducer$: Stream<(prev: T) => T>, initial: T) {
  const value$ = reducer$.fold((current, reducer) => reducer(current), initial);
  return value$;
}

const distinctBooleans = dropRepeats<boolean>((prev, next) => prev === next);

function puzzle(): number[] {
  const puzzle: number[] = [];
  const maxSize = 9;
  for (var i = 0; i < maxSize; i++) {
    var nextNumber = Math.floor(Math.random() * 25);
    while (puzzle.indexOf(nextNumber) !== -1)
      nextNumber = Math.floor(Math.random() * 25);
    puzzle.push(nextNumber);
  }
  return puzzle;
}

function model(sources: ISources, intent: IIntent): IState {
  const xs = Stream;
  const dom = sources.dom;

  const domScore$ =
    dom
      .select('.current.score span')
      .events('score_updated')
      .map(ev => {
        return parseInt((ev.target as HTMLElement).innerText);
      });

  const puzzle$ =
    intent.newGame$
      .map(() => puzzle())
      .startWith(puzzle());

  const allowed$ =
    puzzle$.map(() =>
      xs.of(true)
        .compose(delay<boolean>(3000))
        .startWith(false))
      .flatten()
      .remember();

  const domSelected$ =
    allowed$
      .map(allowed =>
        dom
          .select('main .grid')
          .events('DOMSubtreeModified')
          .filter(() => allowed)
          .map(ev => {
            const grid = ev.target as HTMLElement;
            return [].slice.call(grid.querySelectorAll('.selected.cell')).map(el => findChildIndex(el)) as number[];
          })
          .startWith([]))
      .flatten();

  const selected$ =
    xs.merge(
      puzzle$
        .mapTo<number[]>([]),
      domSelected$
        .map<Stream<number[]>>(selected =>
          intent.selectCell$
            .map(clicked =>
              has(selected, clicked)
                ? remove(selected, clicked)
                : add(selected, clicked)
            ))
        .flatten()
    ).startWith([]);

  const over$ =
    selected$
      .map(selected => selected.length === 9)
      .compose(distinctBooleans)
      .startWith(false);

  const result$ =
    xs.merge(
      puzzle$
        .mapTo(null),
      over$
        .filter(Boolean)
        .map(() =>
          puzzle$.map(puzzle =>
            selected$.map(selected => {
              const result: IResult = {
                correct: selected.filter(s => puzzle.indexOf(s) !== -1),
                wrong: selected.filter(s => puzzle.indexOf(s) === -1),
                missed: puzzle.filter(p => selected.indexOf(p) === -1)
              };
              return result;
            })
          ).flatten()
        ).flatten()
    ).startWith(null);

  const score$ =
    domScore$
      .startWith(0)
      .map(score =>
        result$
          .map(result => {
            const won = result && result.correct && result.correct.length === 9;
            return won ? score + 1 : score;
          }))
      .flatten();

  return {
    puzzle$,
    allowed$,
    selected$,
    over$,
    result$,
    score$
  };
}

export default model;
