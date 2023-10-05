import type { Component, JSX } from 'solid-js';
import { Show, For } from 'solid-js';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  SvgIcon,
} from '@suid/material';

import { useNavigate } from '@solidjs/router';

import items from './items';

const listItem = (icon: any, text: string, path: string): JSX.Element => {
  const navigate = useNavigate();

  return (<ListItemButton onClick={() => navigate(path)}>
    <ListItemIcon>
      <Show when={true}>
      {icon}
      </Show>
    </ListItemIcon>
    <ListItemText primary={text} />
  </ListItemButton>);
};

const subheader = (text: string): JSX.Element => {
  return <>
    <Divider />
    <ListSubheader component="div" inset>
      {text}
    </ListSubheader>
  </>;
}

const ListItems: Component = () => {
  return (<For each={items}>
    {(item => {
      if (typeof item === 'string') {
        return subheader(item);
      }
      if (typeof item === 'object' && item !== null) {
        const paths = Object.keys(item);
        return (
          <For each={paths}>{(pathname => {
            const info = item[pathname];
            const [icon, text] = info;
            return listItem(icon, text, pathname);
          })}</For>
        );
      }
    })
    }
  </For>);
};

export default ListItems;
