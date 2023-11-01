import type { Component, JSX } from 'solid-js';
import {
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

import ListItems from './ListItems';
import { getPathTitleMap } from './items';
import MenuItemSubmenu from '@/components/MenuItemSubmenu';
import type { CompanyData, DataCompanies } from '@/pages/company/types';
import { isCompanyData, isDataCompanies } from '@/pages/company/types';
import { ApiError, company } from '@/lib/api';

import appstate from '@/lib/app';
import { setLoading } from '@/components/Loading';
import toasting from '@/lib/toast';

declare module 'solid-js' {
  namespace JSX {
    interface CustomEvents {
      refetchItem: CustomEvent;
    }
  }
}

type ErrorResource = ApiError | Error;

const [ state, setState ] = appstate;

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
    const title = getPathTitleMap().get(pathname());
    if (title !== undefined) {
      setState("currentPageTitle", title);
    }
  });

  const navigate = useNavigate();
  const handleLogout = () => {
    const key = 'dots.tok';
    sessionStorage.removeItem(key);
    handleClose();
    navigate('/login');
  };

  const submenuAction = (e: unknown) => {
    if (!isCompanyData(e)) {
      toasting('data we got do no represent a company');
      return;
    }
    setState("currentPageTitle", '...');
    navigate(`/company/${(e as CompanyData).id}`);
  };

  const [companiesRes, { refetch }] = createResource(company.all);

  const refetchCompany = (evt: Event) => {
    evt.stopPropagation();
    toasting.remove();

    refetch();
  };

  // TODO adapted for errored case
  const companies = createMemo(() => {
    // guard
    if (!['ready', 'errored'].includes(companiesRes.state)) {
      return;
    }

    const info: DataCompanies | ErrorResource =
      companiesRes.error ?? companiesRes();
    // check most brutal error
    const isObject =
      info instanceof Object && !Array.isArray(info) && info !== null;
    if (!isObject) {
      toasting('cannot read data companies', 'error');
      return [new Error('reading error')];
    }

    // error from server
    if (info instanceof ApiError) {
      if (info.response.status === 401) {
        throw info;
      }
      toasting(info.message, 'error');
      // let it flow down
    } else if (info instanceof Error) {
      // error from client
      toasting(info.message, 'error');
      // cut it here
      return;
    }

    const companiesFromJSON: DataCompanies = { data: [], n: 0 };
    const errorparsing = [];
    try {
      if (!isDataCompanies(info)) {
        toasting("received list's companies may have errors", 'warning');
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
      toasting(err?.message ?? 'unexpected error occured', 'error');
      return [];
    } finally {
      if (errorparsing.length) {
        const errors = errorparsing.map(err => <p>{err}</p>);
        toasting(errors, 'error');
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
    const states = open() ? ['pending'] : ['pending', 'refreshing'];
    setLoading(states.includes(companiesRes.state));
  });

  const appbar: JSX.Element = (
    <AppBar position="sticky">
      <Toolbar sx={{ height: 'auto' }}>
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
          title={state.currentPageTitle}
          sx={{ flexGrow: 1, textTransform: 'capitalize' }}
        >
          {state.currentPageTitle ?? '...'}
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
      <List component="nav" on:refetchItem={refetchCompany}>
        <ListItems />
        <Divider />
        <MenuItemSubmenu<CompanyData>
          headtext="Companies"
          titlekey="longname"
          state={companiesRes.state}
          data={companies()}
          action={submenuAction}
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
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {appbar}
      {drawer}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
          rowGap: '3rem',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
