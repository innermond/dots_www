import {
  onMount,
  createResource,
  Show,
  For,
  createSignal,
  lazy,
  batch,
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
  Button,
  useTheme,
  IconButton,
  Slide,
} from '@suid/material';
import { TransitionProps } from '@suid/material/transitions';
import AddIcon from '@suid/icons-material/Add';
import VisibilityOutlinedIcon from '@suid/icons-material/VisibilityOutlined';
import EditIcon from '@suid/icons-material/Edit';
import { useNavigate } from '@solidjs/router';

import { apiEntryType } from '@/api';
import appstate from '@/lib/app';
import { EntryTypeData } from './types';
import DialogSave from '@/components/DialogSave';

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

  const [intialInputs, setInitialInputs] = createSignal();
  const handleDialogWith = (
    args: { cmp: LazyWhat; data?: EntryTypeData },
    evt: Event,
  ) => {
    const { cmp, data } = args;
    batch(() => {
      setOpenDialog(true);
      setDyn(cmp);
      setInitialInputs(data);
    });
  };

  const theme = useTheme();

  const dialogTransition = (
    props: TransitionProps & { children: JSX.Element },
  ) => <Slide {...props} direction="left" />;

  const dialogSave = () => (
    <Show when={openDialog()}>
      <DialogSave
        transition={dialogTransition}
        title={
          (dyn() as string) === 'editEntry'
            ? 'Edit entry type'
            : 'Add entry type'
        }
        textSave={(dyn() as string) === 'editEntry' ? 'Edit' : 'Add'}
        open={dialogSignal}
        names={
          (dyn() as string) === 'editEntry'
            ? ['id', 'code', 'description', 'unit']
            : ['code', 'description', 'unit']
        }
        dyn={(dyn() as string) === 'editEntry' ? editEntryType : addEntryType}
        sendRequestFn={
          (dyn() as string) === 'editEntry'
            ? apiEntryType.edit
            : apiEntryType.add
        }
        intialInputs={intialInputs()}
      />
    </Show>
  );

  return (
    <>
      {dialogSave}
      <Show when={result.state === 'ready'}>
        <TableContainer component={Paper}>
          <Stack
            direction="row"
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'end',
              backgroundColor: theme.palette.grey[200],
            }}
          >
            <Button
              size="large"
              startIcon={<AddIcon />}
              onClick={[handleDialogWith, { cmp: 'addEntry' }]}
            >
              Add Entry Type
            </Button>
          </Stack>
          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow hover>
                <TableCell>
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
                  Action
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
                        <IconButton
                          color="primary"
                          aria-label="view entry type"
                          /*onclick={() =>
                            navigate('./' + c.id, { replace: true })
                          }*/
                        >
                          <VisibilityOutlinedIcon />
                          <IconButton
                            color="primary"
                            aria-label="view entry type"
                            onClick={[
                              handleDialogWith,
                              { cmp: 'editEntry' as LazyWhat, data: c },
                            ]}
                          >
                            <EditIcon />
                          </IconButton>
                        </IconButton>
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
