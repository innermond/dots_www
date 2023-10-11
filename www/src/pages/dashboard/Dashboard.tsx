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
import { useNavigate, Outlet, useLocation } from '@solidjs/router';
import { toast } from 'solid-toast';

import ListItems from './ListItems';
import { getPathTitleMap } from './items';
import MenuItemSubmenu from '../../components/MenuItemSubmenu';
import { CompanyData } from '../../pages/company/types';
import { company } from '../../lib/api';

import appstate from '../../lib/app';
import { setLoading } from '../../components/Loading';
const { currentPageTitle, setCurrentPageTitle } = appstate;

type DataCompanies = { data: CompanyData[]; n: number };

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

  const [companyRes] = createResource(company.all);
  const companies = createMemo(() => {
    // guard
    if (!['ready', 'errored'].includes(companyRes.state)) {
      return;
    }

    const info: any = companyRes();
    const isObject =
      info instanceof Object && !Array.isArray(info) && info !== null;
    if (!isObject) {
      toast.custom(
        <Alert severity="error">{'cannot read data companies'}</Alert>,
      );
      return [new Error('reading error')];
    }
    const companiesFromJSON: DataCompanies = { data: [], n: 0 };
    const errorparsing = [];
    try {
      companiesFromJSON.n = 0 + info['n'];
      for (let c of info['data']) {
        const id = Number(c['id']);
        let cfromjson: any = {
          id: isNaN(id) ? undefined : id,
          longname: c['longname'],
          rn: c['rn'],
          tin: c['tin'],
        };
        const kk = Object.keys(cfromjson);
        const kkstrong = kk.filter(k => (cfromjson as any)[k] !== undefined);
        if (kk.length !== kkstrong.length) {
          cfromjson = new Error(cfromjson?.longname ?? 'error reading data');
          errorparsing.push(cfromjson.message);
        }
        companiesFromJSON.data.push(cfromjson as any);
      }
      companiesFromJSON.n = isNaN(companiesFromJSON.n)
        ? companiesFromJSON.data.length
        : companiesFromJSON.n;
    } catch (err) {
      // TODO
      return [];
    } finally {
      if (errorparsing.length) {
        console.log(errorparsing);
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
    setLoading(companyRes.loading);
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
        <MenuItemSubmenu headtext="Companies" titlekey="longname" state={companyRes.state} data={companies()} />
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
