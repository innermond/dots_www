import { SetStoreFunction, Store } from 'solid-js/store';

type FilterState = {
  anchor: HTMLElement | null;
  open: boolean;
  title: string;
  items: string[];
  initial: string[];
  search: string;
};

type FilterProps = {
  state: Store<FilterState>;
  setState: SetStoreFunction<FilterState>;
};

export type { FilterState, FilterProps };
