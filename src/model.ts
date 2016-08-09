import { IIntent } from './intent';
import { Stream } from 'xstream';
import { IState, IResult } from './definitions';
import delay from 'xstream/extra/delay';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import dropRepeats from 'xstream/extra/dropRepeats';
import { add, remove, has } from './utils';

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

function model(intent: IIntent): IState {
  // alias
  const xs = Stream;

  const puzzle$ =
    intent.newGame$
      .map(() => puzzle())
      .startWith(puzzle());

  const selected$ =
    xs.merge(
      puzzle$
        .mapTo<number[]>([]),
      intent.reset$
        .mapTo<number[]>([]),
      intent.selectedCells$
        .map<Stream<number[]>>(selected =>
          intent.selectCell$
            .map(clicked =>
              has(selected, clicked)
                ? remove(selected, clicked)
                : add(selected, clicked)
            ))
        .flatten()
    ).startWith([]);

  const allowed$ =
    puzzle$.map(() =>
      xs.of(true)
        .compose(delay<boolean>(3000))
        .startWith(false))
      .flatten()
      .remember();

  const over$ =
    selected$
      .map(selected => selected.length === 9)
      .compose(distinctBooleans);

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

  const scoreReducer$ =
    result$
      .filter(Boolean)
      .map(result =>
        (score: number) => {
          const won = result.correct.length === 9;
          score = score || 0;
          return won ? score + 1 : score;
        });
  const score$ =
    reduce(scoreReducer$, 0)
      .remember();

  return {
    puzzle$,
    allowed$,
    selected$,
    over$,
    score$,
    result$
  };
}

export default model;
