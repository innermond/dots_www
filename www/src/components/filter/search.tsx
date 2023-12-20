import { Popover, Stack, TextField } from '@suid/material';
import List from '@suid/material/List';
import ListItem from '@suid/material/ListItem';
import ListSubheader from '@suid/material/ListSubheader';
import Divider from '@suid/material/Divider';
import CloseIcon from '@suid/icons-material/Close';
import IconButton from '@suid/material/IconButton';
import { For } from 'solid-js';
import { produce } from 'solid-js/store';
import type { FilterProps, FilterState } from './types';

const FilterSearch = (props: FilterProps) => {
  const handleClose = () => {
    props.setState(
      produce((s: FilterState) => {
        s.anchor = null;
        s.open = false;
        s.kind = '';
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
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ justifyContent: 'space-evenly' }}
        ></Stack>
        <Stack direction="column" sx={{ maxHeight: 360, overflow: 'auto' }}>
          <For each={props.state.items}>
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
