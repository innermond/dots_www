import {
  Show,
  For,
  createSignal,
  lazy,
  createMemo,
  createComputed,
  untrack,
  JSX,
} from 'solid-js';
import type { ResourceReturn } from 'solid-js';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  useTheme,
  IconButton,
  Badge,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from '@suid/material';
import VisibilityOutlinedIcon from '@suid/icons-material/VisibilityOutlined';
import DeselectIcon from '@suid/icons-material/Deselect';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';

import { Grid } from '@suid/material';
import Skeleton from '@suid/material/Skeleton';

import { Store, createStore, unwrap } from 'solid-js/store';
import { FilterColumns } from '@/components/filter';
import type { FilterState } from '@/components/filter';
import ActionButton from '@/components/ActionButton';
import { Slice } from '@/lib/api';
import { ParametersSetSliceOrigin } from '@/pages/entry-types/EntryTypes';
import { SelectChangeEvent } from '@suid/material/Select';
import { Component } from 'solid-js';

const dummy = (num: number, height: string = '1rem') => (
  <Grid container rowSpacing={3.25}>
    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end' }}>
      <Skeleton width="100%" height="3rem" variant="text" />
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

// data given shape contains actual data and the number of records
type RowsData<T> = { data: (T | Error)[]; n: number };
// data are expected as RowsData
// index 0 for first object of a ResourceReturn
type RowsProps<T> = {
  result: ResourceReturn<RowsData<T> | Error>[0];
  initialColumns: string[];
  slice: Store<Slice<T>>;
  setSlice: (...args: ParametersSetSliceOrigin<T>) => void;
  peakRow: number;
  rowActions: (r: T, ischecked: (id: number) => boolean) => JSX.Element;
  tableActions: Component;
};

const theme = useTheme();

const Rows = <T extends { id: number }>(props: RowsProps<T>): JSX.Element => {
  const result = props.result;
  const slice = props.slice;
  const setSlice = props.setSlice;
  const peakRow = props.peakRow;
  const rowActions = props.rowActions;
  const tableActions = props.tableActions;

  // displayable data
  const dataTable = createMemo((): RowsData<T> => {
    const info = result();
    if (info instanceof Error || !info) {
      return { data: [], n: 0 };
    }
    return info;
  });

  const rows = (): T[] => {
    const { data } = dataTable();

    if (data === undefined || data === null) {
      return [];
    }

    return data as T[];
  };

  const totalRows = createMemo(() => {
    const { n } = dataTable();
    return n;
  });

  // how many rows are shown
  const [see, setSee] = createSignal<number>(10);

  const handleSeechange = (evt: SelectChangeEvent) => {
    const v = Number(evt.target.value);
    if (isNaN(v)) {
      return;
    }

    setSee(v);
    setSlice.apply(null, [
      'limit',
      v,
    ] as unknown as ParametersSetSliceOrigin<T>);
  };

  // checked rows
  const [checks, setChecks] = createSignal<number[]>([]);
  const selectedRows = createMemo(() => checks());
  const unselectAllChecks = () => setChecks([]);
  const isChecked = (id: number): boolean => {
    const cc = selectedRows();
    const pos = cc.indexOf(id);
    return pos >= 0;
  };
  const handleChangeChecks = (evt: Event, checked: boolean) => {
    const { target } = evt;
    if (!target || !('value' in target)) {
      return;
    }

    const v = Number(target.value);
    if (isNaN(v)) {
      return;
    }

    const cc = untrack(() => checks());
    const pos = cc.indexOf(v);
    if (checked && pos === -1) {
      const kk = [...cc, v];
      setChecks(kk);
    }

    if (!checked && pos >= 0) {
      cc.splice(pos, 1);
      const kk = [...cc];
      setChecks(kk);
    }
  };

  const rowsOnPage = createMemo(() =>
    dataTable()
      .data.filter(el => !(el instanceof Error))
      .map(el => (el as T).id),
  );
  const rowsOnPageSelected = createMemo(() => {
    const selected = rowsOnPage().filter(v => selectedRows().includes(v));
    return selected;
  });
  const rowsOnPageUnselected = createMemo(() => {
    const selected = rowsOnPage().filter(v => !selectedRows().includes(v));
    return selected;
  });
  const handleChangeMasterChecks = (evt: Event, checked: boolean) => {
    const { target } = evt;
    if (!target || !('value' in target)) {
      return;
    }
    untrack(() => {
      if (checked) {
        const rowsTargeted = rowsOnPageUnselected();
        const cc = [
          ...selectedRows().filter(v => !rowsOnPageSelected().includes(v)),
          ...rowsTargeted,
        ];
        setChecks(cc);
      } else {
        const rowsTargeted = rowsOnPageSelected();
        const cc = [...selectedRows().filter(v => !rowsTargeted.includes(v))];
        setChecks(cc);
      }
    });
  };

  const initialColumns = props.initialColumns;
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
  const isColumnsFiltered = () => columns()?.length !== initialColumns.length;

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

  let anchorColumnsFilter: HTMLButtonElement | undefined;

  const SeeColumns = () => {
    const items = unwrap(filterState);
    let initial = { ...initialFilterState, ...items };
    initial.title = 'columns visibility';
    initial.anchor = anchorColumnsFilter;
    setFIlterState(initial);
    return <FilterColumns state={filterState} setState={setFIlterState} />;
  };

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
    let position = untrack(() => dir * slice.limit + 1 * slice.offset);
    if (isNaN(Number(position))) {
      return;
    }

    if (position < 0) {
      position = 0;
    } else if (position > peak) {
      position = peak;
    }

    // This version, while valid upsets typescript compiler
    //setSlice('offset', position);
    // but this makes it happy as we inform compiler that everything is fine ("as ParametersSetSliceOrigin")
    // TODO gives the power back to the compiler
    setSlice.apply(null, [
      'offset',
      position,
    ] as unknown as ParametersSetSliceOrigin<T>);
  };

  const tableSlicing = () => (
    <Stack direction="row">
      <IconButton disabled={positionOverflowLeft()} onClick={() => goSlice(-1)}>
        <Show
          when={!positionOverflowLeft()}
          fallback={<ChevronLeftIcon sx={{ fontSize: theme.typography.h5 }} />}
        >
          <Badge max={1000} badgeContent={slice.offset} color="primary">
            <ChevronLeftIcon sx={{ fontSize: theme.typography.h5 }} />
          </Badge>
        </Show>
      </IconButton>
      <IconButton disabled={positionOverflowRight()} onClick={() => goSlice(1)}>
        <Show
          when={!positionOverflowRight()}
          fallback={<ChevronRightIcon sx={{ fontSize: theme.typography.h5 }} />}
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
            <ChevronRightIcon sx={{ fontSize: theme.typography.h5 }} />
          </Badge>
        </Show>
      </IconButton>
      <Typography
        variant="body2"
        sx={{
          alignSelf: 'center',
          ml: theme.spacing(3),
          mr: theme.spacing(1),
        }}
      >
        Rows per page
      </Typography>
      <FormControl size="small" margin="dense">
        <Select value={see()} onChange={handleSeechange}>
          <For each={[1, 2.5, 5, 10, 20, 30].map(v => v * peakRow)}>
            {v => <MenuItem value={v}>{v}</MenuItem>}
          </For>
        </Select>
      </FormControl>
      <Show when={!!selectedRows().length}>
        <Typography
          sx={{ alignSelf: 'center', ml: theme.spacing(1) }}
          variant="body2"
        >
          selected {selectedRows().length}, here {rowsOnPageSelected().length}
        </Typography>
      </Show>
    </Stack>
  );

  return (
    <>
      <Show when={filterState.open && !!anchorColumnsFilter}>
        <SeeColumns />
      </Show>
      <TableContainer component={Paper}>
        <Stack
          direction="row"
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Show when={selectedRows().length}>
            <ActionButton
              size="large"
              variant="text"
              startIcon={
                selectedRows().length ? (
                  <Badge
                    max={300}
                    overlap="circular"
                    badgeContent={selectedRows().length}
                    color="error"
                  >
                    <DeselectIcon />
                  </Badge>
                ) : undefined
              }
              onClick={unselectAllChecks}
            >
              Unselect all
            </ActionButton>
          </Show>
          {tableActions()}
        </Stack>
        <Show when={result.state === 'ready'} fallback={dummy(see())}>
          <Table size="small" aria-label="entry types table">
            <TableHead>
              <TableRow hover>
                <TableCell component="th">
                  <Checkbox
                    id="entries-all"
                    checked={rowsOnPageUnselected().length === 0}
                    indeterminate={
                      !!rowsOnPageSelected().length &&
                      !!rowsOnPageUnselected().length
                    }
                    onChange={handleChangeMasterChecks}
                  />
                </TableCell>
                {tableCells(columns())}
                <TableCell component="th">
                  <IconButton
                    ref={anchorColumnsFilter}
                    size="large"
                    sx={{ ml: theme.spacing(1) }}
                    onClick={() => setFIlterState('open', true)}
                  >
                    {isColumnsFiltered() ? (
                      <Badge overlap="circular" variant="dot" color="error">
                        <VisibilityOutlinedIcon />
                      </Badge>
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <For each={rows()}>
                {(r: T) => {
                  return (
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          checked={isChecked(r.id)}
                          name="entries"
                          value={r.id}
                          onChange={handleChangeChecks}
                        />
                      </TableCell>
                      {tableCells(columns(), r)}
                      <TableCell>{rowActions(r, isChecked)}</TableCell>
                    </TableRow>
                  );
                }}
              </For>
            </TableBody>
          </Table>
        </Show>
      </TableContainer>
      {tableSlicing()}
    </>
  );
};

export type { RowsData };
export default Rows;
