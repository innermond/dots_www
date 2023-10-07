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

import { company } from '../../lib/api';

import appstate from '../../lib/app';
const { setCurrentCompany } = appstate;
const Company: Component = (): JSX.Element => {
  const [change, setChange] = createSignal(false);
  const [result] = createResource(change, company.all);
  const companies = () => {
    const info = result();
    if (info instanceof Error || !info) {
      return [];
    }

    const { data, n } = info as any;
    return n ? data : [];
  };

  setChange(true);

  createEffect(() => {
    console.log(result(), result.state);
  });

  onMount(() => {
    console.log('Company mounted');
  });

  onCleanup(() => {
    console.log('Company cleaned up');
  });

  return (
    <Show when={result.state === 'ready'}>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Long name</TableCell>
              <TableCell align="right">RN</TableCell>
              <TableCell align="right">TIN</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies().map((c: any) => {
              return (
                <TableRow
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {c.longname}
                  </TableCell>
                  <TableCell align="right">{c.rn}</TableCell>
                  <TableCell align="right">{c.tin}</TableCell>
                  <TableCell align="right">
                    <A onClick={() => setCurrentCompany(c)} href={'./' + c.id}>
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

export default Company;
