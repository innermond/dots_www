import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Component } from 'solid-js';
import {
  Match,
  Switch,
  createResource,
  ErrorBoundary,
  createSignal,
} from 'solid-js';
import { Routes, Route, useRouteData, Navigate } from '@solidjs/router';
import {
  Alert,
  Box,
  CircularProgress,
  CssBaseline,
} from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import Loading from './components/Loading';

import { defaultTheme } from './theme';

const fetchUser = async () => {
  return new Promise(resolve => setTimeout(() => resolve(false), 100));
};

function UserData() {
  const [user, setUser] = createSignal(false);
  setUser(!!sessionStorage.getItem("dots.tok"));
  return user;
}

const App: Component = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={Guard(Dashboard)} data={UserData} />
        <Route path="/login" component={LoginForm} />
      </Routes>
      <Toaster />
      <Loading />
    </ThemeProvider>
  );
};

export default App;

function Guard(child: Component) {
  const user: any = useRouteData();
  console.log(user());

  return (
    <ErrorBoundary
      fallback={err => <Alert severity="error">{err.message}</Alert>}
    >
      <Switch fallback={<Progress />}>
        <Match when={user()}>{child}</Match>
        <Match when={user() === false}>
          <Navigate href="/login" />
        </Match>
      </Switch>
    </ErrorBoundary>
  );
}

function Progress() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
