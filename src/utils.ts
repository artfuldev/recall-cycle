import { Stream } from 'xstream';

export function add<T>(array: T[], item: T): T[] {
  return array.concat(item);
}

export function remove<T>(array: T[], item: T): T[] {
  return array.filter(x => x !== item);
}

export function has<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1;
}

export function reduce<T>(reducer$: Stream<(prev: T) => T>, initial: T) {
  const value$ = reducer$.fold((current, reducer) => reducer(current), initial);
  return value$;
}
