import Stream from 'xstream';
import delay from 'xstream/extra/delay';
import { IIntent } from './intent';
import { IResult, IState } from './definitions';
import { Record } from 'immutable';

const ResultRecord = Record({
  correct: [],
  wrong: [],
  missed: []
});

class Result extends ResultRecord implements IResult {
  correct: Array<number>
  wrong: Array<number>
  missed: Array<number>

  constructor(props: IResult) {
    super(props);
  }
};

const InitialResult = new Result({
  correct: [],
  wrong: [],
  missed: []
});

const StateRecord = Record({
  puzzle: [],
  allowed: false,
  selected: [],
  over: false,
  score: 0,
  result: null
});

class State extends StateRecord implements IState {
  puzzle: Array<number>
  allowed: boolean
  selected: Array<number>
  over: boolean
  score: number
  result: IResult

  constructor(props: IState) {
    super(props);
  }
}

export const InitialState = new State({
  puzzle: [],
  allowed: false,
  selected: [],
  over: false,
  score: 0,
  result: InitialResult
}) as IState;

function reducers(actions: IIntent): Stream<(state: IState) => IState> {
  // alias
  const xs = Stream;

  const puzzleReducer$ =
    actions.newGame$
      .mapTo((state: IState) => {
        const puzzle = [];
        const maxSize = 9;
        for (var i = 0; i < maxSize; i++) {
          var nextNumber = Math.floor(Math.random() * 25);
          while (puzzle.indexOf(nextNumber) !== -1)
            nextNumber = Math.floor(Math.random() * 25);
          puzzle.push(nextNumber);
        }
        return (state as State).set('puzzle', puzzle) as State;
      });

  const allowedReducer$ = xs.merge(
    actions.newGame$
      .mapTo((state: IState) => (state as State).set('allowed', false) as State),
    actions.newGame$
      .compose(delay(4000))
      .mapTo((state: IState) => (state as State).set('allowed', true) as State),
    actions.selectCell$
      .mapTo((state: IState) => {
        const selected = state.selected || [];
        return selected.length === 9
          ? (state as State).set('allowed', false) as State
          : state;
      })
  );

  const selectedReducer$ = xs.merge(
    actions.newGame$
      .mapTo((state: IState) => (state as State).set('selected', []) as State),
    actions.reset$
      .mapTo((state: IState) => {
        const allowed = state.allowed;
        return allowed
          ? (state as State).set('selected', []) as State
          : state;
      }),
    actions.selectCell$
      .map(clicked =>
        (state: IState) => {
          const allowed = state.allowed;
          if (!allowed)
            return state;
          var selected = state.selected || [];
          var index = selected.indexOf(clicked);
          if (index === -1)
            return (state as State).set('selected', selected.concat(clicked)) as State;
          else
            return (state as State).set('selected', selected.filter(x => x != clicked)) as State;
        })
  );

  const scoreReducer$ =
    actions.selectCell$
      .mapTo((state: State) => {
        const over = state.over;
        if (over)
          return state;
        const selected = state.selected || [];
        if (selected.length !== 9)
          return state;
        const puzzle = state.puzzle || [];
        const won = selected.every(s => puzzle.indexOf(s) !== -1);
        const score = state.score || 0;
        return won
          ? state.set('score', score + 1) as State
          : state;
      });

  const overReducer$ = xs.merge(
    actions.newGame$
      .mapTo((state: IState) => (state as State).set('over', false) as State),
    actions.selectCell$
      .mapTo((state: IState) => {
        const selected = state.selected || [];
        return selected.length === 9
          ? (state as State).set('over', true) as State
          : state;
      })
  );

  const resultReducer$ = xs.merge(
    actions.newGame$
      .mapTo((state: IState) => (state as State).set('result', InitialResult) as State),
    actions.selectCell$
      .mapTo((state: IState) => {
        const selected = state.selected || [];
        const puzzle = state.puzzle || [];
        const result = new Result({
          correct: selected.filter(s => puzzle.indexOf(s) !== -1),
          wrong: selected.filter(s => puzzle.indexOf(s) === -1),
          missed: puzzle.filter(p => selected.indexOf(p) === -1)
        });
        return (state as State).set('result', result) as State;
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