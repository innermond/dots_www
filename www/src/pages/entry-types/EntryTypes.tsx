import {
  onMount,
  createResource,
  Show,
  For,
  createSignal,
  lazy,
  batch,
  createMemo,
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
import { useNavigate } from '@solidjs/router';

import { Grid } from '@suid/material';
import Skeleton from '@suid/material/Skeleton';

import { apiEntryType } from '@/api';
import appstate from '@/lib/app';
import { EntryTypeData, entryTypeZero } from './types';
import ActionButton from '@/components/ActionButton';
import DialogProvider from '@/contexts/DialogContext';
import { Dynamic } from 'solid-js/web';

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [result] = createResource(apiEntryType.all);
  const entryTypes = (): EntryTypeData[] => {
    const info = result();
    if (info instanceof Error || !info) {
      return [];
    }

    const { data, n } = info as any;
    return n ? data : [];
  };

  onMount(() => {
    setState('currentPageTitle', "Entry types's list");
  });

  const navigate = useNavigate();

  const dialogSignal = createSignal<boolean | undefined>(undefined);
  const [openDialog, setOpenDialog] = dialogSignal;

  type LazyWhat = 'editEntry' | 'addEntry';

  const [dyn, setDyn] = createSignal<LazyWhat>();
  const addEntryType = lazy(() => import('./EntryTypeAdd'));
  const editEntryType = lazy(() => import('./EntryTypeEdit'));

  const [intialInputs, setInitialInputs] = createSignal(entryTypeZero);
  const handleDialogWith = (
    args: { cmp: LazyWhat; data?: EntryTypeData },
    evt: Event,
  ) => {
    const { cmp, data } = args;
    batch(() => {
      setOpenDialog(true);
      setDyn(cmp);
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
  };
  const openable = () => {
    const cmp = cmpname();
    const dlg = openDialog();
    const op = !!cmp && dlg;
    return op;
  };
  const title = () => {
    return (cmpname() as string) === 'editEntry'
      ? 'Edit entry type'
      : 'Add entry type';
  };
  const textSave = () => {
    return (cmpname() as string) === 'editEntry' ? 'Edit' : 'Add';
  };
  const fields = () => {
    return (cmpname() as string) === 'editEntry'
      ? ['id', 'code', 'description', 'unit']
      : ['code', 'description', 'unit'];
  };
  const sendRequestFn = () => {
    return (cmpname() as string) === 'editEntry'
      ? apiEntryType.edit
      : apiEntryType.add;
  };

  const dialogSave = () => {
    return (
      <Show when={openable()}>
        <DialogProvider<EntryTypeData | Omit<EntryTypeData, 'id'>>
          //transition={dialogTransition}
          title={title()}
          textSave={textSave()}
          open={dialogSignal}
          names={fields()}
          sendRequestFn={sendRequestFn()}
          intialInputs={intialInputs()}
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
                { cmp: 'addEntry', data: entryTypeZero },
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
              <For each={entryTypes()}>
                {(c: EntryTypeData) => {
                  return (
                    <TableRow>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>{c.code}</TableCell>
                      <TableCell align="right">{c.description}</TableCell>
                      <TableCell align="right">{c.unit}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" paddingLeft={theme.spacing(2)}>
                          <IconButton
                            title="view entry type"
                            color="primary"
                            size="small"
                            aria-label="view entry type"
                            /*onclick={() =>
                            navigate('./' + c.id, { replace: true })
                          }*/
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
                              { cmp: 'editEntry' as LazyWhat, data: c },
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
