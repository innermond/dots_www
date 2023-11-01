import {
  onMount,
  createResource,
  Show,
  For,
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
} from '@suid/material';
import { A } from '@solidjs/router';

import { entryType } from '@/lib/api';
import appstate from '@/lib/app';
import {EntryTypeData} from './types';

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

  return (
    <Show when={result.state === 'ready'}>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
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
                  <TableRow
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
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
  );
};

export default EntryTypes;
