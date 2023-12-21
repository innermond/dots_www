import { SetStoreFunction, Store } from 'solid-js/store';

type FilterState = {
  anchor: HTMLElement | undefined;
  open: boolean;
  title: string;
  search: string;
  initials: string[];
  items: string[];
};

type FilterProps<T> = {
  state: Store<T>;
  setState: SetStoreFunction<T>;
};

type FilterSearchCriteria = {
  mode: 0 | 1 | 2;
  value: string;
  order: -1 | 1;
};

type FilterSearchState = {
  [key: string]: FilterSearchCriteria;
};

export type {
  FilterState,
  FilterProps,
  FilterSearchCriteria,
  FilterSearchState,
};
