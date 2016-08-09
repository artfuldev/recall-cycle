import { DOMSource } from '@cycle/dom/xstream-typings';
import { VNode } from '@cycle/dom';
import { Stream } from 'xstream'; 

export interface ISources {
    dom: DOMSource;
}

export interface ISinks {
  dom: Stream<VNode>;
}

export interface IResult {
    correct: Array<number>;
    wrong: Array<number>;
    missed: Array<number>;
}

export interface IState {
    puzzle$: Stream<Array<number>>;
    allowed$: Stream<boolean>;
    selected$: Stream<Array<number>>;
    over$: Stream<boolean>;
    score$: Stream<number>;
    result$: Stream<IResult>;
}
