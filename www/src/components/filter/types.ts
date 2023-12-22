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
  mode: string;
  value: string;
  order: string;
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
