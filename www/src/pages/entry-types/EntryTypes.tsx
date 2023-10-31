import {
  onMount,
  onCleanup,
  createResource,
  createSignal,
  createEffect,
  Show,
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

const EntryTypes: Component = (): JSX.Element => {
  const [, setState] = appstate;

  const [result] = createResource(entryType.all);
  const entryTypes = () => {
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
              <TableCell>Code</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Unit</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entryTypes().map((c: any) => {
              return (
                <TableRow
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
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
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Show>
  );
};

export default EntryTypes;
