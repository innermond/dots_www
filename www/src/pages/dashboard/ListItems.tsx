import type { Component, JSX } from 'solid-js';
import { Show, For } from 'solid-js';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@suid/material';

import { useNavigate } from '@solidjs/router';

import items from './items';
import appstate from '@/lib/app';

const listItem = (icon: any, text: string, path: string): JSX.Element => {
  const navigate = useNavigate();
  const [, setState] = appstate;

  return (
    <ListItemButton
      onClick={() => {
        setState('currentPageTitle', '...');
        navigate(path);
      }}
    >
      <ListItemIcon>
        <Show when={true}>{icon}</Show>
      </ListItemIcon>
      <ListItemText
        disableTypography={true}
        primary={<Typography variant="h5">{text}</Typography>}
      />
    </ListItemButton>
  );
};

const subheader = (text: string): JSX.Element => {
  return (
    <>
      <Divider />
      <ListSubheader component="div" inset>
        {text}
      </ListSubheader>
    </>
  );
};

const ListItems: Component = () => {
  return (
    <For each={items}>
      {item => {
        if (typeof item === 'string') {
          return subheader(item);
        }
        if (typeof item === 'object' && item !== null) {
          const paths = Object.keys(item);
          return (
            <For each={paths}>
              {pathname => {
                const info = item[pathname];
                const [icon, text] = info;
                return listItem(icon, text, pathname);
              }}
            </For>
          );
        }
      }}
    </For>
  );
};

export default ListItems;
