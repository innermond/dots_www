import {
  onMount,
  createResource,
  Show,
  For,
  createSignal,
  lazy,
  batch,
  createMemo,
  createComputed,
  onCleanup,
  untrack,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Stack,
  useTheme,
  IconButton,
  Box,
  Badge,
} from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import VisibilityOutlinedIcon from '@suid/icons-material/VisibilityOutlined';
import EditIcon from '@suid/icons-material/Edit';

import { Grid } from '@suid/material';
import Skeleton from '@suid/material/Skeleton';

import type { Slice } from '@/lib/api';
import { apiEntryType } from '@/api';
import appstate, { isDeepEqual } from '@/lib/app';
import {
  DataEntryTypes,
  EntryTypeData,
  entryTypeZero,
  isEntryTypeData,
} from './types';
import ActionButton from '@/components/ActionButton';
import { Dynamic } from 'solid-js/web';
import toasting from '@/lib/toast';
import { listen, unlisten } from '@/lib/customevent';
import { SetStoreFunction, createStore, unwrap } from 'solid-js/store';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';
import ViewColumnOutlinedIcon from '@suid/icons-material/ViewColumnOutlined';
import FilterListIcon from '@suid/icons-material/FilterList';
import ActionFormProvider from '@/contexts/ActionFormContext';
import type { FilterState } from '@/components/filter';

export type ParametersSetSliceOrigin = Parameters<
  SetStoreFunction<Slice<EntryTypeData>>
