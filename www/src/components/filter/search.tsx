import { Popover, Stack, TextField, useTheme, InputAdornment, FormControl, Input, InputLabel, Box, } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import ToggleButton from '@suid/material/ToggleButton';
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup';
import FilterAltIcon from '@suid/icons-material/FilterAlt';
import { JSX, For, createSignal, untrack, } from 'solid-js';
import { produce, createStore, } from 'solid-js/store';
import type {
  FilterProps,
  FilterState,
  FilterSearchCriteria,
  FilterSearchState,
} from './types';
import ModeSearch from './mode-search';
import { dispatch, } from '@/lib/customevent';
import ActionButton from '../ActionButton';
import {collectFormData} from '@/lib/form';

const theme = useTheme();
const [search, setSearch] = createSignal<string>();

const FilterSearch = (props: FilterProps<FilterState>) => {
  if (search() === undefined) {
    setSearch(props.state.search);
  }

  // re-build its current state
  const initialColumns = props.state.initials;
  // visible after a search has been applied
  let visibles = [...props.state.items];
  // show all columns when no search has been applied
  if (search() === '') {
    visibles = initialColumns;
  } else {
    visibles = initialColumns.filter((x: string) =>
      typeof search() !== 'string' ? true : x.includes(search() as string),
    );
  }

  const [partColumns, setPartColumns] = createSignal(visibles);

  const filterSearchCriteria = {
    mode: '0',
    value: '',
    order: '-1',
  } as FilterSearchCriteria;
  const filterSearchState = initialColumns.reduce(
    (acc: FilterSearchState, c: string) => {
      acc[c] = structuredClone(filterSearchCriteria);
      return acc;
    },
    {},
  );
  const [state, setState] = createStore<FilterSearchState>(filterSearchState);
  const handleValue = (field: string, evt: Event) => {
    if (!visibles.includes(field)) {
      return;
    }

    const { target } = evt;
    if (target === null || !('value' in target)) {
      return;
    }
    const value = (evt.target as HTMLInputElement).value;
    setState(
      produce((s: FilterSearchState) => {
        if (s[field as keyof typeof s] === undefined) {
          s[field as keyof typeof s] = { ...filterSearchCriteria };
        }
        s[field as keyof typeof s].value = value;
      }),
    );
  };

  const handleFilterChange = (evt: Event | null, value: string) => {
    setSearch(value);
    if (value === '') {
      setPartColumns(initialColumns);
      return;
    }
    untrack(() => {
      const found = initialColumns.filter((x: string) => x.includes(value));
      setPartColumns(found);
    });
  };

  const handleOrderChange =
    (fieldName: string) => (evt: Event | null, order: string) => {
      if (!Object.keys(state).includes(fieldName)) {
        return;
      }

      setState(fieldName, 'order', order);
    };

  const handleClose = () => {
    props.setState(
      produce((s: FilterState) => {
        s.anchor = undefined;
        s.open = false;
      }),
    );
    dispatch('dots:filter:SearchEntryType', search());
  };

  const handleSearch = (evt: Event) => {
    evt.preventDefault();
    if ( !!evt?.target && ! ('form' in evt!.target)) {
      return;
    }

    const names = ['search-code', 'search-description', 'search-unit', 'mode-filter-search-code', 'mode-filter-search-description', 'mode-filter-search-unit', 'order-code', 'order-description', 'order-unit', ];
    const form = (evt.target as HTMLFormElement).form;
    const collected = collectFormData(form, names);
    console.log(collected);
  };

  const SubheaderWithCloseIcon = () => (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      {props.state.title ?? 'Filter items'}
      <IconButton
        size="small"
        edge="start"
        onClick={handleClose}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
    </Stack>
  );

  return (
    <Popover
      open={props.state.open}
      anchorEl={props.state.anchor}
      onClose={handleClose}
    >
<Box
      component="form"
>
      <List
        sx={{ width: '100%', maxWidth: 360 }}
        subheader={
          <ListSubheader>
            <SubheaderWithCloseIcon />
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem divider={false} dense disablePadding>
        <FormControl
          fullWidth
          sx={{ m: theme.spacing(2)}}
          variant="filled"
          size="small"
          style={{background: theme.palette.grey[100]}}
         >
         <InputLabel for="filteringSearchColumns">Search by name</InputLabel>
         <Input
            id="filteringSearchColumns"
            onChange={handleFilterChange}
            value={search()}
            autoComplete="off"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  sx={{p:0, m:0,}}
                  aria-label="clear-filtering-search-columns"
                  edge="end"
                  onClick={() => handleFilterChange(null, '')}
                >
                  {search() ? <CloseIcon fontSize="small" /> : undefined}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        </ListItem>
          <For each={partColumns()}>
            {(item: string) => {
              const id = `search-${item}`;
              const orderid = `order-${item}`;
              return (
                <ListItem divider={false} dense>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={theme.spacing(1)}
                  >
                    <ModeSearch
                      fieldName={item}
                      keyValueMap={Object.entries({
                        starts: 0,
                        includes: 1,
                        ends: 2,
                      })}
                      state={state}
                      setState={setState}
                    />
                    <TextField
                      id={id}
                      name={id}
                      label={item}
                      size="small"
                      autoComplete="off"
                      onInput={[handleValue, item]}
                    />
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={state[item]['order']}
                      onChange={handleOrderChange(item)}
                    >
                      <ToggleButton value="1">
                        <ExpandLessIcon />
                      </ToggleButton>
                      <ToggleButton value="-1">
                        <ExpandMoreIcon />
                      </ToggleButton>
                      <Input type="hidden" value={state[item]['order']}  inputProps={{id: orderid, name: orderid}}/>
                    </ToggleButtonGroup>
                  </Stack>
                </ListItem>
              );
            }}
          </For>
      </List>
      <Box sx={{m: theme.spacing(2), display: 'flex', justifyContent: 'flex-end'}} >
        <ActionButton
          type="submit"
          size="large"
          variant="contained"
          startIcon={<FilterAltIcon />}
          onClick={handleSearch}
        >
          Apply Filters
        </ActionButton>
      </Box>
</Box>
    </Popover>
  );
};

export type { FilterState };
export default FilterSearch;
