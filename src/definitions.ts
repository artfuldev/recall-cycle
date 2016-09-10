import { DOMSource } from '@cycle/dom/xstream-typings';
import { VNode } from '@cycle/dom';
import { Stream } from 'xstream'; 

export interface Sources {
    dom: DOMSource;
}

export interface Sinks {
  dom: Stream<VNode>;
}

export interface Result {
    correct: Array<number>;
    wrong: Array<number>;
    missed: Array<number>;
}

export interface State {
    puzzle$: Stream<Array<number>>;
    allowed$: Stream<boolean>;
    selectedCells$: Stream<Array<number>>;
    over$: Stream<boolean>;
    score$: Stream<number>;
    result$: Stream<Result>;
}
