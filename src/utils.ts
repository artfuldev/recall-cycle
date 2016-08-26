export function add<T>(array: T[], item: T): T[] {
  return array.concat(item);
}

export function remove<T>(array: T[], item: T): T[] {
  return array.filter(x => x !== item);
}

export function has<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1;
}

export function findChildIndex(element: HTMLElement): number {
  const childNodes = element.parentElement.childNodes;
  for (var i = 0; i < childNodes.length; i++)
    if (childNodes[i] === element)
      return i;
  return -1;
}
