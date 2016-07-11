import { DOMSource } from '@cycle/dom/xstream-typings';
import { Record } from 'immutable';

export interface ISources {
    dom: DOMSource
}

export interface IResult {
    correct: Array<number>
    wrong: Array<number>
    missed: Array<number>
}

export interface IState {
    grid: Array<number>
    puzzle: Array<number>
    allowed: boolean
    selected: Array<number>
    over: boolean
    score: number
    result: IResult
}