import {
  onMount,
  createResource,
  Show,
  For,
  createSignal,
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
} from '@suid/material';
import { A } from '@solidjs/router';
import AddIcon from '@suid/icons-material/Add';

import { entryType } from '@/lib/api';
import appstate from '@/lib/app';
import {EntryTypeData} from './types';
import {Dynamic} from 'solid-js/web';
import {makeDialogSave} from '@/components/DialogSave';

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
    setState("currentPageTitle", "Entry types's list");
  });

  const addEntryTypeSignal = createSignal(false);
  const openDialogToAddEntryType = () => {
    addEntryTypeSignal[1](true);
  };

  const theme = useTheme();

  return (
    <>
      <Dynamic path="./EntryTypeAdd.tsx" title="Add entry type" textSave="Add" open={addEntryTypeSignal} component={makeDialogSave} />
      <Show when={result.state === 'ready'}>
        <TableContainer component={Paper}>
          <Stack direction="row" sx={{p: 1, display: 'flex', justifyContent: 'end', backgroundColor:theme.palette.grey[200] }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openDialogToAddEntryType}
            >
              Add Entry Type 
            </Button>
          </Stack>
          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow hover>
                <TableCell><Checkbox /></TableCell>
                <TableCell component="th">Code</TableCell>
                <TableCell component="th" align="right">Description</TableCell>
                <TableCell component="th" align="right">Unit</TableCell>
                <TableCell component="th" align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <For each={entryTypes()}>
                {(c: EntryTypeData) => {
                  return (
                    <TableRow>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>
                        {c.code}
                      </TableCell>
                      <TableCell align="right">{c.description}</TableCell>
                      <TableCell align="right">{c.unit}</TableCell>
                      <TableCell align="right">
                        <A href={'./' + c.id}>
                          Go to
                        </A>
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
