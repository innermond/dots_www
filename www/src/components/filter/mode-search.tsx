import { Box, FormControl, InputLabel, MenuItem, Select } from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { For } from 'solid-js';
import { produce } from 'solid-js/store';
import type {
  FilterSearchState,
  FilterSearchCriteria,
  FilterProps,
} from './types';

type ModeSearchProps = FilterProps<FilterSearchState> & {
  fieldName: string;
  keyValueMap: Array<[string, number | string]>;
};

export default function ModeSearch(props: ModeSearchProps) {
  const handleChange = (event: SelectChangeEvent) => {
    const mode = event.target.value;

    if (
      !Object.values(props.keyValueMap)
        .map(kv => kv[1])
        .includes(mode)
    ) {
      return;
    }

    if (!Object.keys(props.state).includes(props.fieldName)) {
      return;
    }

    if (!Object.keys(props.state[props.fieldName]).includes('mode')) {
      return;
    }

    props.setState(props.fieldName, 'mode', mode);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size="small" fullWidth>
        <InputLabel id="mode-filter-search-label">Mode</InputLabel>
        <Select
          labelId="mode-filter-search-label"
          id="mode-filter-search"
          value={props.state[props.fieldName]['mode']}
          label="Mode"
          onChange={handleChange}
        >
          <For each={props.keyValueMap}>
            {([k, v]) => <MenuItem value={v}>{k}</MenuItem>}
          </For>
        </Select>
      </FormControl>
    </Box>
  );
}
