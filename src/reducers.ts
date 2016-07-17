import Stream from 'xstream';
import delay from 'xstream/extra/delay';
import { IIntent } from './intent';
import { IResult, IState } from './definitions';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import dropRepeats from 'xstream/extra/dropRepeats';

function reduce<T>(reducer$: Stream<(prev: T) => T>, initial: T) {
  const value$ = reducer$.fold((current, reducer) => reducer(current), initial);
  return value$;
}

function reducers(actions: IIntent): IState {
  // alias
  const xs = Stream;

  const puzzle$ =
    actions.newGame$
      .map(() => {
        const puzzle: number[] = [];
        const maxSize = 9;
        for (var i = 0; i < maxSize; i++) {
          var nextNumber = Math.floor(Math.random() * 25);
          while (puzzle.indexOf(nextNumber) !== -1)
            nextNumber = Math.floor(Math.random() * 25);
          puzzle.push(nextNumber);
        }
        return puzzle;
      }).remember();

  const selectedCellsReducer$ =
    xs.merge(
      actions.newGame$
        .mapTo(() => new Array<number>()),
      actions.reset$
        .mapTo(() => new Array<number>()),
      actions.selectCell$
        .map(clicked =>
          (selectedCells: number[]) => {
            var selected = selectedCells.indexOf(clicked) !== -1;
            return selected
              ? selectedCells.filter(x => x != clicked)
              : selectedCells.concat(clicked);
          })
    );
  const selectedCells$ =
    reduce(selectedCellsReducer$, new Array<number>())
      .remember();

  const allowed$ =
    xs.merge(
      actions.newGame$
        .mapTo(false),
      actions.newGame$
        .compose(delay(4000))
        .mapTo(true)
    ).remember();

  const over$ =
    selectedCells$
      .map((selected) => selected.length === 9)
      .compose(dropRepeats<boolean>((prev, next) => prev === next));

  const result$ =
    xs.merge(
      actions.newGame$
        .mapTo(null),
      over$
        .filter(Boolean)
        .map(() =>
          puzzle$.map(puzzle =>
            selectedCells$.map(selected => {
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
    selectedCells$,
    over$,
    score$,
    result$
  };
}

export default reducers;
