import {
  For,
  onMount,
  onCleanup,
  createResource,
  createSignal,
  createEffect,
  Switch,
  Show,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { Box, FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";

import { company } from '../lib/api';

const Company: Component = (): JSX.Element => {
  
  const [change, setChange] = createSignal(false);
  const [result] = createResource(change, company.all);
  const companies = () => {
    const info = result();
    if (info instanceof Error || !info) {
      return [];
    }

    const {data, n} = info as any;
    return n ? data : [];
  };

  setChange(true);

  createEffect(() => {
    console.log(result(), result.state);
  })

  onMount(() => {
    console.log('Company mounted');
  });

  onCleanup(() => {
    console.log('Company cleaned up');
  });
  
  const [valueOption, setValueOption] = createSignal("");

  const handleChange = (e: SelectChangeEvent) => {
    setValueOption(e.target.value);
  };

  return (
      <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Company</InputLabel>

<Show when={result.state === 'ready'}>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Company"
          value={valueOption()}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {companies().map((c:any) => {
            return <MenuItem value={c.id}>{c.longname}</MenuItem>;
          })}
        </Select>
</Show>
      </FormControl>
    </Box>
  );
};

export default Company;
