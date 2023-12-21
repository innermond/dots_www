import { Box, FormControl, InputLabel, MenuItem, Select } from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { createSignal } from 'solid-js';

export default function ModeSearch() {
  const [mode, setMode] = createSignal(0);

  const handleChange = (event: SelectChangeEvent) => {
    setMode(Number(event.target.value));
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size="small" fullWidth>
        <InputLabel id="mode-filter-search-label">Mode</InputLabel>
        <Select
          labelId="mode-filter-search-label"
          id="mode-filter-search"
          value={mode()}
          defaultValue={0}
          label="Mode"
          onChange={handleChange}
        >
          <MenuItem value={0}>Starts</MenuItem>
          <MenuItem value={1}>Includes</MenuItem>
          <MenuItem value={2}>Ends</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
