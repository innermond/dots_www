import { Button, Popover, Stack, TextField } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListItemText from '@suid/material/ListItemText';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import Switch from '@suid/material/Switch';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import ToggleOnOutlinedIcon from '@suid/icons-material/ToggleOnOutlined';
import ToggleOffOutlinedIcon from '@suid/icons-material/ToggleOffOutlined';
import { For, batch, createMemo, createSignal, untrack } from 'solid-js';
import type { FilterProps, FilterState } from './types';
import { produce } from 'solid-js/store';

const FilterColumns = (props: FilterProps<FilterState>) => {
  // re-build its current state
  const initialColumns = props.state.initials;
  // visible after a search has been applied
  let visibles = [...props.state.items];
  const initialHidden = initialColumns.filter(
    (x: string) => !visibles.includes(x),
  );
  // show all columns when no search has been applied
  if (props.state.search === '') {
    visibles = initialColumns;
  } else {
    visibles = initialColumns.filter((x: string) =>
      x.includes(props.state.search),
    );
  }
  const [partColumns, setPartColumns] = createSignal(visibles);

  const [hiddenOrigin, setHidden] = createSignal(initialHidden);
  const hidden = createMemo(() => hiddenOrigin());

  const handleToggle = (value: string) => () => {
    const found = hidden().indexOf(value);
    const newHidden = [...hidden()];

    if (found === -1) {
      newHidden.push(value);
    } else {
      newHidden.splice(found, 1);
    }

    // hide hidden means
    setHidden(newHidden);
    // to show the rest of columns
    const visible = partColumns().filter((x: string) => !newHidden.includes(x));
    props.setState('items', visible);
  };

  const handleClose = () => {
    props.setState(
      produce((s: FilterState) => {
        s.anchor = undefined;
        s.open = false;
      }),
    );
  };

  const handleFilterReset = () => {
    batch(() => {
      setHidden([]);
      setPartColumns(initialColumns);
      props.setState('items', initialColumns);
      props.setState('search', '');
    });
  };

  const handleFilterRevert = () => {
    const reverted = props.state.items.filter(
      (x: string) => !hidden().includes(x),
    );
    const items = partColumns().filter((x: string) => hidden().includes(x));
    setHidden(reverted);
    props.setState('items', items);
  };

  const handleFilterChange = (evt: Event | null, value: string) => {
    props.setState('search', value);
    if (value === '') {
      const visible = initialColumns.filter(
        (x: string) => !hidden().includes(x),
      );
      props.setState('items', visible);
      setPartColumns(initialColumns);
      return;
    }
    untrack(() => {
      const found = initialColumns.filter((x: string) => x.includes(value));
      setPartColumns(found);
      const visible = found.filter((x: string) => !hidden().includes(x));
      props.setState('items', visible);
    });
  };

  const SubheaderWithCloseIcon = () => (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      {props.state.title ?? 'Hide items'}
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
            sx={{ pointerEvents: hidden()?.length ? 'all' : 'none' }}
            color={hidden()?.length ? 'primary' : 'secondary'}
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
          onChange={handleFilterChange}
          value={props.state.search}
          autoComplete="off"
        />
        <Stack direction="column" sx={{ maxHeight: 360, overflow: 'auto' }}>
          <For each={partColumns()}>
            {(item: string) => {
              const label = `switch-list-label-${item}`;
              return (
                <ListItem divider={true} dense>
                  <ListItemText id={label} primary={item} />
                  <Switch
                    size="small"
                    edge="end"
                    onChange={handleToggle(item)}
                    checked={hidden().indexOf(item) === -1}
                    inputProps={{
                      'aria-labelledby': 'switch-list-filtering-columns',
                    }}
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

export default FilterColumns;
