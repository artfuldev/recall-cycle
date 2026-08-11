import xs, { Stream } from 'xstream';
import { VNode, div, span } from '@cycle/dom';

interface ScoreboardSources {
  score$: Stream<number>;
  bestScore$: Stream<number>;
}

interface ScoreboardSinks {
  dom: Stream<VNode>;
}

function ScoreBoardComponent(sources: ScoreboardSources): ScoreboardSinks {
  const dom =
    xs.combine(sources.score$, sources.bestScore$)
      .map(([score, bestScore]) => div('.scores', [
        div('.current.score', [span([score.toString()])]),
        div('.best.score', [span([bestScore.toString()])])
      ]));
  return {
    dom
  }
}

export default ScoreBoardComponent;

