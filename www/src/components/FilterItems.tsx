import { Popover, Stack } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListItemText from '@suid/material/ListItemText';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import Switch from '@suid/material/Switch';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import { Accessor, For, Setter, createSignal } from 'solid-js';

type FilterItemsProps<Items> = {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;

  title?: string;

  items: Items;
  setItems: Setter<Items>;

  anchorEl: Accessor<HTMLButtonElement | null>;
  setAnchorEl: Setter<HTMLButtonElement | null>;
};

const FilterItems = <T extends string[]>(props: FilterItemsProps<T>) => {
  const [checked, setChecked] = createSignal([] as string[]);

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

  const SubheaderWithIcon = () => (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
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
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        subheader=<ListSubheader>
          <SubheaderWithIcon />
        </ListSubheader>
      >
        <Divider />
        <For each={props.items}>
          {(item: string) => {
            const label = `switch-list-label-${item}`;
            return (
              <ListItem>
                <ListItemText id={label} primary={item} />
                <Switch
                  edge="end"
                  onChange={handleToggle(item)}
                  checked={checked().indexOf(item) !== -1}
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-wifi',
                  }}
                />
              </ListItem>
            );
          }}
        </For>
      </List>
    </Popover>
  );
};

export default FilterItems;
