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
import MenuIcon from '@suid/icons-material/Menu';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import Logout from '@suid/icons-material/Logout';

import { createSignal } from 'solid-js';

import { defaultTheme as theme } from '../../theme';
import { MainListItems, SecondaryListItems } from '../../components/ListItems';
import { useNavigate } from '@solidjs/router';

const drawerWidth: number = 240;

const Dashboard: Component = () => {
  const [open, setOpen] = createSignal(true);
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

  const navigate = useNavigate();

  const handleLogout = () => {
    const key = 'dots.tok';
    sessionStorage.removeItem(key);
    handleClose();
    navigate('/login');
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
