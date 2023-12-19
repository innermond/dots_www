import { SetStoreFunction, Store } from 'solid-js/store';

type FilterState = {
  anchor: HTMLElement | undefined;
  open: boolean;
  title: string;
  items: string[];
};

type FilterProps = {
  state: Store<FilterState>;
  setState: SetStoreFunction<FilterState>;
};

export type { FilterState, FilterProps };
