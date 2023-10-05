import {
  onMount,
  onCleanup,
  createResource,
  createSignal,
  createEffect,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { Box, FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";

import { company } from '../lib/api';
const Company: Component = (): JSX.Element => {
  
  const [change, setChange] = createSignal(false);
  const [companies] = createResource(change, company.all);
    createEffect(() => {
    console.log(companies());
    setChange(false);
    })

  onMount(() => {
    console.log('Company mounted');
  });

  onCleanup(() => {
    console.log('Company cleaned up');
  });
  
  const handleChange = (event: SelectChangeEvent) => {
    console.log(event.target.value);
    setChange(true);

  };

  return (
      <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={20}
          label="Age"
          onChange={handleChange}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Company;
