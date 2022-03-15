export interface SortFn {
  property: string | number;
  isDescending: boolean;
}

export function sort(objectA: any, objectB: any, sortFn: SortFn) {
  const result = () => {
    if (objectA[sortFn.property] > objectB[sortFn.property]) {
      return 1;
    } else if (objectA[sortFn.property] < objectB[sortFn.property]) {
      return -1;
    } else {
      return 0;
    }
  };

  return sortFn.isDescending ? result() * -1 : result();
}
