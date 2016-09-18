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

function model(actions: Intent): State {
  const puzzle$ =
    actions.newGame$
      .map(() => puzzle())
      .startWith(puzzle());

  const result$ =
    puzzle$.map(puzzle =>
      actions.selected$
        .filter(selected => selected.length === 9)
        .map(selected => {
            const result: Result = {
              correct: selected.filter(s => puzzle.indexOf(s) !== -1),
              wrong: selected.filter(s => puzzle.indexOf(s) === -1),
              missed: puzzle.filter(p => selected.indexOf(p) === -1)
            };
            return result;
          })
      ).flatten();

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
    reduce(scoreReducer$, 0);

  return {
    puzzle$,
    score$,
    result$
  };
}

export default model;
