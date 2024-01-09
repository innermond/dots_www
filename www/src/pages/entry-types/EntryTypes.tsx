import {
  onMount,
  createResource,
  Show,
  createSignal,
  lazy,
  batch,
  createMemo,
  createComputed,
  onCleanup,
  untrack,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { Stack, useTheme, IconButton, Badge, Box } from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import EditIcon from '@suid/icons-material/Edit';
import ToggleOffOutlinedIcon from '@suid/icons-material/ToggleOffOutlined';

import type { Slice } from '@/lib/api';
import { apiEntryType } from '@/api';
import appstate, { isDeepEqual } from '@/lib/app';
import { EntryTypeData, entryTypeZero, isEntryTypeData } from './types';
import ActionButton from '@/components/ActionButton';
import { Dynamic } from 'solid-js/web';
import toasting from '@/lib/toast';
import { listen, unlisten } from '@/lib/customevent';
import { SetStoreFunction, createStore, unwrap } from 'solid-js/store';
import FilterListIcon from '@suid/icons-material/FilterList';
import UploadFileIcon from '@suid/icons-material/UploadFile';
import ActionFormProvider from '@/contexts/ActionFormContext';
import type { FilterState } from '@/components/filter';
import Rows from '@/components/rows/Rows';

export type ParametersSetSliceOrigin<T> = Parameters<
  SetStoreFunction<Slice<T>>
>;

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [initialInputs, setInitialInputs] = createSignal(entryTypeZero);

  const peakRow = 10;
  const defaultFilter = [{ id: 'desc' }, { _mask_id: 'o' }];

  const [slice, setSliceOrigin] = createStore<Slice<EntryTypeData>>({
    offset: 0,
    limit: peakRow,
    filter: defaultFilter,
  });

  // used to trigger server data request
  const [sliceChanged, setSliceChanged] = createSignal<number>(1);
  // wrap origin setStore
  // so every call will trigger the signal used to drive associated request
  const setSlice = (...args: ParametersSetSliceOrigin<EntryTypeData>) => {
    if (!Array.isArray(args)) {
      return;
    }

    untrack(() => {
      if (Array.isArray(altered()) && altered().length !== 0) {
        setAltered([]);
      }
    });

    try {
      // before
      const before = structuredClone(unwrap(slice));
      // change
      setSliceOrigin.apply(null, args);
      // after
      const after = structuredClone(unwrap(slice));
      // have really changed?
      if (isDeepEqual(before, after)) {
        return;
      }
      // notify slice has changed according with check above
      setSliceChanged((v: number) => v + 1);
    } catch (err) {
      console.log(err);
    }
  };

  const [result] = createResource(() => {
    // this (re)triggers server request
    if (sliceChanged()) {
      const slicesrc = unwrap(slice);
      // params for calling apiEntryType.all
      return { ...slicesrc };
    }
  }, apiEntryType.all);

  // altered rows on the slice without checking with server
  const [altered, setAltered] = createSignal<EntryTypeData[]>([]);

  const [freshEntryType, setFreshEntryType] = createSignal<EntryTypeData>();
  const [killOneEntryType, setKillOneEntryType] = createSignal<EntryTypeData>();

  const handleFreshEntryType = (evt: CustomEvent) => {
    if (!isEntryTypeData(evt.detail)) {
      toasting(
        'Updating screen of entry types table did not happen. Unexpected format of data received from server',
        'warning',
      );
      return;
    }
    setKillOneEntryType(undefined);
    // this refresh the slice/rows
    //setSliceChanged((v: number) => v + 1);
    setFreshEntryType(evt.detail);
    setAltered([evt.detail]);
  };

  const handleKillOneEntryType = (evt: CustomEvent) => {
    if (!isEntryTypeData(evt.detail)) {
      toasting(
        'Deleting from screen of entry types table did not happen. Cannot understand what to delete',
        'warning',
      );
      return;
    }
    setFreshEntryType(undefined);
    setKillOneEntryType(evt.detail);
  };

  const [isSearchFiltered, setIsSearchFiltered] = createSignal(false);
  const handleIsFilteredSearch = (evt: CustomEvent) => {
    const isFiltered = evt.detail !== '';
    setIsSearchFiltered(isFiltered);
  };

  onMount(() => {
    setState('currentPageTitle', "Entry types's list");
    listen('dots:fresh:EntryType', handleFreshEntryType as EventListener);
    listen('dots:close:ActionForm', handleCloseActionForm);
    listen('dots:killone:EntryType', handleKillOneEntryType as EventListener);
    listen(
      'dots:filter:SearchEntryType',
      handleIsFilteredSearch as EventListener,
    );
  });
  onCleanup(() => {
    unlisten('dots:fresh:EntryType', handleFreshEntryType as EventListener);
    listen('dots:close:ActionForm', handleCloseActionForm);
    unlisten('dots:killone:EntryType', handleKillOneEntryType as EventListener);
    unlisten(
      'dots:filter:SearchEntryType',
      handleIsFilteredSearch as EventListener,
    );
  });

  type LazyWhat =
    | 'editEntry'
    | 'addEntry'
    | 'addManyEntryType'
    | 'updateEntry'
    | 'detailEntry'
    | undefined;

  const [dyn, setDyn] = createSignal<LazyWhat>();
  const addEntryType = lazy(() => import('./EntryTypeAdd'));
  const addManyEntryType = lazy(() => import('./EntryTypeAddMany'));
  const editEntryType = lazy(() => import('./EntryTypeEdit'));
  const updateEntryType = lazy(() => import('./EntryTypeUpdate'));
  const detailEntryType = lazy(() => import('./EntryTypeDetail'));

  const handleDialogWith = (
    args: { whatToLoad: LazyWhat; data?: EntryTypeData },
    evt: Event,
  ) => {
    const { whatToLoad, data } = args;
    batch(() => {
      setDyn(whatToLoad);
      if (data && isEntryTypeData(data)) {
        setInitialInputs(data as EntryTypeData);
      }
    });
  };

  const theme = useTheme();

  const handleCloseActionForm = () => setDyn(undefined);

  const cmp = createMemo(() => {
    if ((dyn() as string) === 'editEntry') {
      return editEntryType;
    }
    if ((dyn() as string) === 'updateEntry') {
      return updateEntryType;
    }
    if ((dyn() as string) === 'addEntry') {
      return addEntryType;
    }
    if ((dyn() as string) === 'addManyEntryType') {
      return addManyEntryType;
    }
    if ((dyn() as string) === 'detailEntry') {
      return detailEntryType;
    }
  });
  createComputed(() => {
    if (!cmp()) {
      // reset
      setDyn(undefined);
      setInitialInputs(entryTypeZero);
    }
  });

  const actionForm = (
    <Show when={!!cmp() && !!initialInputs()}>
      <ActionFormProvider<EntryTypeData> initialInputs={initialInputs()}>
        <Dynamic component={cmp()} />
      </ActionFormProvider>
    </Show>
  );

  const initialColumns = ['code', 'description', 'unit'];
  const initialFilterState = {
    anchor: undefined,
    open: false,
    title: 'Filter items',
    search: '',
    initials: [...initialColumns],
    items: initialColumns,
  } as FilterState;
  const [filterState, setFIlterState] = createStore<FilterState>(
    structuredClone(initialFilterState),
  );

  const filterSearchEntryType = lazy(
    () => import('../../components/filter/search'),
  );
  let anchorSearchFilter: HTMLButtonElement | undefined;

  const [filterItemsOrigin, setFilterItems] = createSignal<string>();
  const filterItems = createMemo(() => filterItemsOrigin());
  const filterComponent = () => {
    if (filterItems() === 'search-filter') {
      return filterSearchEntryType;
    }
  };

  const startFilterComponent = (cmpstr: string, evt: Event) => {
    const items = unwrap(filterState);
    let initial = { ...initialFilterState, ...items };
    initial.open = true;
    switch (cmpstr) {
      case 'search-filter':
        initial.title = 'Search filter';
        initial.anchor = anchorSearchFilter;
        setFIlterState(initial);
        setFilterItems('search-filter');
        break;
    }
  };

  const rowActions = (
    et: EntryTypeData,
    isChecked: (id: number) => boolean,
  ) => (
    <Stack direction="row" paddingLeft={theme.spacing(2)}>
      <IconButton
        disabled={isChecked(et.id)}
        title="edit entry type"
        color="primary"
        size="small"
        aria-label="edit entry type"
        onClick={[
          handleDialogWith,
          {
            whatToLoad: 'updateEntry' as LazyWhat,
            data: et,
          },
        ]}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        disabled={isChecked(et.id)}
        title="view entry type"
        color="primary"
        size="small"
        aria-label="view entry type"
        onClick={[
          handleDialogWith,
          {
            whatToLoad: 'detailEntry' as LazyWhat,
            data: et,
          },
        ]}
      >
        <ToggleOffOutlinedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );

  const tableActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'end', flexGrow: 1 }}>
      <ActionButton
        ref={anchorSearchFilter}
        size="large"
        variant="text"
        startIcon={
          isSearchFiltered() ? (
            <Badge overlap="circular" variant="dot" color="error">
              <FilterListIcon />
            </Badge>
          ) : (
            <FilterListIcon />
          )
        }
        onClick={[startFilterComponent, 'search-filter']}
      >
        Filters
      </ActionButton>
      <ActionButton
        size="large"
        variant="text"
        startIcon={<AddIcon />}
        onClick={[
          handleDialogWith,
          { whatToLoad: 'addEntry', data: entryTypeZero },
        ]}
      >
        add one
      </ActionButton>
      <ActionButton
        size="large"
        variant="text"
        startIcon={<UploadFileIcon />}
        onClick={[handleDialogWith, { whatToLoad: 'addManyEntryType' }]}
      >
        add many
      </ActionButton>
    </Box>
  );

  return (
    <>
      <Dynamic
        component={filterComponent()}
        state={filterState}
        setSlice={setSlice}
        setState={setFIlterState}
      />
      {actionForm}
      <Rows<EntryTypeData>
        result={result}
        altered={altered}
        initialColumns={initialColumns}
        slice={slice}
        setSlice={setSlice}
        peakRow={peakRow}
        rowActions={rowActions}
        tableActions={tableActions}
      />
    </>
  );
};

export default EntryTypes;
