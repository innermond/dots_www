import type { Component } from 'solid-js';
import { ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@suid/material';

import DashboardIcon from '@suid/icons-material/Dashboard';
import AssignmentIcon from '@suid/icons-material/Assignment';

export const MainListItems: Component = () => {
  return (
    <>
      <ListItemButton>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
    </>
  )
};

export const SecondaryListItems: Component = () => {
  return (
    <>
      <ListSubheader component="div" inset>
        Reports
      </ListSubheader>
      <ListItemButton>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Assignment" />
      </ListItemButton>
    </>
  )
};


