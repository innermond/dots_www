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
  modeName?: string;
  keyValueMap: Array<[string, number | string]>;
};

export default function ModeSearch(props: ModeSearchProps) {
  const modeKey = props.modeName ?? 'mode';

  const handleChange = (event: SelectChangeEvent) => {
    const mode = event.target.value;

    if (
      !Object.values(props.keyValueMap)
        .map(kv => kv[1])
        .includes(mode)
    ) {
      return;
    }

    props.setState(
      produce((s: FilterSearchState) => {
        if (!(props.fieldName in s && modeKey in s[props.fieldName])) {
          return;
        }
        s[props.fieldName][modeKey as keyof FilterSearchCriteria] = mode;
      }),
    );
    console.log(props.state);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size="small" fullWidth>
        <InputLabel id="mode-filter-search-label">Mode</InputLabel>
        <Select
          labelId="mode-filter-search-label"
          id="mode-filter-search"
          value={
            props.state[props.fieldName as keyof typeof props.state][modeKey]
          }
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
