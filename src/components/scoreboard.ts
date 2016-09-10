import { Stream } from 'xstream';
import { VNode, div, span } from '@cycle/dom';

interface ScoreboardSources {
  score$: Stream<number>;
}

interface ScoreboardSinks {
  dom: Stream<VNode>;
}

function ScoreBoardComponent(sources: ScoreboardSources): ScoreboardSinks {
  const dom =
    sources.score$
      .map(score => div('.scores', [
        div('.current.score', [span([score.toString()])]),
        div('.best.score', [span([score.toString()])])
      ]));
  return {
    dom
  }
}

export default ScoreBoardComponent;

