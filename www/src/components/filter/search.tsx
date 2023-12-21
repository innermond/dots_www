import { Popover, Stack, TextField, useTheme } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import { For, createSignal, untrack } from 'solid-js';
import { produce, createStore, unwrap } from 'solid-js/store';
import type {
  FilterProps,
  FilterState,
  FilterSearchCriteria,
  FilterSearchState,
} from './types';
import ModeSearch from './mode-search';

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
    mode: 0,
    value: '',
    order: -1,
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
        console.log(unwrap(s));
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

  const handleClose = () => {
    props.setState(
      produce((s: FilterState) => {
        s.anchor = undefined;
        s.open = false;
      }),
    );
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
      <List
        sx={{ width: '100%', maxWidth: 360 }}
        subheader={
          <ListSubheader>
            <SubheaderWithCloseIcon />
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem divider={false} dense>
          <TextField
            sx={{ width: '100%' }}
            id="filteringSearchColumns"
            label="Search by name"
            variant="filled"
            size="small"
            onChange={handleFilterChange}
            value={search()}
            autoComplete="off"
          />
        </ListItem>
        <Stack direction="column" sx={{ maxHeight: 360, overflow: 'auto' }}>
          <For each={partColumns()}>
            {(item: string) => {
              const id = `search-${item}`;
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
                      label={item}
                      size="small"
                      autoComplete="off"
                      onInput={[handleValue, item]}
                    />
                    <Stack direction="column">
                      <IconButton
                        sx={{ height: theme.spacing(2), borderRadius: 0 }}
                      >
                        <ExpandLessIcon sx={{ fontSize: theme.spacing(3) }} />
                      </IconButton>
                      <IconButton
                        sx={{ height: theme.spacing(2), borderRadius: 0 }}
                      >
                        <ExpandMoreIcon sx={{ fontSize: theme.spacing(3) }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </ListItem>
              );
            }}
          </For>
        </Stack>
      </List>
    </Popover>
  );
};

export type { FilterState };
export default FilterSearch;