>;

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [initialInputs, setInitialInputs] = createSignal(entryTypeZero);

  const peakRow = 3;
  const defaultFilter = [{ id: 'desc' }, { _mask_id: 'o' }];

  const [slice, setSliceOrigin] = createStore<Slice<EntryTypeData>>({
    offset: 0,
    limit: peakRow,
    filter: defaultFilter,
  });

  const [sliceChanged, setSliceChanged] = createSignal<number>(1);
  // wrap origin setStore
  // so every call will trigger the signal used to drive associated request
  const setSlice = (...args: ParametersSetSliceOrigin) => {
    if (!Array.isArray(args)) {
      return;
    }

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
      // notify slice has changed
      setSliceChanged((v: number) => v + 1);
    } catch (err) {
      console.log(err);
    }
  };

  const [result] = createResource(() => {
    if (sliceChanged()) {
      const slicesrc = unwrap(slice);
      return { ...slicesrc };
    }
  }, apiEntryType.all);

  const dataTable = createMemo((): DataEntryTypes => {
    const info = result();
    if (info instanceof Error || !info) {
      return { data: [], n: 0 };
    }
    return info;
  });

  const totalRows = createMemo(() => {
    const { n } = dataTable();
    return n;
  });

  const positionOverflowRight = createMemo((): boolean => {
    const peak = totalRows();
    if (peak === -1) {
      return false;
    }
    const curr = slice.offset + slice.limit;
    const overflow = curr >= peak;
    return overflow;
  });

  const positionOverflowLeft = createMemo((): boolean => {
    const overflow = slice.offset <= 0;
    return overflow;
  });

  const goSlice = (dir: number) => {
    const peak = untrack(() => totalRows());
    if (isNaN(Number(peak)) || peak < 0) {
      return;
    }

    dir = dir > 0 ? 1 : -1;
    const position = untrack(() => dir * slice.limit + 1 * slice.offset);
    if (isNaN(Number(position))) {
      return;
    }

    if (position < 0 || position > peak) {
      return;
    }

    // This version, while valid upsets typescript compiler
    //setSlice('offset', position);
    // but this makes it happy as we inform compiler that everything is fine ("as ParametersSetSliceOrigin")
    // TODO gives the power back to the compiler
    setSlice.apply(null, ['offset', position] as ParametersSetSliceOrigin);
  };

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
    setFreshEntryType(evt.detail);
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

  const rows = (): EntryTypeData[] => {
    const changed = freshEntryType() as EntryTypeData;
    const killed = killOneEntryType() as EntryTypeData;
    const { data } = dataTable();

    if (data === undefined || data === null) {
      return [];
    }

    let inx = -1;
    if (!!changed) {
      inx = data.findIndex(
        (et: EntryTypeData | Error) =>
          isEntryTypeData(et) && et.id == changed.id,
      );
      if (inx === -1) {
        data.unshift(changed);
      } else {
        data[inx] = changed;
      }
    } else if (!!killed) {
      inx = data.findIndex(
        (et: EntryTypeData | Error) =>
          isEntryTypeData(et) && et.id == killed.id,
      );
      if (inx !== -1) {
        data.splice(inx, 1);
      }
    }
    // data shape is filtered above such here is only EntryTypeData[]
    return data as EntryTypeData[];
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
    | 'updateEntry'
    | 'detailEntry'
    | undefined;

  const [dyn, setDyn] = createSignal<LazyWhat>();
  const addEntryType = lazy(() => import('./EntryTypeAdd'));
  const editEntryType = lazy(() => import('./EntryTypeEdit'));
  const updateEntryType = lazy(() => import('./EntryTypeUpdate'));
  const detailEntryType = lazy(() => import('./EntryTypeDetail'));
  const filterColumnsEntryType = lazy(
    () => import('../../components/filter/columns'),
  );

  const handleDialogWith = (
    args: { whatToLoad: LazyWhat; data?: EntryTypeData },
    evt: Event,
  ) => {
    const { whatToLoad, data } = args;
    batch(() => {
      setDyn(whatToLoad);
      if (isEntryTypeData(data)) {
        setInitialInputs(data as EntryTypeData);
      }
    });
  };

  const [openFilterColumns, setOpenFilterColumns] = createSignal(false);
  let anchorColumnsFilter: HTMLButtonElement | undefined;
  const handleColumns = () => {
    const isOpen = untrack(() => openFilterColumns());
    setOpenFilterColumns(!isOpen);

    const anchor = untrack(() => anchorElColumns());
    if (anchor === null && !!anchorColumnsFilter) {
      setAnchorElColumns(anchorColumnsFilter);
    }
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

  const dummy = (num: number, height: string = '1rem') => (
    <Grid container rowSpacing={4.5}>
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end' }}>
        <Skeleton width="10rem" height="3rem" variant="text" />
      </Grid>
      <For each={new Array(num)}>
        {_ => {
          return (
            <Grid item xs={12}>
              <Skeleton width="100%" height={height} variant="rectangular" />
            </Grid>
          );
        }}
      </For>
    </Grid>
  );

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

  const [columnsChanged, setColumnsChanged] = createSignal(initialColumns);
  createComputed(() => {
    let cc = unwrap(filterState.items);
    if (cc === undefined) {
      cc = initialColumns;
    }
    setColumnsChanged(cc);
  });
  const columns = createMemo(() => columnsChanged());

  const tableCells = (
    cols: string[],
    vals?: { [Key in (typeof cols)[number]]: any },
  ): JSX.Element => {
    const isHeadCell = vals === undefined;
    return (
      <For each={cols}>
        {(col: string, inx: () => number) => {
          if (inx() === 0) {
            return isHeadCell ? (
              <TableCell component="th">{col}</TableCell>
            ) : (
              <TableCell component="td">{vals ? vals[col] : ''}</TableCell>
            );
          }
          return isHeadCell ? (
            <TableCell component="th" align="right">
              {col}
            </TableCell>
          ) : (
            <TableCell component="td" align="right">
              {vals ? vals[col] : ''}
            </TableCell>
          );
        }}
      </For>
    );
  };

  const isColumnsFiltered = () => columns()?.length !== initialColumns.length;

  const [anchorElColumns, setAnchorElColumns] =
    createSignal<HTMLButtonElement | null>(null);

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
    if (filterItems() === 'columns-filter') {
      return filterColumnsEntryType;
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
      case 'columns-filter':
        initial.title = 'columns visibility';
        initial.anchor = anchorColumnsFilter;
        setFIlterState(initial);
        setFilterItems('columns-filter');
        break;
    }
  };

  return (
    <>
      <Dynamic
        component={filterComponent()}
        state={filterState}
        setSlice={setSlice}
        setState={setFIlterState}
      />
      {actionForm}
      <Show when={result.state === 'ready'} fallback={dummy(peakRow, '1rem')}>
        <TableContainer component={Paper}>
          <Stack
            direction="row"
            sx={{
              display: 'flex',
              justifyContent: 'end',
            }}
          >
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
              ref={anchorColumnsFilter}
              size="large"
              variant="text"
              startIcon={
                isColumnsFiltered() ? (
                  <Badge overlap="circular" variant="dot" color="error">
                    <ViewColumnOutlinedIcon />
                  </Badge>
                ) : (
                  <ViewColumnOutlinedIcon />
                )
              }
              onClick={[startFilterComponent, 'columns-filter']}
            >
              Columns
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
              Add Entry Type
            </ActionButton>
          </Stack>
          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow hover>
                <TableCell component="th">
                  <Checkbox id="entries-all" />
                </TableCell>
                {tableCells(columns())}
                <TableCell component="th" align="right">
                  &nbsp;
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <For each={rows()}>
                {(et: EntryTypeData) => {
                  return (
                    <TableRow>
                      <TableCell>
                        <Checkbox name="entries" value={et.id} />
                      </TableCell>
                      {tableCells(columns(), et)}
                      <TableCell align="right">
                        <Stack direction="row" paddingLeft={theme.spacing(2)}>
                          <IconButton
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
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
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
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </For>
            </TableBody>
          </Table>
        </TableContainer>
        <Box>
          <IconButton
            disabled={positionOverflowLeft()}
            onClick={() => goSlice(-1)}
          >
            <Show when={!positionOverflowLeft()} fallback={<ChevronLeftIcon />}>
              <Badge max={1000} badgeContent={slice.offset} color="primary">
                <ChevronLeftIcon />
              </Badge>
            </Show>
          </IconButton>
          <IconButton
            disabled={positionOverflowRight()}
            onClick={() => goSlice(1)}
          >
            <Show
              when={!positionOverflowRight()}
              fallback={<ChevronRightIcon />}
            >
              <Badge
                max={1000}
                badgeContent={
                  totalRows() < slice.limit
                    ? totalRows()
                    : totalRows() - (slice.offset + slice.limit)
                }
                color="primary"
              >
                <ChevronRightIcon />
              </Badge>
            </Show>
          </IconButton>
        </Box>
      </Show>
    </>
  );
};

export default EntryTypes;
