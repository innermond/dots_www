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
import { Accessor, For, Setter, createMemo, createSignal } from 'solid-js';

type FilterItemsProps = {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;

  title?: string;

  items: string[];
  setItems: Setter<string[]>;

  anchorEl: Accessor<HTMLButtonElement | null>;
  setAnchorEl: Setter<HTMLButtonElement | null>;
};

const FilterItems = (props: FilterItemsProps) => {
  const [checkedOrigin, setChecked] = createSignal([] as string[]);
  const checked = createMemo(() => checkedOrigin());

  const handleToggle = (value: string) => () => {
    const currentIndex = checked().indexOf(value);
    const newChecked = [...checked()];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    const excluded = props.items.filter((x: string) => !newChecked.includes(x));
    props.setItems(excluded);
  };

  const handleClose = () => {
    props.setAnchorEl(null);
    props.setOpen(false);
  };

  const handleFilterReset = () => {
    handleChangeFilteringColumns(null, '');
  };

  const handleFilterRevert = () => {
    const reverted = props.items.filter((x: string) => !checked().includes(x));
    const items = props.items.filter((x: string) => checked().includes(x));
    setChecked(reverted);
    props.setItems(items);
  };

  const [search, setSearch] = createSignal('');
  const handleChangeFilteringColumns = (evt: Event | null, value: string) => {
    setSearch(value);
    if (value === '') {
      setChecked([]);
      props.setItems(props.items);
      return;
    }
    const found = props.items.filter((x: string) => x.includes(value));
    const reverted = props.items.filter((x: string) => !found.includes(x));
    setChecked(found);
    props.setItems(reverted);
  };

  const SubheaderWithCloseIcon = () => (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      {props.title ?? 'Hide items'}
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
      open={props.open()}
      anchorEl={props.anchorEl()}
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
          <For each={props.items}>
            {(item: string) => {
              const label = `switch-list-label-${item}`;
              return (
                <ListItem divider={true} dense>
                  <ListItemText id={label} primary={item} />
                  <Switch
                    size="small"
                    edge="end"
                    onChange={handleToggle(item)}
                    checked={checked().indexOf(item) !== -1}
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

export default FilterItems;
