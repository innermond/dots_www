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
} from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import VisibilityOutlinedIcon from '@suid/icons-material/VisibilityOutlined';
import EditIcon from '@suid/icons-material/Edit';

import { Grid } from '@suid/material';
import Skeleton from '@suid/material/Skeleton';

import { apiEntryType } from '@/api';
import appstate from '@/lib/app';
import { EntryTypeData, entryTypeZero, isEntryTypeData } from './types';
import ActionButton from '@/components/ActionButton';
import DialogProvider from '@/contexts/DialogContext';
import { Dynamic } from 'solid-js/web';
import toasting from '@/lib/toast';
import { listen, unlisten } from '@/lib/customevent';

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [initialInputs, setInitialInputs] = createSignal(entryTypeZero);

  const [result] = createResource(apiEntryType.all);
  const entryTypes = (): EntryTypeData[] => {
    const info = result();
    if (info instanceof Error || !info) {
      return [];
    }

    const { data, n } = info as any;
    return n ? data : [];
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
    const data = entryTypes();

    if (data === undefined || data === null) {
      return [];
    }

    let inx = -1;
    if (!!changed) {
      inx = data.findIndex((et: EntryTypeData) => et.id == changed.id);
      if (inx === -1) {
        data.unshift(changed);
      } else {
        data[inx] = changed;
      }
    } else if (!!killed) {
      inx = data.findIndex((et: EntryTypeData) => et.id == killed.id);
      if (inx !== -1) {
        data.splice(inx, 1);
      }
    }
    return data;
  };

  onMount(() => {
    setState('currentPageTitle', "Entry types's list");
    listen('dots:fresh:EntryType', handleFreshEntryType as EventListener);
    listen('dots:killone:EntryType', handleKillOneEntryType as EventListener);
  });
  onCleanup(() => {
    unlisten('dots:fresh:EntryType', handleFreshEntryType as EventListener);
    unlisten('dots:killone:EntryType', handleKillOneEntryType as EventListener);
  });

  const dialogSignal = createSignal(false);
  const [openDialog, setOpenDialog] = dialogSignal;

  type LazyWhat = 'editEntry' | 'addEntry' | 'detailEntry' | undefined;

  const [dyn, setDyn] = createSignal<LazyWhat>();
  const addEntryType = lazy(() => import('./EntryTypeAdd'));
  const editEntryType = lazy(() => import('./EntryTypeEdit'));
  const detailEntryType = lazy(() => import('./EntryTypeDetail'));

  const handleDialogWith = (
    args: { whatToLoad: LazyWhat; data?: EntryTypeData },
    evt: Event,
  ) => {
    const { whatToLoad, data } = args;
    batch(() => {
      setOpenDialog(true);
      setDyn(whatToLoad);
      setInitialInputs(data as EntryTypeData);
    });
  };

  const theme = useTheme();

  /*
  const dialogTransition = (
    props: TransitionProps & { children: JSX.Element },
  ) => <Slide {...props} direction="up" />;
*/

  const cmpname = createMemo(() => {
    const cmp = dyn();
    return cmp;
  });
  const cmp = () => {
    if ((cmpname() as string) === 'editEntry') {
      return editEntryType;
    }
    if ((cmpname() as string) === 'addEntry') {
      return addEntryType;
    }
    if ((cmpname() as string) === 'detailEntry') {
      return detailEntryType;
    }
    throw new Error(`no component defined for ${cmpname()}`);
  };
  const title = () => {
    if ((cmpname() as string) === 'editEntry') {
      return 'Edit entry types';
    }
    if ((cmpname() as string) === 'addEntry') {
      return 'Add entry types';
    }
    if ((cmpname() as string) === 'detailEntry') {
      return 'Details of entry type';
    }
    throw new Error(`no title defined for ${cmpname()}`);
  };
  const textSave = () => {
    if ((cmpname() as string) === 'editEntry') {
      return 'Edit';
    }
    if ((cmpname() as string) === 'addEntry') {
      return 'Add';
    }
    if ((cmpname() as string) === 'detailEntry') {
      return 'Delete';
    }
    throw new Error(`no text button defined for ${cmpname()}`);
  };
  const fields = () => {
    if ((cmpname() as string) === 'editEntry') {
      return ['id', 'code', 'description', 'unit'];
    }
    if ((cmpname() as string) === 'addEntry') {
      return ['code', 'description', 'unit'];
    }
    if ((cmpname() as string) === 'detailEntry') {
      return ['id', 'dontCheckChanged'];
    }
    throw new Error(`no fields defined for ${cmpname()}`);
  };
  const sendRequestFn = () => {
    if ((cmpname() as string) === 'editEntry') {
      return apiEntryType.edit;
    }
    if ((cmpname() as string) === 'addEntry') {
      return apiEntryType.add;
    }
    if ((cmpname() as string) === 'detailEntry') {
      return apiEntryType.del;
    }
    throw new Error(`no api call defined for ${cmpname()}`);
  };

  createComputed(() => {
    if (!openDialog()) {
      // reset
      setDyn(undefined);
      setInitialInputs(entryTypeZero);
    }
  });

  const dialogSave = () => {
    return (
      <Show when={openDialog()}>
        <DialogProvider<EntryTypeData>
          //transition={dialogTransition}
          title={title()}
          textSave={textSave()}
          open={dialogSignal}
          names={fields()}
          sendRequestFn={sendRequestFn()}
          initialInputs={initialInputs}
          setInitialInputs={setInitialInputs}
        >
          <Dynamic component={cmp()} />
        </DialogProvider>
      </Show>
    );
  };

  const dummy = (num: number, height: string = '1rem') => (
    <Grid container rowSpacing={4.5}>
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end' }}>
        <Skeleton width="10rem" height="5rem" variant="text" />
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
      <Show when={result.state === 'ready'} fallback={dummy(20, '2rem')}>
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
                  <Checkbox />
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
                        <Checkbox />
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
                              { whatToLoad: 'editEntry' as LazyWhat, data: et },
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
      </Show>
    </>
  );
};

export default EntryTypes;
