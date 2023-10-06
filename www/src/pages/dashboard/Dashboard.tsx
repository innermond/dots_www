import type { Component } from 'solid-js';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  List,
  ListItemIcon,
  Typography,
  Menu,
  MenuItem,
  Avatar,
} from '@suid/material';
import { createEffect, createMemo, createSignal } from 'solid-js';
import MenuIcon from '@suid/icons-material/Menu';
import Logout from '@suid/icons-material/Logout';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import { useNavigate, Outlet, useLocation } from '@solidjs/router';

import ListItems from './ListItems';
import  {getPathTitleMap} from './items';

import appstate from '../../lib/app';
const { currentPageTitle, setCurrentPageTitle } = appstate;

const drawerWidth: number = 240;

const Dashboard: Component = () => {
  const [open, setOpen] = createSignal(false);
  const toggleDrawer = () => {
    setOpen(!open());
  };

  const [anchorProfile, setAnchorProfile] = createSignal<null | HTMLElement>(
    null,
  );
  const openProfile = () => Boolean(anchorProfile());
  const handleClose = () => setAnchorProfile(null);

  const handleMenuProfile = (evt: MouseEvent) => {
    setAnchorProfile(evt.currentTarget as HTMLElement);
  };

  const location = useLocation();
  const pathname = createMemo(() => location.pathname);
  createEffect(() => {
    console.log(pathname());
    const title = getPathTitleMap().get(pathname() ?? 'DOTS');
    setCurrentPageTitle(title);
  });

  const navigate = useNavigate();
  const handleLogout = () => {
    const key = 'dots.tok';
    sessionStorage.removeItem(key);
    handleClose();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute">
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
            title={currentPageTitle()}
            sx={{ flexGrow: 1,  textTransform: 'capitalize', }}
          >
            {currentPageTitle()}
          </Typography>
          <IconButton color="inherit" size="large" onclick={handleMenuProfile}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
              }}
            >
              M
            </Avatar>
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorProfile()}
            open={openProfile()}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 0,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{
              horizontal: 'right',
              vertical: 'top',
            }}
            anchorOrigin={{
              horizontal: 'right',
              vertical: 'bottom',
            }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={open()}
        PaperProps={{
          sx: {
            width: `${drawerWidth}px`,
            position: 'relative',
          },
        }}
        onClick={toggleDrawer}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ my: 1 }} />
        <List component="nav">
          <ListItems />
        </List>
      </Drawer>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
