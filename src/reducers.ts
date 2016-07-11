import Stream from 'xstream';
import delay from 'xstream/extra/delay';
import { Intent } from './intent';

function reducers(actions: Intent): Stream<(state: any) => any> {
  // alias
  const xs = Stream;

  const puzzleReducer$ =
    actions.newGame$
      .mapTo(state => {
        const puzzle = [];
        const maxSize = 9;
        for (var i = 0; i < maxSize; i++) {
          var nextNumber = Math.floor(Math.random() * 25);
          while (puzzle.indexOf(nextNumber) !== -1)
            nextNumber = Math.floor(Math.random() * 25);
          puzzle.push(nextNumber);
        }
        return state.set('puzzle', puzzle);
      });

  const allowedReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('allowed', false)),
    actions.newGame$
      .compose(delay(4000))
      .mapTo(state => state.set('allowed', true)),
    actions.selectCell$
      .mapTo(state => {
        const selected = state.get('selected') || [];
        return selected.length === 9
          ? state.set('allowed', false)
          : state;
      })
  );

  const selectedReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('selected', [])),
    actions.reset$
      .mapTo(state => {
        const allowed = state.get('allowed');
        return allowed
          ? state.set('selected', [])
          : state;
      }),
    actions.selectCell$
      .map(clicked =>
        state => {
          const allowed = state.get('allowed');
          if (!allowed)
            return state;
          var selected = state.get('selected') || [];
          var index = selected.indexOf(clicked);
          if (index === -1)
            return state.set('selected', selected.concat(clicked));
          else
            return state.set('selected', selected.filter(x => x != clicked));
        })
  );

  const scoreReducer$ =
    actions.selectCell$
      .mapTo(state => {
        const over = state.get('over');
        if (over)
          return state;
        const selected = state.get('selected') || [];
        if (selected.length !== 9)
          return state;
        const puzzle = state.get('puzzle') || [];
        const won = selected.every(s => puzzle.indexOf(s) !== -1);
        const score = state.get('score') || 0;
        return won
          ? state.set('score', score + 1)
          : state;
      });

  const overReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('over', false)),
    actions.selectCell$
      .mapTo(state => {
        const selected = state.get('selected') || [];
        return selected.length === 9
          ? state.set('over', true)
          : state;
      })
  );

  const resultReducer$ = xs.merge(
    actions.newGame$
      .mapTo(state => state.set('result', null)),
    actions.selectCell$
      .mapTo(state => {
        const selected = state.get('selected') || [];
        const puzzle = state.get('puzzle') || [];
        const result = {
          correct: selected.filter(s => puzzle.indexOf(s) !== -1),
          wrong: selected.filter(s => puzzle.indexOf(s) === -1),
          missed: puzzle.filter(p => selected.indexOf(p) === -1)
        };
        return state.set('result', result);
      })
  );

  return xs.merge(
    puzzleReducer$,
    allowedReducer$,
    selectedReducer$,
    scoreReducer$,
    overReducer$,
    resultReducer$
  );
}

export default reducers;