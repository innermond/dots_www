import type { Component, JSX } from 'solid-js';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  List,
  Typography,
  Badge,
  Menu,
  MenuItem,
} from '@suid/material';
import MenuIcon from '@suid/icons-material/Menu';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import NotificationsIcon from '@suid/icons-material/Notifications';

import { Match, Show, Switch, createSignal } from 'solid-js';

import { defaultTheme as theme } from '../theme';
import { MainListItems, SecondaryListItems } from './ListItems';
import { Navigate, useRouteData } from '@solidjs/router';
import {AccountCircle} from '@suid/icons-material';

const drawerWidth: number = 240;

const Dashboard: Component = () => {
  const [open, setOpen] = createSignal(true);
  const toggleDrawer = () => {
    setOpen(!open());
  };

  const [anchorProfile, setAnchorProfile] = createSignal<null | HTMLElement>(null);
  const openProfile = () => Boolean(anchorProfile());
  const handleClose = () => setAnchorProfile(null);

  const handleMenuProfile = (evt: MouseEvent) => {
    if (!!evt.currentTarget) {
      setAnchorProfile(evt.currentTarget as HTMLElement);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="absolute"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open() && {
            marginLeft: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ marginRight: '36px', ...(open() && { display: 'none' }) }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            sx={{ flexGrow: 1, whiteSpace: 'nowrap' }}
          >
            Dashboard
          </Typography>
          <IconButton color="inherit" size="large" onclick={handleMenuProfile}>
            <AccountCircle />
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorProfile()}
            open={openProfile()}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open()}>
        <Box
          sx={{
            width: `${drawerWidth}px`,
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider sx={{ my: 1 }} />
          <List component="nav">
            <MainListItems />
            <Divider />
            <SecondaryListItems />
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard;
