export function add<T>(array: T[], item: T): T[] {
  return array.concat(item);
}

export function remove<T>(array: T[], item: T): T[] {
  return array.filter(x => x !== item);
}

export function has<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1;
}
