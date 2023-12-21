import { Popover, Stack, TextField } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import { For, createSignal, createMemo, untrack } from 'solid-js';
import { produce } from 'solid-js/store';
import type { FilterProps, FilterState } from './types';

const [search, setSearch] = createSignal<string>();

const FilterSearch = (props: FilterProps) => {
  if (search() === undefined) {
    setSearch(props.state.search);
  }

  // re-build its current state
  const initialColumns = props.state.initials;
  // visible after a search has been applied
  let visibles = [...props.state.items];
  const initialHidden = initialColumns.filter(
    (x: string) => !visibles.includes(x),
  );
  // show all columns when no search has been applied
  if (search() === '') {
    visibles = initialColumns;
  } else {
    visibles = initialColumns.filter((x: string) =>
      typeof search() !== 'string' ? true : x.includes(search() as string),
    );
  }

  const [partColumns, setPartColumns] = createSignal(visibles);
  const [hiddenOrigin] = createSignal(initialHidden);
  const hidden = createMemo(() => hiddenOrigin());

  const handleFilterChange = (evt: Event | null, value: string) => {
    setSearch(value);
    if (value === '') {
      const visible = initialColumns.filter(
        (x: string) => !hidden().includes(x),
      );
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
            id="filteringColumns"
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
                  <TextField
                    id={id}
                    label={item}
                    size="small"
                    //onChange={handleChangeFilteringColumns}
                    //value={search()}
                    autoComplete="off"
                  />
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
