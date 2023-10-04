import type { Component, JSX } from 'solid-js';
import { Show, For } from 'solid-js';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@suid/material';

import DashboardIcon from '@suid/icons-material/Dashboard';
import AssignmentIcon from '@suid/icons-material/Assignment';
import HeartBrokenOutlinedIcon from '@suid/icons-material/HeartBrokenOutlined';

import { useNavigate, type Navigator } from '@solidjs/router';

type GetNav = {
  (): Navigator;
  instance?: Navigator;
 }
// TODO: using here const navigate = useNavigate() produces error
const  getNavigate: GetNav = (): Navigator => {
  if (!getNavigate?.instance) {
    getNavigate.instance = useNavigate();
  }
  return getNavigate.instance;
}

const listItem = (icon: any, text: string, path: string): JSX.Element => {
  console.log(icon, text, path);
  const navigate = getNavigate();
  return (<ListItemButton onClick={() => navigate(path)}>
    <ListItemIcon>
      <Show when={true}>
      {icon}
      </Show>
    </ListItemIcon>
    <ListItemText primary={text} />
  </ListItemButton>);
};

export const MainListItems: Component = () => {
  const items = [
    {
      icon: DashboardIcon,
      text: 'Dashboard',
      path: '/',
    },
    {
      icon: HeartBrokenOutlinedIcon,
      text: 'Not Found',
      path: '/42',
    },
  ];
  return (
    <>
      <For each={items}>{item => listItem(item.icon, item.text, item.path) }</For>
    </>
  );
};

export const SecondaryListItems: Component = () => {
  const items = [
    {
      icon: AssignmentIcon,
      text: 'Assignment',
      path: '/assignment',
    },
    {
      icon: HeartBrokenOutlinedIcon,
      text: 'Not Found',
      path: '/42',
    },
  ];

  return (
    <>
      <ListSubheader component="div" inset>
        Reports
      </ListSubheader>
      <For each={items}>{item => listItem(item.icon, item.text, item.path) }</For>
    </>
  );
  }
