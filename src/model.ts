import { Intent } from './intent';
import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import { Result, State } from './definitions';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import dropRepeats from 'xstream/extra/dropRepeats';
import { add, remove, has, reduce } from './utils';

const distinctBooleans = dropRepeats<boolean>((prev, next) => prev === next);

const puzzle = () => {
  const puzzle: number[] = [];
  const maxSize = 9;
  for (var i = 0; i < maxSize; i++) {
    var nextNumber = Math.floor(Math.random() * 25);
    while (puzzle.indexOf(nextNumber) !== -1)
      nextNumber = Math.floor(Math.random() * 25);
    puzzle.push(nextNumber);
  }
  return puzzle;
};

function reducers(actions: Intent): State {
  const puzzle$ =
    actions.newGame$
      .map(() => puzzle())
      .startWith(puzzle());

  const selectedCellsReducer$ =
    xs.merge(
      puzzle$
        .mapTo(() => new Array<number>()),
      actions.selectCell$
        .map(clicked =>
          (selected: number[]) =>
            has(selected, clicked)
              ? remove(selected, clicked)
              : add(selected, clicked))
    );
  const selectedCells$ =
    reduce(selectedCellsReducer$, new Array<number>())
      .remember();

  const allowed$ =
    puzzle$.map(() =>
      xs.of(true)
        .compose(delay<boolean>(3000))
        .startWith(false))
      .flatten()
      .remember();

  const over$ =
    selectedCells$
      .map((selected) => selected.length === 9)
      .compose(distinctBooleans);

  const result$ =
    xs.merge(
      puzzle$
        .mapTo(null),
      over$
        .filter(Boolean)
        .map(() =>
          puzzle$.map(puzzle =>
            selectedCells$.map(selected => {
              const result: Result = {
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
    selectedCells$,
    over$,
    score$,
    result$
  };
}

function model(actions: Intent): State {
  const state = reducers(actions);
  return state;
}

export default model;
