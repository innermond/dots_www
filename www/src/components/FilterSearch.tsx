import { Button, Popover, Stack, TextField } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import ToggleOnOutlinedIcon from '@suid/icons-material/ToggleOnOutlined';
import ToggleOffOutlinedIcon from '@suid/icons-material/ToggleOffOutlined';
import { Component, For, createMemo, createSignal } from 'solid-js';
import { SetStoreFunction, Store, produce } from 'solid-js/store';

type FilterState = {
  anchor: HTMLElement | null;
  open: boolean;
  title: string;
  items: string[];
  component: Component | null;
};

type FilterProps = {
  state: Store<FilterState>;
  setState: SetStoreFunction<FilterState>;
};

const FilterSearch = (props: FilterProps) => {
  const [checkedOrigin, setChecked] = createSignal([] as string[]);
  const checked = createMemo(() => checkedOrigin());

  const { state, setState } = props;

  const handleClose = () => {
    setState(
      produce((s: FilterState) => {
        s.anchor = null;
        s.open = false;
      }),
    );
  };

  const handleFilterReset = () => {
    handleChangeFilteringColumns(null, '');
  };

  const handleFilterRevert = () => {
    const reverted = state.items.filter((x: string) => !checked().includes(x));
    const items = state.items.filter((x: string) => checked().includes(x));
    setChecked(reverted);
    setState('items', items);
  };

  const [search, setSearch] = createSignal('');
  const handleChangeFilteringColumns = (evt: Event | null, value: string) => {
    setSearch(value);
    if (value === '') {
      setChecked([]);
      setState('items', state.items);
      return;
    }
    const found = state.items.filter((x: string) => x.includes(value));
    const reverted = state.items.filter((x: string) => !found.includes(x));
    setChecked(found);
    setState('items', reverted);
  };

  const SubheaderWithCloseIcon = () => (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      {state.title ?? 'Filter items'}
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
    <Popover open={state.open} anchorEl={state.anchor} onClose={handleClose}>
      <List
        sx={{ width: '100%', maxWidth: 360 }}
        subheader={
          <ListSubheader>
            <SubheaderWithCloseIcon />
          </ListSubheader>
        }
      >
        <Divider />
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ justifyContent: 'space-evenly' }}
        >
          <Button
            startIcon={<ToggleOnOutlinedIcon />}
            variant="text"
            onClick={handleFilterRevert}
          >
            Revert
          </Button>
          <Button
            sx={{ pointerEvents: checked()?.length ? 'all' : 'none' }}
            color={checked()?.length ? 'primary' : 'secondary'}
            startIcon={<ToggleOffOutlinedIcon />}
            variant="text"
            onClick={handleFilterReset}
          >
            Reset
          </Button>
        </Stack>
        <TextField
          id="filteringColumns"
          label="Search by name"
          variant="filled"
          size="small"
          onChange={handleChangeFilteringColumns}
          value={search()}
          autoComplete="off"
        />
        <Stack direction="column" sx={{ maxHeight: 360, overflow: 'auto' }}>
          <For each={state.items}>
            {(item: string) => {
              const id = `search-${item}`;
              return (
                <ListItem divider={true} dense>
                  <TextField
                    id={id}
                    label={item}
                    variant="filled"
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

export default FilterSearch;
