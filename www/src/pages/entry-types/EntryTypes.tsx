import {
  onMount,
  createResource,
  Show,
  For,
  createSignal,
  lazy,
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
} from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import VisibilityOutlinedIcon from '@suid/icons-material/VisibilityOutlined';
import { useNavigate } from '@solidjs/router';

import { entryType } from '@/lib/api';
import appstate from '@/lib/app';
import { EntryTypeData } from './types';
import DialogSave from '@/components/DialogSave';

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [result] = createResource(entryType.all);
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

  const addEntryTypeSignal = createSignal(false);
  const openDialogToAddEntryType = () => {
    addEntryTypeSignal[1](true);
  };
  const dyn = lazy(() => import('./EntryTypeAdd'));

  const theme = useTheme();

  return (
    <>
      <DialogSave.With
        dyn={dyn}
        title="Add entry type"
        textSave="Add"
        open={addEntryTypeSignal}
      />
      <Show when={result.state === 'ready'}>
        <TableContainer component={Paper} on:postEntryType={evt=>console.log(evt)}>
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
              onClick={openDialogToAddEntryType}
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
                          onclick={() =>
                            navigate('./' + c.id, { replace: true })
                          }
                        >
                          <VisibilityOutlinedIcon />
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
