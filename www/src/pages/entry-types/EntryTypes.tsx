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
import appstate from '@/lib/app';
import {
  DataEntryTypes,
  EntryTypeData,
  entryTypeZero,
  isEntryTypeData,
} from './types';
import ActionButton from '@/components/ActionButton';
import DialogProvider from '@/contexts/DialogContext';
import { Dynamic } from 'solid-js/web';
import toasting from '@/lib/toast';
import { listen, unlisten } from '@/lib/customevent';
import { createStore } from 'solid-js/store';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';
import ActionFormProvider from '@/contexts/ActionFormContext';

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [initialInputs, setInitialInputs] = createSignal(entryTypeZero);

  const peakRow = 20;

  const [slice, setSlice] = createStore<Slice>({ offset: 0, limit: peakRow });
  const [result] = createResource(() => {
    return { ...slice };
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

  const [lastDirection, setLastDirection] = createSignal(1);

  const positionOverflowRight = (): boolean => {
    const peak = totalRows();
    if (peak === -1) {
      return false;
    }
    return peak <= slice.limit + slice.offset;
  };

  const positionOverflowLeft = (): boolean => {
    return slice.offset <= 0;
  };

  const goSlice = (dir: number) => {
    const peak = totalRows();
    if (peak === -1) {
      return;
    }

    dir = dir > 0 ? 1 : -1;
    setLastDirection(dir);
    const position = dir * slice.limit + slice.offset;
    if (position < 0 || position > peak) {
      return;
    }

    setSlice((s: Slice) => ({ ...s, offset: position }));
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
  });
  onCleanup(() => {
    unlisten('dots:fresh:EntryType', handleFreshEntryType as EventListener);
    listen('dots:close:ActionForm', handleCloseActionForm);
    unlisten('dots:killone:EntryType', handleKillOneEntryType as EventListener);
  });

  const dialogSignal = createSignal(false);

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

  const handleDialogWith = (
    args: { whatToLoad: LazyWhat; data?: EntryTypeData },
    evt: Event,
  ) => {
    const { whatToLoad, data } = args;
    batch(() => {
      setDyn(whatToLoad);
      setInitialInputs(data as EntryTypeData);
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

  const dialogSave = () => {
    return (
      <Show when={!!cmp()}>
        <ActionFormProvider initialInputs={initialInputs()}>
          <Dynamic component={cmp()} />
        </ActionFormProvider>
      </Show>
    );
  };

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

  return (
    <>
      {dialogSave}
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
                <TableCell component="th">Code</TableCell>
                <TableCell component="th" align="right">
                  Description
                </TableCell>
                <TableCell component="th" align="right">
                  Unit
                </TableCell>
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
                      <TableCell>{et.code}</TableCell>
                      <TableCell align="right">{et.description}</TableCell>
                      <TableCell align="right">{et.unit}</TableCell>
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
            <Show
              when={
                (lastDirection() === -1 && !positionOverflowLeft()) ||
                positionOverflowRight()
              }
              fallback=<ChevronLeftIcon />
            >
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
              when={
                (lastDirection() === 1 && !positionOverflowRight()) ||
                positionOverflowLeft()
              }
              fallback=<ChevronRightIcon />
            >
              <Badge
                max={1000}
                badgeContent={totalRows() - (slice.offset + slice.limit)}
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
