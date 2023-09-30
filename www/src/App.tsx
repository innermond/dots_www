import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Accessor, Component, JSX } from 'solid-js';
import { Match, Switch, ErrorBoundary, createSignal } from 'solid-js';
import { useRoutes, Router, useRouteData, Navigate, RouteDefinition } from '@solidjs/router';
import { Alert, Box, CircularProgress, CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import Dashboard from './pages/dashboard';
import LoginForm from './pages/login';
import Loading from './components/Loading';

import { defaultTheme } from './theme';

function TokenData() {
  const [token, setToken] = createSignal('');
  const key = 'dots.tok';
  const tok = sessionStorage.getItem(key);
  setToken(tok ?? '');
  return token;
}

function Guard(child: Component): Component {
  return  (): JSX.Element => {
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
  };
}

function Progress(): JSX.Element {
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

const routes: RouteDefinition[] = [
  {path: "/", component: Guard(Dashboard), data: TokenData},
  {path: "/login", component: LoginForm},
  {path: "/*", component: () => <Alert severity="warning">Not found</Alert>},
];

const App: Component = (): JSX.Element => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Routes />
        <Toaster />
        <Loading />
      </ThemeProvider>
    </Router>
  );
};

export default App;
