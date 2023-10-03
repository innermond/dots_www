import type { Component } from 'solid-js';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@suid/material';

import DashboardIcon from '@suid/icons-material/Dashboard';
import AssignmentIcon from '@suid/icons-material/Assignment';
import HeartBrokenOutlinedIcon from '@suid/icons-material/HeartBrokenOutlined';

import { useNavigate } from '@solidjs/router';


export const MainListItems: Component = () => {
  const navigate = useNavigate();
  return (
    <>
      <ListItemButton onClick={() => navigate('/')}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
    </>
  );
};

export const SecondaryListItems: Component = () => {
  const navigate = useNavigate();
  return (
    <>
      <ListSubheader component="div" inset>
        Reports
      </ListSubheader>
      <ListItemButton onClick={() => navigate('/assignment')}>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Assignment" />
      </ListItemButton>
      <ListItemButton onClick={() => navigate('42')}>
        <ListItemIcon>
          <HeartBrokenOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Not found" />
      </ListItemButton>
    </>
  );
};
