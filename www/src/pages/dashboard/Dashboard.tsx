import type { Component, JSX } from 'solid-js';
import {
  Alert,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from '@suid/material';
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from 'solid-js';
import MenuIcon from '@suid/icons-material/Menu';
import Logout from '@suid/icons-material/Logout';
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft';
import { useNavigate, useLocation, Outlet } from '@solidjs/router';
import { toast } from 'solid-toast';

import ListItems from './ListItems';
import { getPathTitleMap } from './items';
import MenuItemSubmenu from '../../components/MenuItemSubmenu';
import type { DataCompanies } from '../../pages/company/types';
import { isCompanyData, isDataCompanies } from '../../pages/company/types';
import { ApiError, company } from '../../lib/api';

import appstate from '../../lib/app';
import { setLoading } from '../../components/Loading';

type ErrorResource = ApiError | Error;

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

  const [companyRes, { refetch }] = createResource(company.all);

  // TODO adapted for errored case
  const companies = createMemo(() => {
    // guard
    if (!['ready', 'errored'].includes(companyRes.state)) {
      return;
    }

    const info: DataCompanies | ErrorResource =
      companyRes.error ?? companyRes();
    // check most brutal error
    const isObject =
      info instanceof Object && !Array.isArray(info) && info !== null;
    if (!isObject) {
      toast.custom(
        <Alert severity="error">{'cannot read data companies'}</Alert>,
      );
      return [new Error('reading error')];
    }

    // error from server
    if (info instanceof ApiError) {
      if (info.response.status === 401) {
        throw info;
      }
      toast.custom(<Alert severity="error">{info.message}</Alert>);
      // let it flow down
    } else if (info instanceof Error) {
      // error from client
      toast.custom(<Alert severity="error">{info.message}</Alert>);
      // cut it here
      return;
    }

    const companiesFromJSON: DataCompanies = { data: [], n: 0 };
    const errorparsing = [];
    try {
      if (!isDataCompanies(info)) {
        toast.custom(
          <Alert severity="error">
            {"received list's companies may have errors"}
          </Alert>,
        );
      }

      companiesFromJSON.n = 0 + (info as DataCompanies)['n'];
      // paranoid here: check info.data
      let inf = info?.data ?? [];
      // ensure only real arrays - avoid array-like object like a string
      if (!Array.isArray(inf)) {
        inf = [];
      }
      for (let c of inf) {
        if (isCompanyData(c)) {
          companiesFromJSON.data.push(c);
        } else {
          const msg = 'fail to read this';
          companiesFromJSON.data.push(new Error(msg));
          errorparsing.push(msg);
        }
      }
      companiesFromJSON.n = isNaN(companiesFromJSON.n)
        ? companiesFromJSON.data.length
        : companiesFromJSON.n;
    } catch (err: any) {
      toast.custom(
        <Alert severity="error">
          {err?.message ?? 'unexpected error occured'}
        </Alert>,
      );
      return [];
    } finally {
      if (errorparsing.length) {
        const errors = errorparsing.map(err => <p>{err}</p>);
        toast.custom(<Alert severity="error">{errors}</Alert>);
      }
    }

    const { data, n } = companiesFromJSON;
    const cc = n ? data : [];
    const withoutempty = cc.filter(
      (c: any) => !(Object.keys(c).length === 0 && c.constructor === Object),
    );
    return withoutempty;
  });

  createEffect(() => {
    setLoading(['pending', 'refreshing'].includes(companyRes.state));
  });

  const appbar: JSX.Element = (
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
          sx={{ flexGrow: 1, textTransform: 'capitalize' }}
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
  );

  const drawer: JSX.Element = (
    <Drawer
      variant="temporary"
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
        <Divider />
        <MenuItemSubmenu
          headtext="Companies"
          titlekey="longname"
          state={companyRes.state}
          data={companies()}
          refresh={refetch}
        />
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {appbar}
      {drawer}
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
