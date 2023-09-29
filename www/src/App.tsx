import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Accessor, Component } from 'solid-js';
import { Match, Switch, ErrorBoundary, createSignal } from 'solid-js';
import { Routes, Route, useRouteData, Navigate } from '@solidjs/router';
import { Alert, Box, CircularProgress, CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import Dashboard from './pages/dashboard/Dashboard';
import LoginForm from './pages/login/LoginForm';
import Loading from './components/Loading';

import { defaultTheme } from './theme';

function TokenData() {
  const [token, setToken] = createSignal('');
  const key = 'dots.tok';
  const tok = sessionStorage.getItem(key);
  setToken(tok ?? '');
  return token;
}

const App: Component = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={Guard(Dashboard)} data={TokenData} />
        <Route path="/login" component={LoginForm} />
        <Route
          path="/*"
          component={() => <Alert severity="warning">Not found</Alert>}
        />
      </Routes>
      <Toaster />
      <Loading />
    </ThemeProvider>
  );
};

export default App;

function Guard(child: Component) {
  const token: any = useRouteData();

  return (
    <ErrorBoundary
      fallback={err => <Alert severity="error">{err.message}</Alert>}
    >
      <Switch fallback={<Progress />}>
        <Match when={!!token()}>{child}</Match>
        <Match when={token() === ''}>
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
